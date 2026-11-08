import json
import logging
import os

import pika
import pytesseract
from minio import Minio
from pdf2image import convert_from_bytes

OCR_QUEUE = "ocr-queue"
RESULT_QUEUE = "ocr-result-queue"
BUCKET = "documents"
LANGUAGES = "deu+eng"

log = logging.getLogger("ocr-worker")


def extract_text(pdf, lang=LANGUAGES):
    """Wandelt jede PDF-Seite mit Poppler in ein Bild um und liest den Text mit Tesseract."""
    pages = convert_from_bytes(pdf, dpi=300)
    return "\n\n".join(pytesseract.image_to_string(page, lang=lang).strip() for page in pages)


class OcrWorker:
    def __init__(self, storage):
        self.storage = storage

    def load_pdf(self, object_key):
        response = self.storage.get_object(BUCKET, object_key)
        try:
            return response.read()
        finally:
            response.close()
            response.release_conn()

    def on_message(self, channel, method, properties, body):
        try:
            message = json.loads(body)
            document_id = message["documentId"]
            object_key = message["objectKey"]
            log.info("Received OCR job for document %s (%s)", document_id, object_key)

            content = extract_text(self.load_pdf(object_key))
            result = {"documentId": document_id, "content": content}
            channel.basic_publish(
                exchange="",
                routing_key=RESULT_QUEUE,
                body=json.dumps(result),
                properties=pika.BasicProperties(content_type="application/json", delivery_mode=2),
            )
            log.info("Sent OCR result for document %s (%d characters)", document_id, len(content))
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            log.exception("Discarding message %s", body)
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    logging.basicConfig(level="INFO", format="%(asctime)s %(levelname)s %(message)s")
    logging.getLogger("pika").setLevel("CRITICAL")

    storage = Minio(
        os.environ["RUSTFS_ENDPOINT"],
        access_key=os.environ["RUSTFS_ACCESS_KEY"],
        secret_key=os.environ["RUSTFS_SECRET_KEY"],
        secure=False,
    )
    worker = OcrWorker(storage)

    parameters = pika.URLParameters(os.environ["RABBITMQ_URL"])
    # OCR blockiert den Thread, bei großen PDFs länger als der Standard-Heartbeat von 60 s
    parameters.heartbeat = 600
    channel = pika.BlockingConnection(parameters).channel()
    channel.queue_declare(queue=OCR_QUEUE, durable=True)
    channel.queue_declare(queue=RESULT_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=OCR_QUEUE, on_message_callback=worker.on_message)

    log.info("Waiting for OCR jobs on queue %s", OCR_QUEUE)
    channel.start_consuming()


if __name__ == "__main__":
    main()
