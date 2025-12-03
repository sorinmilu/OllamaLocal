/**
 * Message list component - displays conversation history.
 */
import { Message as MessageType } from '../../types/session';
import Message from './Message';
import { Spinner } from 'react-bootstrap';
import './MessageList.css';

interface MessageListProps {
  messages: MessageType[];
  streamingMessage?: string;
  isGenerating?: boolean;
}

export default function MessageList({ messages, streamingMessage, isGenerating }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      
      {streamingMessage && (
        <Message
          message={{
            id: 'streaming',
            role: 'assistant',
            content: streamingMessage,
            timestamp: new Date().toISOString(),
          }}
          isStreaming
        />
      )}
      
      {isGenerating && !streamingMessage && (
        <div className="text-center my-3">
          <Spinner animation="border" size="sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </div>
  );
}
