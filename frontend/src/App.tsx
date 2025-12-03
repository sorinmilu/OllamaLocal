/**
 * Main application component - fully integrated.
 */
import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Offcanvas, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ChatInterface from './components/chat/ChatInterface';
import ParametersPanel from './components/chat/ParametersPanel';
import { 
  getSessions, 
  createSession, 
  deleteSession, 
  getSession,
  updateSession,
  getModels,
  getDefaultParameters,
  exportSessionToPDF 
} from './services/api';
import { Session, Message } from './types/session';
import { Parameters } from './types/parameters';
import { Model } from './types/models';
import './App.css';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [defaultParameters, setDefaultParameters] = useState<Parameters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New session form state
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionModel, setNewSessionModel] = useState('');
  const [newSessionEndpoint, setNewSessionEndpoint] = useState<'chat' | 'generate'>('chat');

  // Session rename state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [renameSessionName, setRenameSessionName] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [sessionsData, modelsData, defaultParams] = await Promise.all([
        getSessions(),
        getModels(),
        getDefaultParameters(),
      ]);
      
      setSessions(sessionsData);
      setModels(modelsData);
      setParameters(defaultParams);
      setDefaultParameters(defaultParams);
      
      if (modelsData.length > 0) {
        setSelectedModel(modelsData[0].name);
        setNewSessionModel(modelsData[0].name);
      }
      
      if (sessionsData.length > 0) {
        await switchSession(sessionsData[0].id);
      }
    } catch (err) {
      setError('Failed to load initial data. Make sure the backend and Ollama are running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchSession = async (sessionId: string) => {
    try {
      const sessionDetail = await getSession(sessionId);
      setCurrentSession(sessionDetail);
      setMessages(sessionDetail.messages);
    } catch (err) {
      setError('Failed to load session');
      console.error(err);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !newSessionModel) return;

    try {
      const session = await createSession({
        name: newSessionName.trim(),
        model_name: newSessionModel,
        endpoint_type: newSessionEndpoint,
      });
      
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setMessages([]);
      setShowNewSessionModal(false);
      setNewSessionName('');
    } catch (err) {
      setError('Failed to create session');
      console.error(err);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await deleteSession(sessionId);
      const newSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(newSessions);
      
      if (currentSession?.id === sessionId) {
        if (newSessions.length > 0) {
          await switchSession(newSessions[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (err) {
      setError('Failed to delete session');
      console.error(err);
    }
  };

  const handleRenameSession = async () => {
    if (!renameSessionId || !renameSessionName.trim()) return;

    try {
      await updateSession(renameSessionId, { name: renameSessionName.trim() });
      
      // Update sessions list
      const updatedSessions = sessions.map(s => 
        s.id === renameSessionId ? { ...s, name: renameSessionName.trim() } : s
      );
      setSessions(updatedSessions);
      
      // Update current session if it's the one being renamed
      if (currentSession?.id === renameSessionId) {
        setCurrentSession({ ...currentSession, name: renameSessionName.trim() });
      }
      
      setShowRenameModal(false);
      setRenameSessionId(null);
      setRenameSessionName('');
    } catch (err) {
      setError('Failed to rename session');
      console.error(err);
    }
  };

  const openRenameModal = (sessionId: string, currentName: string) => {
    setRenameSessionId(sessionId);
    setRenameSessionName(currentName);
    setShowRenameModal(true);
  };

  const handleResetParameters = () => {
    if (defaultParameters) {
      setParameters({ ...defaultParameters });
    }
  };

  const handleSendMessage = (content: string) => {
    // Add user message to UI immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, userMessage]);
  };

  const handleExport = async () => {
    if (!currentSession) return;

    try {
      const blob = await exportSessionToPDF(currentSession.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSession.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export PDF');
      console.error(err);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <Container fluid>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="me-3"
          >
            ☰
          </Button>
          <span className="navbar-brand mb-0 h1">Ollama Web Interface</span>
          <div className="d-flex align-items-center gap-2">
            {currentSession && (
              <Button variant="outline-light" size="sm" onClick={handleExport}>
                📄 Export
              </Button>
            )}
            <Button variant="outline-light" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </div>
        </Container>
      </nav>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="m-3">
          {error}
        </Alert>
      )}

      <Container fluid className="flex-grow-1 overflow-hidden">
        <Row className="h-100">
          {/* Sidebar */}
          <Offcanvas
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
            placement="start"
            backdrop={false}
            scroll={true}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => setShowNewSessionModal(true)}
                  disabled={models.length === 0}
                >
                  ➕ New Session
                </Button>
                
                <hr />
                
                <div className="mb-3">
                  <h6 className="text-muted">Models ({models.length})</h6>
                  {models.length === 0 ? (
                    <small className="text-muted">No models available</small>
                  ) : (
                    <Form.Select 
                      size="sm" 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      {models.map(model => (
                        <option key={model.name} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </div>

                <div className="mb-3">
                  <h6 className="text-muted">Sessions ({sessions.length})</h6>
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={`d-flex align-items-center p-2 rounded mb-1 ${
                        currentSession?.id === session.id ? 'bg-primary text-white' : 'bg-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        className="flex-grow-1"
                        onClick={() => switchSession(session.id)}
                      >
                        <small>{session.name}</small>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameModal(session.id, session.name);
                        }}
                        style={{ color: currentSession?.id === session.id ? 'white' : 'inherit' }}
                      >
                        ✏️
                      </Button>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Parameters Panel */}
                {parameters && (
                  <ParametersPanel
                    parameters={parameters}
                    onParametersChange={setParameters}
                    onReset={handleResetParameters}
                  />
                )}
              </div>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col className="h-100">
            {parameters && (
              <ChatInterface
                currentSession={currentSession}
                sessions={sessions}
                messages={messages}
                parameters={parameters}
                onSwitchSession={switchSession}
                onCreateSession={() => setShowNewSessionModal(true)}
                onCloseSession={handleCloseSession}
                onSendMessage={handleSendMessage}
              />
            )}
          </Col>
        </Row>
      </Container>

      {/* New Session Modal */}
      <Modal show={showNewSessionModal} onHide={() => setShowNewSessionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Session Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Model</Form.Label>
              <Form.Select
                value={newSessionModel}
                onChange={(e) => setNewSessionModel(e.target.value)}
              >
                {models.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Endpoint Type</Form.Label>
              <Form.Select
                value={newSessionEndpoint}
                onChange={(e) => setNewSessionEndpoint(e.target.value as 'chat' | 'generate')}
              >
                <option value="chat">Chat (Recommended)</option>
                <option value="generate">Generate</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Chat is recommended for conversations
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewSessionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateSession}
            disabled={!newSessionName.trim() || !newSessionModel}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rename Session Modal */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rename Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Session Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new session name"
                value={renameSessionName}
                onChange={(e) => setRenameSessionName(e.target.value)}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameSession();
                  }
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRenameSession}
            disabled={!renameSessionName.trim()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
