import re

def clean_transcript(raw_text: str) -> str:
    if not raw_text:
        return ""
    
    # 1. Normaliser les saut de lignes
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    
    # 2. Supprimer les espaces multiples consécutifs
    text = re.sub(r'[ \t]+', ' ', text)
    
    # 3. Nettoyer les espaces en début/fin de ligne
    lines = [line.strip() for line in text.split('\n')]
    
    # 4. Recomposer le texte en ignorant les lignes vides successives
    cleaned_text = "\n".join([line for line in lines if line])
    
    return cleaned_text