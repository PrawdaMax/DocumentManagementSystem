from unittest.mock import Mock

from indexing_worker.worker import INDEX, IndexingWorker

BODY = b'{"documentId": 1, "title": "Invoice", "fileName": "invoice.pdf", "content": "Total 42 EUR"}'


def test_on_message_indexes_document_and_acks():
    elasticsearch, channel, method = Mock(), Mock(), Mock(delivery_tag=1)

    IndexingWorker(elasticsearch).on_message(channel, method, None, BODY)

    elasticsearch.index.assert_called_once_with(
        index=INDEX,
        id="1",
        document={"documentId": 1, "title": "Invoice", "fileName": "invoice.pdf", "content": "Total 42 EUR"},
    )
    channel.basic_ack.assert_called_once_with(delivery_tag=1)


def test_on_message_without_file_name_is_indexed():
    elasticsearch = Mock()

    IndexingWorker(elasticsearch).on_message(
        Mock(), Mock(delivery_tag=1), None, b'{"documentId": 2, "title": "Scan", "content": ""}')

    assert elasticsearch.index.call_args.kwargs["document"]["fileName"] is None


def test_on_message_invalid_message_is_discarded():
    elasticsearch, channel, method = Mock(), Mock(), Mock(delivery_tag=1)

    IndexingWorker(elasticsearch).on_message(channel, method, None, b"not json")

    elasticsearch.index.assert_not_called()
    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)
    channel.basic_ack.assert_not_called()


def test_on_message_without_content_is_discarded():
    elasticsearch, channel, method = Mock(), Mock(), Mock(delivery_tag=1)

    IndexingWorker(elasticsearch).on_message(channel, method, None, b'{"documentId": 1, "title": "Invoice"}')

    elasticsearch.index.assert_not_called()
    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)


def test_on_message_elasticsearch_error_is_logged_and_discarded(caplog):
    elasticsearch, channel, method = Mock(), Mock(), Mock(delivery_tag=1)
    elasticsearch.index.side_effect = Exception("Connection refused")

    IndexingWorker(elasticsearch).on_message(channel, method, None, BODY)

    assert "Discarding message" in caplog.text
    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)
