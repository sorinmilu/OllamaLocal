"""
Service for managing conversation context.
"""
from typing import List
from app.models.database import Message


class ContextManager:
    """Manages conversation context and token estimation."""

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """
        Rough token estimation (1 token ≈ 4 characters).
        
        Args:
            text: Text to estimate
        
        Returns:
            Estimated token count
        """
        return max(1, len(text) // 4)

    @staticmethod
    def calculate_message_tokens(messages: List[Message]) -> int:
        """
        Calculate total tokens for messages.
        
        Args:
            messages: List of messages
        
        Returns:
            Total estimated tokens
        """
        total = 0
        for msg in messages:
            total += ContextManager.estimate_tokens(msg.content)
            total += 10  # Role and formatting overhead
        return total

    @staticmethod
    def get_context_messages(
        messages: List[Message], 
        context_size: int
    ) -> List[Message]:
        """
        Get the last N messages for context.
        
        Args:
            messages: All messages in session
            context_size: Number of messages to include
        
        Returns:
            Last N messages
        """
        if context_size <= 0:
            return messages
        return messages[-context_size:] if len(messages) > context_size else messages

    @staticmethod
    def get_context_info(messages: List[Message], max_tokens: int = 2048) -> dict:
        """
        Get context usage information.
        
        Args:
            messages: List of messages
            max_tokens: Maximum context window size
        
        Returns:
            Dict with context statistics
        """
        total_tokens = ContextManager.calculate_message_tokens(messages)
        usage_pct = (total_tokens / max_tokens) * 100 if max_tokens > 0 else 0

        return {
            "total_messages": len(messages),
            "estimated_tokens": total_tokens,
            "context_limit": max_tokens,
            "usage_percentage": round(usage_pct, 2)
        }
