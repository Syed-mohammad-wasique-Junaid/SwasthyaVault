import os
import json
import requests
import pytesseract
from PIL import Image, ImageOps

from ai.prompts import SYSTEM_PROMPT

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"D:\tesseract ocr\tesseract.exe"


def extract_text(image_path: str):
    image_path = os.path.abspath(image_path)

    print("PATH:", image_path)

    with Image.open(image_path) as img:
        print("FORMAT:", img.format)
        print("MODE:", img.mode)

        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")

        text = pytesseract.image_to_string(img, lang="eng")

    return text.strip()


def generate_summary(ocr_text: str):

    prompt = f"""
{SYSTEM_PROMPT}

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