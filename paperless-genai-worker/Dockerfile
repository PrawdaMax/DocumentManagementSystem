FROM python:3.14-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/genai_worker ./genai_worker
USER nobody
CMD ["python", "-m", "genai_worker.worker"]
