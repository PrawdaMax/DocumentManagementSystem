import json
from unittest.mock import Mock

from google.genai import errors

from genai_worker.worker import MAX_CHARS, PROMPT, RESULT_QUEUE, GenAiWorker

BODY = b'{"documentId": 1, "content": "Invoice total 42 EUR"}'


def make_worker(text="A short summary."):
    client = Mock()
    client.models.generate_content.return_value.text = text
    return GenAiWorker(client, "gemini-test"), client


def sent_result(channel):
    publish = channel.basic_publish.call_args.kwargs
    assert publish["routing_key"] == RESULT_QUEUE
    return json.loads(publish["body"])


def test_on_message_sends_summary_and_acks():
    worker, client = make_worker(" A short summary. \n")
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, BODY)

    kwargs = client.models.generate_content.call_args.kwargs
    assert kwargs["model"] == "gemini-test"
    assert kwargs["contents"].endswith("Invoice total 42 EUR")
    assert sent_result(channel) == {"documentId": 1, "summary": "A short summary.", "error": None}
    channel.basic_ack.assert_called_once_with(delivery_tag=1)


def test_on_message_cuts_long_text():
    worker, client = make_worker()
    body = json.dumps({"documentId": 1, "content": "x" * (MAX_CHARS + 100)})

    worker.on_message(Mock(), Mock(delivery_tag=1), None, body)

    assert client.models.generate_content.call_args.kwargs["contents"] == PROMPT + "x" * MAX_CHARS


def test_on_message_gemini_error_sends_error_and_acks():
    worker, client = make_worker()
    client.models.generate_content.side_effect = errors.ClientError(
        429, {"error": {"code": 429, "message": "Quota exceeded", "status": "RESOURCE_EXHAUSTED"}})
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, BODY)

    assert sent_result(channel) == {"documentId": 1, "summary": None, "error": "Gemini error 429: Quota exceeded"}
    channel.basic_ack.assert_called_once_with(delivery_tag=1)


def test_on_message_empty_answer_sends_error():
    worker, _ = make_worker(text=None)
    channel = Mock()

    worker.on_message(channel, Mock(delivery_tag=1), None, BODY)

    assert sent_result(channel)["error"] == "Summary could not be generated"


def test_on_message_invalid_message_is_discarded():
    worker, client = make_worker()
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, b"not json")

    client.models.generate_content.assert_not_called()
    channel.basic_publish.assert_not_called()
    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)


def test_on_message_without_content_is_discarded():
    worker, _ = make_worker()
    channel, method = Mock(), Mock(delivery_tag=1)

    worker.on_message(channel, method, None, b'{"documentId": 1}')

    channel.basic_nack.assert_called_once_with(delivery_tag=1, requeue=False)
