/**
 * Main chat interface component.
 */
import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import MessageList from './MessageList';
import InputArea from './InputArea';
import SessionTabs from './SessionTabs';
import ContextIndicator from './ContextIndicator';
import ParametersDisplay from './ParametersDisplay';
import { Message, Session } from '../../types/session';
import { Parameters } from '../../types/parameters';
import { streamGenerate } from '../../services/api';
import './ChatInterface.css';

interface ChatInterfaceProps {
  currentSession: Session | null;
  sessions: Session[];
  messages: Message[];
  parameters: Parameters;
  onSwitchSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onCloseSession: (sessionId: string) => void;
  onSendMessage: (content: string) => void;
  onMessageComplete?: () => void;
}

export default function ChatInterface({
  currentSession,
  sessions,
  messages,
  parameters,
  onSwitchSession,
  onCreateSession,
  onCloseSession,
  onSendMessage,
  onMessageComplete,
}: ChatInterfaceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async (content: string) => {
    if (!currentSession || isGenerating) return;

    setIsGenerating(true);
    setStreamingMessage('');
    
    // Add user message immediately
    onSendMessage(content);

    try {
      if (parameters.stream) {
        // Streaming mode
        const response = await streamGenerate({
          model: currentSession.model_name,
          endpoint_type: currentSession.endpoint_type,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content }
          ],
          parameters,
          session_id: currentSession.id,
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullMessage = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.message?.content) {
                  fullMessage += data.message.content;
                  setStreamingMessage(fullMessage);
                } else if (data.response) {
                  fullMessage += data.response;
                  setStreamingMessage(fullMessage);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
        
        // After streaming completes, refresh messages from backend
        if (onMessageComplete) {
          onMessageComplete();
        }
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
      alert('Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
      setStreamingMessage('');
    }
  };

  return (
    <Container fluid className="chat-interface h-100 d-flex flex-column">
      <Row className="flex-shrink-0">
        <Col>
          <SessionTabs
            sessions={sessions}
            currentSession={currentSession}
            onSwitchSession={onSwitchSession}
            onCreateSession={onCreateSession}
            onCloseSession={onCloseSession}
          />
        </Col>
      </Row>

      {currentSession ? (
        <>
          <Row className="flex-grow-1 overflow-hidden">
            <Col>
              <Card className="h-100 border-0">
                <Card.Body className="d-flex flex-column p-0">
                  <div className="flex-grow-1 overflow-auto p-3">
                    <MessageList
                      messages={messages}
                      streamingMessage={streamingMessage}
                      isGenerating={isGenerating}
                    />
                    <div ref={messagesEndRef} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="flex-shrink-0">
            <Col>
              <ContextIndicator sessionId={currentSession.id} />
            </Col>
          </Row>

          <Row className="flex-shrink-0">
            <Col>
              <ParametersDisplay parameters={parameters} />
            </Col>
          </Row>

          <Row className="flex-shrink-0">
            <Col>
              <InputArea
                onSendMessage={handleSendMessage}
                disabled={isGenerating}
                placeholder={isGenerating ? 'Generating...' : 'Type your message...'}
              />
            </Col>
          </Row>
        </>
      ) : (
        <Row className="flex-grow-1">
          <Col className="d-flex align-items-center justify-content-center">
            <div className="text-center text-muted">
              <h4>No session selected</h4>
              <p>Create a new session to start chatting</p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
