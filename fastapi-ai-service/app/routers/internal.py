import os

from fastapi import APIRouter, Header, HTTPException
from app.models.schemas import (
    InternalActionItem,
    InternalDecisionItem,
    InternalProcessRequest,
    InternalProcessResponse,
)
from app.services.cleaning import clean_transcript
from app.services.extractor import extract_decisions_and_tasks, extract_speakers
from app.services.llm_service import generate_meeting_summary

router = APIRouter(prefix="/internal", tags=["Internal Spring Boot"])

INTERNAL_TOKEN = os.getenv("IA_SERVICE_INTERNAL_TOKEN", "")


@router.post("/meetings/process", response_model=InternalProcessResponse)
def process_internal(
    payload: InternalProcessRequest,
    authorization: str | None = Header(default=None),
) -> InternalProcessResponse:
    if INTERNAL_TOKEN:
        expected = f"Bearer {INTERNAL_TOKEN}"
        if authorization != expected:
            raise HTTPException(status_code=401, detail="Jeton interne invalide.")
    if not payload.transcription.strip():
        raise HTTPException(status_code=400, detail="La transcription est vide.")

    cleaned_text = clean_transcript(payload.transcription)
    speakers = extract_speakers(cleaned_text)
    extracted = extract_decisions_and_tasks(cleaned_text)
    summary = generate_meeting_summary(
        speakers=speakers,
        decisions=extracted["decisions"],
        tasks=extracted["tasks"],
    )

    return InternalProcessResponse(
        resume=summary,
        actions=[
            InternalActionItem(
                texte=task["title"],
                intervenant=task.get("assignee"),
                date=task.get("due_date"),
            )
            for task in extracted["tasks"]
        ],
        decisions=[InternalDecisionItem(texte=item) for item in extracted["decisions"]],
    )
