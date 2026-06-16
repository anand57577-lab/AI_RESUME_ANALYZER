import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from schemas import AnalyzeResponse
from services.extractor import clean_resume_text, extract_text_from_file
from services.model_loader import predict_category
from services.nlp import (
    build_recommendations,
    compute_ats_score,
    extract_skills,
    get_missing_skills,
)

load_dotenv()

app = FastAPI(
    title="Resume Screening API",
    description="NLP-powered resume analysis for portfolio demo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    model_path = Path(os.getenv("MODEL_PATH", "./models/best_model.pkl"))
    tfidf_path = Path(os.getenv("TFIDF_PATH", "./models/tfidf.pkl"))

    return {
        "status": "ok",
        "model_loaded": model_path.exists(),
        "tfidf_loaded": tfidf_path.exists(),
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    allowed_extensions = (".pdf", ".docx", ".txt")
    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload PDF, DOCX, or TXT.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 10MB.")

    try:
        raw_text = extract_text_from_file(content, file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to read resume: {exc}") from exc

    cleaned_text = clean_resume_text(raw_text)
    if len(cleaned_text.split()) < 20:
        raise HTTPException(
            status_code=422,
            detail="Could not extract enough text from the resume. Try a different file.",
        )

    try:
        predicted_category, confidence = predict_category(cleaned_text)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {exc}") from exc

    extracted_skills = extract_skills(cleaned_text)
    missing_skills = get_missing_skills(predicted_category, extracted_skills)
    ats_score = compute_ats_score(cleaned_text, extracted_skills, missing_skills)
    recommendations = build_recommendations(
        predicted_category,
        confidence,
        ats_score,
        missing_skills,
        len(cleaned_text.split()),
    )

    preview_words = cleaned_text.split()[:40]
    preview = " ".join(preview_words)
    if len(cleaned_text.split()) > 40:
        preview += "..."

    return AnalyzeResponse(
        predicted_category=predicted_category,
        confidence_score=confidence,
        ats_score=ats_score,
        extracted_skills=extracted_skills,
        missing_skills=missing_skills,
        recommendations=recommendations,
        cleaned_text_preview=preview,
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
