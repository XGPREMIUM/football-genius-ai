from __future__ import annotations

from typing import AsyncIterator

from football_ai.config import settings
from football_ai.prompts import build_system_prompt


class FootballGeniusAgent:
    def __init__(self, mode: str = "general"):
        self.mode = mode
        self.system_prompt = build_system_prompt(mode)
        self._openai_client = None
        self._openrouter_client = None
        self._anthropic_client = None

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

    def _build_messages(self, query: str, conversation_history: list[dict] | None = None) -> list[dict]:
        messages = [{"role": "system", "content": self.system_prompt}]
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({"role": "user", "content": query})
        return messages

    async def ask(self, query: str, conversation_history: list[dict] | None = None) -> str:
        provider = settings.ai_provider
        messages = self._build_messages(query, conversation_history)

        if provider == "openai":
            return await self._ask_openai(messages)
        elif provider == "openrouter":
            return await self._ask_openrouter(messages)
        elif provider == "anthropic":
            return await self._ask_anthropic(messages)
        else:
            return "[local mode] Respuesta simulada — configura OPENAI_API_KEY, ANTHROPIC_API_KEY u OPENROUTER_API_KEY en .env"

    async def ask_stream(
        self, query: str, conversation_history: list[dict] | None = None
    ) -> AsyncIterator[str]:
        provider = settings.ai_provider
        messages = self._build_messages(query, conversation_history)

        if provider == "openai":
            async for chunk in self._ask_openai_stream(messages):
                yield chunk
        elif provider == "openrouter":
            async for chunk in self._ask_openrouter_stream(messages):
                yield chunk
        elif provider == "anthropic":
            async for chunk in self._ask_anthropic_stream(messages):
                yield chunk
        else:
            yield "[local mode] Respuesta simulada — configura las API keys en .env"

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
