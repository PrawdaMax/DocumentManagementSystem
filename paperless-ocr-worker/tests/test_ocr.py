"""Echter OCR-Test mit Poppler und Tesseract, ohne Mocks.

Lokal wird er übersprungen, wenn die Programme fehlen. In der CI (CI=true) läuft er immer.
"""
import io
import os
import shutil

import pytest
from PIL import Image, ImageDraw, ImageFont

from ocr_worker.worker import extract_text

pytestmark = pytest.mark.skipif(
    not os.environ.get("CI") and not (shutil.which("tesseract") and shutil.which("pdftoppm")),
    reason="tesseract and poppler-utils are required",
)


def make_pdf(*page_texts):
    font = ImageFont.load_default(size=80)
    pages = []
    for text in page_texts:
        page = Image.new("RGB", (1240, 1754), "white")  # A4 mit 150 dpi
        ImageDraw.Draw(page).text((100, 200), text, fill="black", font=font)
        pages.append(page)
    pdf = io.BytesIO()
    pages[0].save(pdf, format="PDF", save_all=True, append_images=pages[1:], resolution=150)
    return pdf.getvalue()


def test_extract_text_reads_text_from_pdf():
    text = extract_text(make_pdf("Hello World"), lang="eng")

    assert "Hello World" in text


def test_extract_text_reads_every_page():
    text = extract_text(make_pdf("First page", "Second page"), lang="eng")

    assert "First page" in text
    assert "Second page" in text
