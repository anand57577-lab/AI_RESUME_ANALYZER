from pydantic import BaseModel, Field


class AnalyzeResponse(BaseModel):
    predicted_category: str
    confidence_score: float = Field(ge=0, le=1)
    ats_score: float = Field(ge=0, le=100)
    extracted_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]
    cleaned_text_preview: str
