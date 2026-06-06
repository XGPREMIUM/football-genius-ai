from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    ai_provider: Literal["openai", "anthropic", "openrouter", "local"] = "openai"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    openrouter_api_key: str = ""
    openrouter_model: str = "openrouter/free"

    default_mode: str = "general"
    ai_temperature: float = 0.7
    ai_max_tokens: int = 4096
    api_port: int = 8000

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
