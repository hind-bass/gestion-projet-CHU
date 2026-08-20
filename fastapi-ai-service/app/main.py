from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import meetings, chat, internal

app = FastAPI(
    title="IT-CHU Manager - Module IA",
    description="API FastAPI pour le traitement NLP des réunions et l'assistant RAG",
    version="1.0.0"
)

# Configuration CORS pour autoriser l'application React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production (ex: ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusions des routeurs
app.include_router(meetings.router)
app.include_router(chat.router)
app.include_router(internal.router)

@app.get("/", tags=["Health Check"])
def health_check():
    return {
        "status": "ok",
        "message": "Module IA FastAPI opérationnel (Ollama)",
    }


@app.get("/health", tags=["Health Check"])
def health():
    return {"status": "ok"}