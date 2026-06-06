from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import FootballGeniusAgent
from config import settings
from prompts import MODE_DESCRIPTIONS, get_available_modes

agent = FootballGeniusAgent(mode=settings.default_mode)


class QueryRequest(BaseModel):
    query: str
    mode: str = settings.default_mode
    stream: bool = False


class QueryResponse(BaseModel):
    response: str
    mode: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent
    agent = FootballGeniusAgent(mode=settings.default_mode)
    yield


app = FastAPI(
    title="Football Genius AI API",
    description="API de la inteligencia artificial especializada en fútbol",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "Football Genius AI",
        "version": "1.0.0",
        "slogan": "No hablamos de fútbol. Vivimos dentro del fútbol.",
        "modes": list(MODE_DESCRIPTIONS.keys()),
    }


@app.get("/modes")
async def list_modes():
    return {
        mode: {"icon": icon, "description": desc}
        for mode, (icon, desc) in MODE_DESCRIPTIONS.items()
    }


@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    if request.mode not in get_available_modes():
        raise HTTPException(
            status_code=400,
            detail=f"Modo '{request.mode}' no válido. Usa: {', '.join(get_available_modes())}",
        )

    agent.reset_mode(request.mode)
    response = await agent.ask(request.query)

    return QueryResponse(response=response, mode=request.mode)


def run_server():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.api_port)
