import json
import logging
import os

import pika

QUEUE = "ocr-queue"

log = logging.getLogger("ocr-worker")


def on_message(channel, method, properties, body):
    try:
        message = json.loads(body)
        document_id = message["documentId"]
        file_name = message["fileName"]
        log.info("Received OCR job for document %s (%s)", document_id, file_name)
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        log.exception("Discarding message %s", body)
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    logging.basicConfig(level="INFO", format="%(asctime)s %(levelname)s %(message)s")
    logging.getLogger("pika").setLevel("CRITICAL")

    url = os.environ["RABBITMQ_URL"]
    channel = pika.BlockingConnection(pika.URLParameters(url)).channel()
    channel.queue_declare(queue=QUEUE, durable=True)
    channel.basic_consume(queue=QUEUE, on_message_callback=on_message)

    log.info("Waiting for OCR jobs on queue %s", QUEUE)
    channel.start_consuming()


if __name__ == "__main__":
    main()
