from __future__ import annotations

import asyncio
import logging
import os
import sys
import threading

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from agent import FootballGeniusAgent
from config import settings
from db import init_db
from prompts import MODE_DESCRIPTIONS, get_available_modes
from seed_data import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PORT = int(os.environ.get("PORT", 10000))
STREAMLIT_PORT = PORT + 1

init_db()
seed_database()
agent = FootballGeniusAgent(mode=settings.default_mode)

app = FastAPI(title="Football Genius AI - Combined")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

streamlit_ready = threading.Event()


def start_streamlit():
    from streamlit.web import cli as st_cli

    sys.argv = [
        "streamlit",
        "run",
        os.path.join(os.path.dirname(__file__), "streamlit_app.py"),
        "--server.port",
        str(STREAMLIT_PORT),
        "--server.headless",
        "true",
        "--server.address",
        "0.0.0.0",
        "--server.enableCORS",
        "false",
        "--server.enableXsrfProtection",
        "false",
        "--global.developmentMode",
        "false",
    ]
    try:
        st_cli.main()
    except SystemExit:
        pass


threading.Thread(target=start_streamlit, daemon=True).start()


@app.on_event("startup")
async def wait_for_streamlit():
    for i in range(30):
        try:
            async with httpx.AsyncClient() as c:
                r = await c.get(f"http://127.0.0.1:{STREAMLIT_PORT}")
                if r.status_code < 500:
                    streamlit_ready.set()
                    logger.info(f"Streamlit ready on port {STREAMLIT_PORT}")
                    return
        except Exception:
            pass
        await asyncio.sleep(1)
    logger.warning("Streamlit did not become ready, proxy will retry on each request")


@app.post("/ask")
async def ask_question(request: Request):
    body = await request.json()
    mode = body.get("mode", settings.default_mode)
    query = body.get("query", "")
    if mode not in get_available_modes():
        raise HTTPException(status_code=400, detail=f"Modo '{mode}' no válido")
    agent.reset_mode(mode)
    response = await agent.ask(query)
    return {"response": response, "mode": mode}


@app.get("/modes")
async def list_modes():
    return {m: {"icon": i, "description": d} for m, (i, d) in MODE_DESCRIPTIONS.items()}


client = httpx.AsyncClient(timeout=300)


@app.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
)
async def proxy_http(request: Request, path: str):
    if not streamlit_ready.is_set():
        return JSONResponse({"error": "Streamlit still starting, retry in a few seconds"}, status_code=503)
    url = (
        f"http://127.0.0.1:{STREAMLIT_PORT}"
        if not path
        else f"http://127.0.0.1:{STREAMLIT_PORT}/{path}"
    )
    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    try:
        resp = await client.request(request.method, url, headers=headers, content=body)
        return StreamingResponse(
            resp.aiter_bytes(),
            status_code=resp.status_code,
            headers=dict(resp.headers),
        )
    except Exception as e:
        return JSONResponse({"error": f"Proxy error: {e}"}, status_code=502)


@app.websocket("/{path:path}")
async def proxy_ws(websocket: WebSocket, path: str):
    await websocket.accept()
    try:
        import websockets

        uri = f"ws://127.0.0.1:{STREAMLIT_PORT}/{path}"
        async with websockets.connect(uri) as ws:

            async def fwd_client():
                while True:
                    try:
                        data = await websocket.receive_text()
                        await ws.send(data)
                    except WebSocketDisconnect:
                        break

            async def fwd_server():
                while True:
                    try:
                        data = await ws.recv()
                        await websocket.send_text(data)
                    except websockets.ConnectionClosed:
                        break

            await asyncio.gather(fwd_client(), fwd_server())
    except ImportError:
        await websocket.close(1011, "WebSocket proxy unavailable (websockets not installed)")
    except Exception as e:
        await websocket.close(1011, str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
