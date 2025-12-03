/**
 * Input area component for sending messages.
 */
import { useState, KeyboardEvent } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import './InputArea.css';

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function InputArea({ onSendMessage, disabled, placeholder }: InputAreaProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area p-3 border-top">
      <InputGroup>
        <Form.Control
          as="textarea"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder || 'Type your message... (Shift+Enter for new line)'}
          disabled={disabled}
          className="resize-none"
        />
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="px-4"
        >
          {disabled ? 'Sending...' : 'Send'}
        </Button>
      </InputGroup>
    </div>
  );
}
