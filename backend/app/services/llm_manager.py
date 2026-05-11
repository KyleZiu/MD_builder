import os
from typing import Optional
from cryptography.fernet import Fernet
from openai import OpenAI


FERNET_KEY = os.getenv("FERNET_KEY")
if not FERNET_KEY:
    FERNET_KEY = Fernet.generate_key().decode()
    os.environ["FERNET_KEY"] = FERNET_KEY

fernet = Fernet(FERNET_KEY.encode())


def encrypt_api_key(key: str) -> str:
    return fernet.encrypt(key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    return fernet.decrypt(encrypted_key.encode()).decode()


class LLMManager:
    def __init__(self):
        self._clients: dict[str, OpenAI] = {}

    def get_client(self, config) -> Optional[OpenAI]:
        if not config:
            return None
        config_id = config.id
        if config_id in self._clients:
            return self._clients[config_id]

        api_key = decrypt_api_key(config.api_key)
        client = OpenAI(base_url=config.api_url, api_key=api_key)
        self._clients[config_id] = client
        return client

    def clear_cache(self):
        self._clients.clear()


llm_manager = LLMManager()
