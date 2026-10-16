FROM python:3.14-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ocr_worker ./ocr_worker
USER nobody
CMD ["python", "-m", "ocr_worker.worker"]
