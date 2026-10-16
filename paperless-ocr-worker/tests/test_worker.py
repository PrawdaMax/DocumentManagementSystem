from unittest.mock import Mock

from ocr_worker.worker import on_message


def test_on_message_valid_message_logs_and_acks(caplog):
    caplog.set_level("INFO")
    channel, method = Mock(), Mock(delivery_tag=1)
    body = b'{"documentId": 1, "fileName": "HelloWorld.pdf"}'

    on_message(channel, method, None, body)

    assert "Received OCR job for document 1 (HelloWorld.pdf)" in caplog.text
    channel.basic_ack.assert_called_once_with(delivery_tag=1)


def test_on_message_invalid_message_is_discarded():
    channel, method = Mock(), Mock(delivery_tag=1)

    on_message(channel, method, None, b"not json")

    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)
    channel.basic_ack.assert_not_called()
