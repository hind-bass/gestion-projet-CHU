from fastapi import APIRouter, HTTPException, status
from app.models.schemas import MeetingProcessRequest, MeetingProcessResponse, TaskExtracted
from app.services.cleaning import clean_transcript
from app.services.extractor import extract_speakers, extract_decisions_and_tasks
from app.services.llm_service import generate_meeting_summary

router = APIRouter(
    prefix="/api/ai/meetings",
    tags=["Meetings AI"]
)

@router.post("/process", response_model=MeetingProcessResponse)
def process_meeting(request: MeetingProcessRequest):
    if not request.transcription.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La transcription ne peut pas être vide."
        )

    # 1. Nettoyage de la transcription
    cleaned_text = clean_transcript(request.transcription)

    # 2. Extraction déterministe (Intervenants, Décisions, Tâches enrichies)
    speakers = extract_speakers(cleaned_text)
    extracted_data = extract_decisions_and_tasks(cleaned_text)

    # 3. Génération du résumé final via le LLM (ou fallback déterministe)
    summary = generate_meeting_summary(
        speakers=speakers, 
        decisions=extracted_data["decisions"], 
        tasks=extracted_data["tasks"]
    )

    # 4. Formatage des tâches vers le schéma Pydantic enrichi
    suggested_tasks = [
        TaskExtracted(
            id=t.get("id"),
            title=t["title"],
            assignee=t.get("assignee", "Non assigné"),
            due_date=t.get("due_date"),
            priority=t.get("priority", "MOYENNE"),
            confidence=t.get("confidence", 90),
            skills=t.get("skills", []),
            status_validation=t.get("status_validation", "EN_ATTENTE")
        )
        for t in extracted_data["tasks"]
    ]

    return MeetingProcessResponse(
        summary=summary,
        decisions=extracted_data["decisions"],
        suggested_tasks=suggested_tasks,
        speakers=speakers
    )