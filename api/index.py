from fastapi import FastAPI

app = FastAPI(title="Football Genius API")


@app.get("/")
async def root():
    return {"name": "Football Genius AI", "status": "ok"}


@app.get("/modes")
async def list_modes():
    return {"modes": ["general", "scout", "tactical", "goat"]}


@app.post("/ask")
async def ask():
    return {"response": "Funciona en Vercel!", "mode": "general"}
