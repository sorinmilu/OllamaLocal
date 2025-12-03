/**
 * Model management component for downloading new Ollama models.
 */
import { useState } from 'react';
import { Modal, Button, Form, ProgressBar, Alert, ListGroup, Badge, Tabs, Tab } from 'react-bootstrap';
import { downloadModel } from '../../services/api';
import './ModelManager.css';

interface ModelManagerProps {
  show: boolean;
  onHide: () => void;
  onModelDownloaded: () => void;
}

interface PopularModel {
  name: string;
  description: string;
  size: string;
  tags: string[];
  recommended?: boolean;
}

// Popular Ollama models list
const POPULAR_MODELS: PopularModel[] = [
  {
    name: 'llama3.2:latest',
    description: 'Meta\'s latest Llama model with improved performance',
    size: '2GB',
    tags: ['General', 'Fast'],
    recommended: true,
  },
  {
    name: 'llama3.1:latest',
    description: 'Powerful general-purpose model from Meta',
    size: '4.7GB',
    tags: ['General', 'Popular'],
    recommended: true,
  },
  {
    name: 'mistral:latest',
    description: 'High-quality open-source model from Mistral AI',
    size: '4.1GB',
    tags: ['General', 'Popular'],
    recommended: true,
  },
  {
    name: 'codellama:latest',
    description: 'Specialized for code generation and understanding',
    size: '3.8GB',
    tags: ['Code', 'Programming'],
  },
  {
    name: 'phi3:latest',
    description: 'Microsoft\'s efficient small language model',
    size: '2.3GB',
    tags: ['Fast', 'Efficient'],
  },
  {
    name: 'gemma2:latest',
    description: 'Google\'s lightweight and efficient model',
    size: '5.4GB',
    tags: ['General', 'Google'],
  },
  {
    name: 'qwen2.5:latest',
    description: 'Alibaba\'s multilingual model with strong performance',
    size: '4.4GB',
    tags: ['Multilingual', 'General'],
  },
  {
    name: 'deepseek-coder:latest',
    description: 'Specialized model for code tasks',
    size: '3.8GB',
    tags: ['Code', 'Programming'],
  },
  {
    name: 'llama3.2:1b',
    description: 'Ultra-lightweight Llama model',
    size: '1.3GB',
    tags: ['Tiny', 'Fast'],
  },
  {
    name: 'llama3.2:3b',
    description: 'Small but capable Llama model',
    size: '2GB',
    tags: ['Small', 'Fast'],
  },
  {
    name: 'mistral-nemo:latest',
    description: 'Mistral\'s latest efficient model',
    size: '7.1GB',
    tags: ['General', 'Advanced'],
  },
  {
    name: 'llama3.1:70b',
    description: 'Large, most capable Llama model (requires significant resources)',
    size: '40GB',
    tags: ['Large', 'Advanced'],
  },
];

export default function ModelManager({ show, onHide, onModelDownloaded }: ModelManagerProps) {
  const [customModelName, setCustomModelName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentModel, setCurrentModel] = useState('');

  const handleDownload = async (modelName: string) => {
    if (!modelName.trim()) return;

    setDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Starting download...');
    setError(null);
    setSuccess(false);
    setCurrentModel(modelName);

    try {
      const response = await downloadModel(modelName);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.status) {
                setDownloadStatus(data.status);
              }

              // Calculate progress if available
              if (data.completed !== undefined && data.total !== undefined) {
                const progress = (data.completed / data.total) * 100;
                setDownloadProgress(progress);
              }

              // Check if done
              if (data.status === 'success' || data.status?.includes('success')) {
                setSuccess(true);
                setDownloadProgress(100);
                setDownloadStatus('Download complete!');
                setTimeout(() => {
                  onModelDownloaded();
                  handleClose();
                }, 1500);
              }
            } catch (parseError) {
              console.error('Error parsing progress:', parseError);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to download model');
      setDownloadProgress(0);
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    if (!downloading) {
      setCustomModelName('');
      setDownloadProgress(0);
      setDownloadStatus('');
      setError(null);
      setSuccess(false);
      setCurrentModel('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton={!downloading}>
        <Modal.Title>📥 Download Ollama Models</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            Model downloaded successfully!
          </Alert>
        )}

        {downloading && (
          <div className="mb-3">
            <h6>Downloading: {currentModel}</h6>
            <ProgressBar 
              now={downloadProgress} 
              label={`${Math.round(downloadProgress)}%`}
              animated
              striped
            />
            <small className="text-muted mt-1 d-block">{downloadStatus}</small>
          </div>
        )}

        <Tabs defaultActiveKey="popular" className="mb-3">
          <Tab eventKey="popular" title="Popular Models">
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <ListGroup>
                {POPULAR_MODELS.map((model) => (
                  <ListGroup.Item
                    key={model.name}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong>{model.name}</strong>
                        {model.recommended && (
                          <Badge bg="success" pill>Recommended</Badge>
                        )}
                        <Badge bg="secondary" pill>{model.size}</Badge>
                      </div>
                      <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>
                        {model.description}
                      </p>
                      <div className="d-flex gap-1 flex-wrap">
                        {model.tags.map((tag) => (
                          <Badge key={tag} bg="light" text="dark" style={{ fontSize: '0.75rem' }}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownload(model.name)}
                      disabled={downloading}
                      className="ms-2"
                    >
                      {downloading && currentModel === model.name ? 'Downloading...' : 'Download'}
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Tab>

          <Tab eventKey="custom" title="Custom Model">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Model Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., llama3.2:latest, mistral:7b, codellama:13b"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  disabled={downloading}
                />
                <Form.Text className="text-muted">
                  Enter the full model name including tag (e.g., model:tag).
                  Check <a href="https://ollama.com/library" target="_blank" rel="noopener noreferrer">
                    Ollama Library
                  </a> for available models.
                </Form.Text>
              </Form.Group>
              <Button
                variant="primary"
                onClick={() => handleDownload(customModelName)}
                disabled={!customModelName.trim() || downloading}
              >
                {downloading ? 'Downloading...' : 'Download Custom Model'}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="info" title="ℹ️ Info">
            <div className="p-3">
              <h6>About Ollama Models</h6>
              <p>
                Ollama models are optimized for local execution. Choose based on:
              </p>
              <ul>
                <li><strong>Size</strong>: Larger models are more capable but require more RAM/VRAM</li>
                <li><strong>Speed</strong>: Smaller models respond faster</li>
                <li><strong>Task</strong>: Some models are specialized (code, chat, etc.)</li>
              </ul>
              
              <h6 className="mt-3">Model Tags</h6>
              <ul>
                <li><strong>:latest</strong> - Latest version</li>
                <li><strong>:1b, :3b, :7b</strong> - Model size in billions of parameters</li>
                <li><strong>:instruct</strong> - Instruction-tuned for chat</li>
                <li><strong>:code</strong> - Specialized for coding</li>
              </ul>

              <h6 className="mt-3">System Requirements</h6>
              <ul>
                <li><strong>1-3B models</strong>: 4-8GB RAM</li>
                <li><strong>7B models</strong>: 8-16GB RAM</li>
                <li><strong>13B+ models</strong>: 16GB+ RAM (GPU recommended)</li>
              </ul>

              <Alert variant="info" className="mt-3">
                <small>
                  <strong>Tip:</strong> Start with smaller models like llama3.2:3b or phi3 
                  to test your system, then download larger models if needed.
                </small>
              </Alert>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={downloading}>
          {downloading ? 'Downloading...' : 'Close'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
