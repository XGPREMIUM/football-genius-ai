from __future__ import annotations

import asyncio
import hashlib
import json
import time
from typing import AsyncIterator

from config import settings
from prompts import build_system_prompt


class FootballGeniusAgent:
    _cache: dict[str, tuple[float, str]] = {}
    CACHE_TTL = 3600

    def __init__(self, mode: str = "general"):
        self.mode = mode
        self.system_prompt = build_system_prompt(mode)
        self._openai_client = None
        self._openrouter_client = None
        self._anthropic_client = None
        self._conversation_history: list[dict] = []
        self._max_retries = 2

    @property
    def openai_client(self):
        if self._openai_client is None:
            from openai import AsyncOpenAI
            self._openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    @property
    def openrouter_client(self):
        if self._openrouter_client is None:
            from openai import AsyncOpenAI
            self._openrouter_client = AsyncOpenAI(
                api_key=settings.openrouter_api_key,
                base_url="https://openrouter.ai/api/v1",
            )
        return self._openrouter_client

    @property
    def anthropic_client(self):
        if self._anthropic_client is None:
            from anthropic import AsyncAnthropic
            self._anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        return self._anthropic_client

    def _cache_key(self, query: str, mode: str) -> str:
        raw = f"{mode}:{query.strip().lower()}"
        return hashlib.md5(raw.encode()).hexdigest()

    def _get_cached(self, query: str) -> str | None:
        key = self._cache_key(query, self.mode)
        entry = self._cache.get(key)
        if entry and (time.time() - entry[0]) < self.CACHE_TTL:
            return entry[1]
        return None

    def _set_cache(self, query: str, response: str):
        key = self._cache_key(query, self.mode)
        self._cache[key] = (time.time(), response)
        if len(self._cache) > 500:
            stale = [k for k, v in self._cache.items() if (time.time() - v[0]) > self.CACHE_TTL]
            for k in stale:
                del self._cache[k]

    def _build_messages(self, query: str, conversation_history: list[dict] | None = None) -> list[dict]:
        messages = [{"role": "system", "content": self.system_prompt}]
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({"role": "user", "content": query})
        return messages

    async def ask(self, query: str, conversation_history: list[dict] | None = None) -> str:
        cached = self._get_cached(query)
        if cached and not conversation_history:
            return cached

        if conversation_history:
            self._conversation_history = conversation_history

        provider = settings.ai_provider
        messages = self._build_messages(query, conversation_history)

        for attempt in range(self._max_retries + 1):
            try:
                if provider == "openai":
                    response = await asyncio.wait_for(self._ask_openai(messages), timeout=25)
                elif provider == "openrouter":
                    response = await asyncio.wait_for(self._ask_openrouter(messages), timeout=25)
                elif provider == "anthropic":
                    response = await asyncio.wait_for(self._ask_anthropic(messages), timeout=25)
                else:
                    return "[local mode] Respuesta simulada — configura OPENAI_API_KEY, ANTHROPIC_API_KEY u OPENROUTER_API_KEY en .env"

                if not conversation_history:
                    self._set_cache(query, response)
                return response

            except asyncio.TimeoutError:
                if attempt < self._max_retries:
                    await asyncio.sleep(1)
                    continue
                return "⏱️ Lo siento, la respuesta está tardando demasiado. Intenta de nuevo con una pregunta más concreta."

            except Exception as e:
                if attempt < self._max_retries:
                    await asyncio.sleep(1.5)
                    continue
                return f"❌ No pude procesar tu consulta ahora mismo. Detalle: {str(e)[:100]}"

        return "❌ Error inesperado. Intenta de nuevo."

    async def ask_stream(
        self, query: str, conversation_history: list[dict] | None = None
    ) -> AsyncIterator[str]:
        cached = self._get_cached(query)
        if cached and not conversation_history:
            yield cached
            return

        if conversation_history:
            self._conversation_history = conversation_history

        provider = settings.ai_provider
        messages = self._build_messages(query, conversation_history)

        for attempt in range(self._max_retries + 1):
            try:
                if provider == "openai":
                    chunks = []
                    async for chunk in self._ask_openai_stream(messages):
                        chunks.append(chunk)
                        yield chunk
                elif provider == "openrouter":
                    chunks = []
                    async for chunk in self._ask_openrouter_stream(messages):
                        chunks.append(chunk)
                        yield chunk
                elif provider == "anthropic":
                    chunks = []
                    async for chunk in self._ask_anthropic_stream(messages):
                        chunks.append(chunk)
                        yield chunk
                else:
                    yield "[local mode] Respuesta simulada — configura las API keys en .env"
                    return

                full = "".join(chunks)
                if not conversation_history:
                    self._set_cache(query, full)
                return

            except asyncio.TimeoutError:
                if attempt < self._max_retries:
                    yield "⏳..."
                    await asyncio.sleep(1)
                    continue
                yield "⏱️ La respuesta tardó demasiado. Intenta con una pregunta más concreta."
                return

            except Exception:
                if attempt < self._max_retries:
                    yield "🔄..."
                    await asyncio.sleep(1.5)
                    continue
                yield "❌ Error al obtener respuesta. Intenta de nuevo."
                return

    async def _ask_openrouter(self, messages: list[dict]) -> str:
        response = await self.openrouter_client.chat.completions.create(
            model=settings.openrouter_model,
            messages=messages,
            temperature=settings.ai_temperature,
            max_tokens=settings.ai_max_tokens,
        )
        return response.choices[0].message.content or ""

    async def _ask_openrouter_stream(self, messages: list[dict]) -> AsyncIterator[str]:
        stream = await self.openrouter_client.chat.completions.create(
            model=settings.openrouter_model,
            messages=messages,
            temperature=settings.ai_temperature,
            max_tokens=settings.ai_max_tokens,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    async def _ask_openai(self, messages: list[dict]) -> str:
        response = await self.openai_client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=settings.ai_temperature,
            max_tokens=settings.ai_max_tokens,
        )
        return response.choices[0].message.content or ""

    async def _ask_openai_stream(self, messages: list[dict]) -> AsyncIterator[str]:
        stream = await self.openai_client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=settings.ai_temperature,
            max_tokens=settings.ai_max_tokens,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    async def _ask_anthropic(self, messages: list[dict]) -> str:
        system_msg = messages[0]["content"]
        user_msgs = messages[1:]
        response = await self.anthropic_client.messages.create(
            model=settings.anthropic_model,
            system=system_msg,
            messages=user_msgs,
            temperature=settings.ai_temperature,
            max_tokens=settings.ai_max_tokens,
        )
        return response.content[0].text

    async def _ask_anthropic_stream(self, messages: list[dict]) -> AsyncIterator[str]:
        system_msg = messages[0]["content"]
        user_msgs = messages[1:]
        async with self.anthropic_client.messages.create(
            model=settings.anthropic_model,
            system=system_msg,
            messages=user_msgs,
            temperature=settings.ai_temperature,
            max_tokens=settings.ai_max_tokens,
            stream=True,
        ) as stream:
            async for event in stream:
                if event.type == "content_block_delta":
                    if event.delta.text:
                        yield event.delta.text

    def reset_mode(self, mode: str):
        self.mode = mode
        self.system_prompt = build_system_prompt(mode)
