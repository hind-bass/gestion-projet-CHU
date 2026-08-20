from pydantic import BaseModel
from typing import List, Optional, Union

# --- SCHÉMAS POUR LE TRAITEMENT DES RÉUNIONS ---

class MeetingProcessRequest(BaseModel):
    project_id: Optional[Union[int, str]] = None  # Accepte int (ex: 1) ou str (ex: "PRJ-CHU-01")
    transcription: str

class TaskExtracted(BaseModel):
    id: Optional[str] = None                       # ex: "AI-101"
    title: str
    assignee: Optional[str] = "Non assigné"
    due_date: Optional[str] = None                 # Format YYYY-MM-DD
    priority: Optional[str] = "MOYENNE"            # HAUTE, MOYENNE, BASSE
    confidence: Optional[int] = 90                 # Score de confiance IA (0-100)
    skills: Optional[List[str]] = []              # Liste des compétences détectées (ex: ["FastAPI", "React"])
    status_validation: Optional[str] = "EN_ATTENTE" # Statut de la tâche

class MeetingProcessResponse(BaseModel):
    summary: str
    decisions: List[str]
    suggested_tasks: List[TaskExtracted]
    speakers: List[str]


# --- SCHÉMAS POUR LE CHATBOT RAG ---

class ChatRequest(BaseModel):
    user_id: int
    role: str  # "ADMIN" ou "MEMBRE"
    question: str

class ChatResponse(BaseModel):
    answer: str
 