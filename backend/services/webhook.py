import httpx
import logging

logger = logging.getLogger(__name__)

def send_webhook_payload(url: str, payload: dict):
    """
    Sends a JSON POST request to the specified webhook URL.
    """
    try:
        url = url.strip()
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"Webhook dispatched successfully to {url}")
    except Exception as e:
        logger.error(f"Failed to dispatch webhook to {url}: {e}")
