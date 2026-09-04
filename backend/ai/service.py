import os
import json
import requests
import pytesseract
from PIL import Image

from ai.prompts import SYSTEM_PROMPT

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"D:\tesseract ocr\tesseract.exe"


def extract_text(image_path: str):

    if not os.path.exists(image_path):
        raise FileNotFoundError(image_path)

    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)

    return text.strip()


def generate_summary(ocr_text: str):

    prompt = f"""{SYSTEM_PROMPT}

OCR TEXT:
{ocr_text}
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()

    return json.loads(result["response"])