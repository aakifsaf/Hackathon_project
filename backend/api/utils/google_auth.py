from google.oauth2 import service_account
from google.auth.transport.requests import Request
import google.auth
import json
import requests
import logging

GEMINI_API_KEY="AIzaSyAjHDnGHz6t_drpEeZ2K_UIvl7CIDyGXus"


logger = logging.getLogger(__name__)

def get_gemini_access_token():
    creds = service_account.Credentials.from_service_account_file(
        './api/service_account.json',
        scopes=['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/generative-language']
    )
    creds.refresh(Request())
    return creds.token

def list_available_models():
    headers = {
        "Authorization": f"Bearer {get_gemini_access_token()}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            headers=headers
        )
        response_data = response.json()
        logger.debug(f"Available models: {response_data}")
        return response_data
    except requests.RequestException as e:
        logger.error(f"Error fetching available models: {str(e)}")
        return None