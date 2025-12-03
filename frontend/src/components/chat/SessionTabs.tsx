/**
 * Session tabs component for switching between conversations.
 */
import { Nav, Button, CloseButton } from 'react-bootstrap';
import { Session } from '../../types/session';
import './SessionTabs.css';

interface SessionTabsProps {
  sessions: Session[];
  currentSession: Session | null;
  onSwitchSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onCloseSession: (sessionId: string) => void;
}

export default function SessionTabs({
  sessions,
  currentSession,
  onSwitchSession,
  onCreateSession,
  onCloseSession,
}: SessionTabsProps) {
  return (
    <div className="session-tabs border-bottom">
      <Nav variant="tabs" className="flex-nowrap overflow-auto">
        {sessions.map((session) => (
          <Nav.Item key={session.id} className="d-flex align-items-center">
            <Nav.Link
              active={currentSession?.id === session.id}
              onClick={() => onSwitchSession(session.id)}
              className="d-flex align-items-center position-relative pe-4"
            >
              <span className="session-name">{session.name}</span>
              <CloseButton
                className="position-absolute end-0 me-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseSession(session.id);
                }}
                aria-label="Close session"
                style={{ fontSize: '0.7rem' }}
              />
            </Nav.Link>
          </Nav.Item>
        ))}
        
        <Nav.Item>
          <Button
            variant="link"
            onClick={onCreateSession}
            className="text-decoration-none"
            title="New session"
          >
            + New
          </Button>
        </Nav.Item>
      </Nav>
    </div>
  );
}
