import json
import logging
import os

import pika
from google import genai
from google.genai import errors, types

GENAI_QUEUE = "genai-queue"
RESULT_QUEUE = "genai-result-queue"
MAX_CHARS = 50_000
PROMPT = (
    "Summarize the following document in 3 to 5 sentences. "
    "Write in the language of the document and return plain text only.\n\n"
)

log = logging.getLogger("genai-worker")


class GenAiWorker:
    def __init__(self, client, model):
        self.client = client
        self.model = model

    def summarize(self, text):
        response = self.client.models.generate_content(model=self.model, contents=PROMPT + text[:MAX_CHARS])
        if not response.text:
            raise ValueError("Gemini returned no text")
        return response.text.strip()

    def on_message(self, channel, method, properties, body):
        try:
            message = json.loads(body)
            document_id = message["documentId"]
            content = message["content"]
        except Exception:
            log.exception("Discarding message %s", body)
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        log.info("Summarizing document %s (%d characters)", document_id, len(content))
        result = {"documentId": document_id, "summary": None, "error": None}
        try:
            result["summary"] = self.summarize(content)
            log.info("Summary for document %s generated", document_id)
        except errors.APIError as e:
            log.exception("Gemini request for document %s failed", document_id)
            result["error"] = f"Gemini error {e.code}: {e.message}"
        except Exception:
            log.exception("Summary for document %s failed", document_id)
            result["error"] = "Summary could not be generated"

        channel.basic_publish(
            exchange="",
            routing_key=RESULT_QUEUE,
            body=json.dumps(result),
            properties=pika.BasicProperties(content_type="application/json", delivery_mode=2),
        )
        channel.basic_ack(delivery_tag=method.delivery_tag)


def main():
    logging.basicConfig(level="INFO", format="%(asctime)s %(levelname)s %(message)s")
    logging.getLogger("pika").setLevel("CRITICAL")
    logging.getLogger("google_genai").setLevel("WARNING")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        log.error("GEMINI_API_KEY is not set, every summary will fail")
    client = genai.Client(
        api_key=api_key or "not-set",
        http_options=types.HttpOptions(timeout=60_000, retry_options=types.HttpRetryOptions(attempts=3)),
    )
    worker = GenAiWorker(client, os.environ["GEMINI_MODEL"])

    parameters = pika.URLParameters(os.environ["RABBITMQ_URL"])
    parameters.heartbeat = 600
    channel = pika.BlockingConnection(parameters).channel()
    channel.queue_declare(queue=GENAI_QUEUE, durable=True)
    channel.queue_declare(queue=RESULT_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=GENAI_QUEUE, on_message_callback=worker.on_message)

    log.info("Waiting for summary jobs on queue %s", GENAI_QUEUE)
    channel.start_consuming()


if __name__ == "__main__":
    main()
