import json
import logging
import os

import pika
from elasticsearch import Elasticsearch

INDEX_QUEUE = "index-queue"
INDEX = "documents"

log = logging.getLogger("indexing-worker")


class IndexingWorker:
    def __init__(self, elasticsearch):
        self.elasticsearch = elasticsearch

    def on_message(self, channel, method, properties, body):
        try:
            message = json.loads(body)
            document_id = message["documentId"]
            document = {
                "documentId": document_id,
                "title": message["title"],
                "fileName": message.get("fileName"),
                "content": message["content"],
            }
            log.info("Indexing document %s", document_id)
            # Die Dokument-ID als Elasticsearch-ID: Ein zweiter Auftrag überschreibt den alten Eintrag
            self.elasticsearch.index(index=INDEX, id=str(document_id), document=document)
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            log.exception("Discarding message %s", body)
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    logging.basicConfig(level="INFO", format="%(asctime)s %(levelname)s %(message)s")
    logging.getLogger("pika").setLevel("CRITICAL")
    logging.getLogger("elastic_transport").setLevel("WARNING")

    worker = IndexingWorker(Elasticsearch(os.environ["ELASTICSEARCH_URL"]))

    channel = pika.BlockingConnection(pika.URLParameters(os.environ["RABBITMQ_URL"])).channel()
    channel.queue_declare(queue=INDEX_QUEUE, durable=True)
    channel.basic_consume(queue=INDEX_QUEUE, on_message_callback=worker.on_message)

    log.info("Waiting for index jobs on queue %s", INDEX_QUEUE)
    channel.start_consuming()


if __name__ == "__main__":
    main()
