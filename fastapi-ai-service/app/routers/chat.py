from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_engine import retrieve_context
from app.services.llm_service import generate_chat_response

router = APIRouter(
    prefix="/api/ai/chat",
    tags=["Chatbot RAG"]
)

@router.post("/", response_model=ChatResponse)
def chat_with_assistant(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="La question ne peut pas être vide.")

    # 1. Récupération du contexte avec contrôle d'accès RBAC
    context = retrieve_context(
        user_id=request.user_id,
        role=request.role,
        question=request.question
    )

    # 2. Règle de non-hallucination : Si aucun contexte BDD trouvé
    if context is None:
        return ChatResponse(
            answer="Désolé, aucune donnée pertinente n'a été trouvée dans le système pour répondre à votre question.",
            sources_count=0
        )

    # 3. Génération de la réponse via LLM avec contexte figé
    answer = generate_chat_response(
        question=request.question,
        context=context
    )

    sources_count = len(context.strip().split("\n"))

    return ChatResponse(
        answer=answer,
        sources_count=sources_count
    )