"""
Service for interacting with Ollama instance.
"""
import httpx
import json
from typing import List, Dict, Any, AsyncGenerator
from app.config import settings
from app.models.schemas import Model, ModelInfo, GenerateRequest, MessageSchema


class OllamaService:
    """Service for Ollama API operations."""

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.timeout = settings.OLLAMA_TIMEOUT

    async def list_models(self) -> List[Model]:
        """
        Get list of available models from Ollama.
        
        Returns:
            List of Model objects
        
        Raises:
            httpx.HTTPError: If Ollama is not reachable
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            data = response.json()
            return [Model(**model) for model in data.get("models", [])]

    async def get_model_info(self, name: str) -> ModelInfo:
        """
        Get detailed information about a model.
        
        Args:
            name: Model name (e.g., "llama2:latest")
        
        Returns:
            ModelInfo object
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/show",
                json={"name": name}
            )
            response.raise_for_status()
            return ModelInfo(**response.json())

    async def download_model(self, name: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Download a model with progress updates.
        
        Args:
            name: Model name to download
        
        Yields:
            Progress updates as dicts
        """
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/pull",
                json={"name": name}
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        yield json.loads(line)

    async def delete_model(self, name: str) -> bool:
        """
        Delete a model from Ollama.
        
        Args:
            name: Model name to delete
        
        Returns:
            True if successful
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.delete(
                f"{self.base_url}/api/delete",
                json={"name": name}
            )
            response.raise_for_status()
            return True

    async def generate(self, request: GenerateRequest) -> Dict[str, Any]:
        """
        Generate text using the generate endpoint.
        
        Args:
            request: GenerateRequest object
        
        Returns:
            Response dict from Ollama
        """
        # Get the last message as prompt
        prompt = request.messages[-1].content if request.messages else ""
        
        payload = {
            "model": request.model,
            "prompt": prompt,
            "options": self._build_options(request.parameters),
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def stream_generate(self, request: GenerateRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream text generation.
        
        Args:
            request: GenerateRequest object
        
        Yields:
            Response chunks as dicts
        """
        prompt = request.messages[-1].content if request.messages else ""
        
        payload = {
            "model": request.model,
            "prompt": prompt,
            "options": self._build_options(request.parameters),
            "stream": True
        }
        
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        yield json.loads(line)

    async def chat(self, request: GenerateRequest) -> Dict[str, Any]:
        """
        Chat using the chat endpoint.
        
        Args:
            request: GenerateRequest object
        
        Returns:
            Response dict from Ollama
        """
        payload = {
            "model": request.model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
            "options": self._build_options(request.parameters),
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def stream_chat(self, request: GenerateRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream chat responses.
        
        Args:
            request: GenerateRequest object
        
        Yields:
            Message chunks as dicts
        """
        payload = {
            "model": request.model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
            "options": self._build_options(request.parameters),
            "stream": True
        }
        
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        yield json.loads(line)

    def _build_options(self, parameters) -> Dict[str, Any]:
        """Build Ollama options from parameters."""
        return {
            "temperature": parameters.temperature,
            "top_p": parameters.top_p,
            "top_k": parameters.top_k,
            "repeat_penalty": parameters.repeat_penalty,
            "num_ctx": parameters.num_ctx,
            "num_predict": parameters.num_predict,
            "seed": parameters.seed,
            "stop": parameters.stop,
            "mirostat": parameters.mirostat,
            "mirostat_tau": parameters.mirostat_tau,
            "mirostat_eta": parameters.mirostat_eta,
            "num_thread": parameters.num_thread,
        }


# Singleton instance
ollama_service = OllamaService()
