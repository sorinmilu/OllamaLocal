/**
 * Individual message component.
 */
import { Card } from 'react-bootstrap';
import { Message as MessageType } from '../../types/session';
import './Message.css';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export default function Message({ message, isStreaming }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'} mb-3`}>
      <div className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
        <div className="message-content-wrapper" style={{ maxWidth: '80%' }}>
          <div className="message-role mb-1">
            <small className="text-muted">
              <strong>{isUser ? 'You' : 'Assistant'}</strong>
              {' · '}
              {formatTime(message.timestamp)}
              {isStreaming && ' · Generating...'}
            </small>
          </div>
          <Card 
            className={`message-card ${isUser ? 'bg-primary text-white' : 'bg-light'}`}
            style={{ border: 'none' }}
          >
            <Card.Body className="p-3">
              <div className="message-text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {message.content}
                {isStreaming && <span className="streaming-cursor">▊</span>}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
