import logging
import time

from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_engine import retrieve_context
from app.services.llm_service import generate_chat_response

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ai/chat",
    tags=["Chatbot RAG"]
)

NO_DATA_ANSWER = (
    "Désolé, aucune donnée pertinente n'a été trouvée dans le système pour répondre à votre question."
)


@router.post("/", response_model=ChatResponse)
def chat_with_assistant(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="La question ne peut pas être vide.")

    started = time.perf_counter()
    logger.info("Chat reception user_id=%s question_len=%s", request.user_id, len(request.question))

    result = retrieve_context(
        user_id=request.user_id,
        role=request.role,
        question=request.question
    )
    status = (result.get("status") or "").upper()

    if status == "GREETING":
        logger.info("Chat greeting duration_ms=%.0f", (time.perf_counter() - started) * 1000)
        return ChatResponse(answer=result.get("answer") or "Bonjour.")

    if status == "NO_INTENT":
        logger.info("Chat no_intent duration_ms=%.0f", (time.perf_counter() - started) * 1000)
        return ChatResponse(answer=NO_DATA_ANSWER)

    if status == "NOT_FOUND":
        logger.info("Chat not_found duration_ms=%.0f", (time.perf_counter() - started) * 1000)
        return ChatResponse(answer=result.get("context") or NO_DATA_ANSWER)

    if status == "ERROR":
        logger.warning("Chat spring_error duration_ms=%.0f", (time.perf_counter() - started) * 1000)
        return ChatResponse(
            answer=result.get("context")
            or "Le service applicatif est temporairement indisponible. Réessayez plus tard."
        )

    context = result.get("context")
    if status != "FOUND" or not context:
        logger.info("Chat empty_context duration_ms=%.0f", (time.perf_counter() - started) * 1000)
        return ChatResponse(answer=NO_DATA_ANSWER)

    logger.info(
        "Chat appel Ollama sources=%s",
        result.get("sources_count", 0),
    )
    ollama_started = time.perf_counter()
    answer = generate_chat_response(
        question=request.question,
        context=context
    )
    logger.info("Chat Ollama duration_ms=%.0f", (time.perf_counter() - ollama_started) * 1000)
    logger.info("Chat total duration_ms=%.0f", (time.perf_counter() - started) * 1000)

    return ChatResponse(answer=answer)
