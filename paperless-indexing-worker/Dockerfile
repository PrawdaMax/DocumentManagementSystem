FROM python:3.14-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/indexing_worker ./indexing_worker
USER nobody
CMD ["python", "-m", "indexing_worker.worker"]
