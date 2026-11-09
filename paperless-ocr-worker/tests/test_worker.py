import json
from unittest.mock import Mock, patch

from ocr_worker.worker import BUCKET, RESULT_QUEUE, OcrWorker, extract_text

BODY = b'{"documentId": 1, "title": "Hello", "fileName": "HelloWorld.pdf", "objectKey": "1/HelloWorld.pdf"}'


def make_worker(pdf=b"%PDF-1.4"):
    storage = Mock()
    storage.get_object.return_value.read.return_value = pdf
    return OcrWorker(storage), storage


@patch("ocr_worker.worker.extract_text", return_value="Hello World")
def test_on_message_valid_message_sends_result_and_acks(extract_text):
    worker, storage = make_worker()
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, BODY)

    storage.get_object.assert_called_once_with(BUCKET, "1/HelloWorld.pdf")
    extract_text.assert_called_once_with(b"%PDF-1.4")
    publish = channel.basic_publish.call_args.kwargs
    assert publish["routing_key"] == RESULT_QUEUE
    assert json.loads(publish["body"]) == {"documentId": 1, "content": "Hello World"}
    assert publish["properties"].delivery_mode == 2
    channel.basic_ack.assert_called_once_with(delivery_tag=1)


@patch("ocr_worker.worker.extract_text", return_value="")
def test_on_message_releases_storage_connection(_):
    worker, storage = make_worker()

    worker.on_message(Mock(), Mock(delivery_tag=1), None, BODY)

    storage.get_object.return_value.close.assert_called_once()
    storage.get_object.return_value.release_conn.assert_called_once()


def test_on_message_invalid_message_is_discarded():
    worker, storage = make_worker()
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, b"not json")

    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)
    channel.basic_ack.assert_not_called()
    storage.get_object.assert_not_called()


def test_on_message_without_object_key_is_discarded():
    worker, _ = make_worker()
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, b'{"documentId": 1}')

    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)


def test_on_message_missing_file_is_discarded_without_result():
    worker, storage = make_worker()
    storage.get_object.side_effect = Exception("NoSuchKey")
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, BODY)

    channel.basic_publish.assert_not_called()
    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)


@patch("ocr_worker.worker.extract_text", side_effect=Exception("Unable to get page count"))
def test_on_message_broken_pdf_is_discarded(_):
    worker, _storage = make_worker(b"broken")
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, BODY)

    channel.basic_publish.assert_not_called()
    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)


@patch("ocr_worker.worker.pytesseract.image_to_string", side_effect=[" Page 1 \n", "Page 2"])
@patch("ocr_worker.worker.convert_from_bytes", return_value=["image1", "image2"])
def test_extract_text_joins_pages(convert_from_bytes, image_to_string):
    assert extract_text(b"%PDF-1.4") == "Page 1\n\nPage 2"
    convert_from_bytes.assert_called_once_with(b"%PDF-1.4", dpi=300)
    image_to_string.assert_any_call("image1", lang="deu+eng")
