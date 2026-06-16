import io
import re
from typing import Optional

from docx import Document
from pypdf import PdfReader


def extract_text_from_pdf(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


def extract_text_from_docx(content: bytes) -> str:
    document = Document(io.BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def extract_text_from_file(content: bytes, filename: str) -> str:
    lower_name = filename.lower()

    if lower_name.endswith(".pdf"):
        return extract_text_from_pdf(content)
    if lower_name.endswith(".docx"):
        return extract_text_from_docx(content)
    if lower_name.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")

    raise ValueError("Unsupported file type. Upload a PDF, DOCX, or TXT resume.")


def clean_resume_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"[^\w\s@.+#-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()
