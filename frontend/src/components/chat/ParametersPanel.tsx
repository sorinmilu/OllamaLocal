/**
 * Parameters settings component for adjusting Ollama generation parameters.
 */
import { Form, Accordion, Button } from 'react-bootstrap';
import { Parameters } from '../../types/parameters';
import './ParametersPanel.css';

interface ParametersPanelProps {
  parameters: Parameters;
  onParametersChange: (parameters: Parameters) => void;
  onReset?: () => void;
}

export default function ParametersPanel({
  parameters,
  onParametersChange,
  onReset,
}: ParametersPanelProps) {
  const handleChange = (field: keyof Parameters, value: any) => {
    // Immediately update parameters
    onParametersChange({
      ...parameters,
      [field]: value,
    });
  };

  return (
    <Accordion defaultActiveKey="0" className="parameters-panel">
      <Accordion.Item eventKey="0">
        <Accordion.Header>⚙️ Generation Parameters</Accordion.Header>
        <Accordion.Body>
          <div className="alert alert-info py-2 px-3 mb-3" style={{ fontSize: '0.8rem' }}>
            <strong>✨ Live Preview:</strong> Changes apply immediately to new messages
          </div>
          <Form>
            {/* Temperature */}
            <Form.Group className="mb-3">
              <Form.Label>
                Temperature: <strong>{parameters.temperature.toFixed(2)}</strong>
              </Form.Label>
              <Form.Range
                min={0}
                max={2}
                step={0.1}
                value={parameters.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
              <Form.Text className="text-muted">
                Controls randomness. Lower = more focused, Higher = more creative
              </Form.Text>
            </Form.Group>

            {/* Top P */}
            <Form.Group className="mb-3">
              <Form.Label>
                Top P: <strong>{parameters.top_p.toFixed(2)}</strong>
              </Form.Label>
              <Form.Range
                min={0}
                max={1}
                step={0.05}
                value={parameters.top_p}
                onChange={(e) => handleChange('top_p', parseFloat(e.target.value))}
              />
              <Form.Text className="text-muted">
                Nucleus sampling threshold
              </Form.Text>
            </Form.Group>

            {/* Top K */}
            <Form.Group className="mb-3">
              <Form.Label>
                Top K: <strong>{parameters.top_k}</strong>
              </Form.Label>
              <Form.Range
                min={1}
                max={100}
                step={1}
                value={parameters.top_k}
                onChange={(e) => handleChange('top_k', parseInt(e.target.value))}
              />
              <Form.Text className="text-muted">
                Limits vocabulary selection to top K tokens
              </Form.Text>
            </Form.Group>

            {/* Repeat Penalty */}
            <Form.Group className="mb-3">
              <Form.Label>
                Repeat Penalty: <strong>{parameters.repeat_penalty.toFixed(2)}</strong>
              </Form.Label>
              <Form.Range
                min={0}
                max={2}
                step={0.1}
                value={parameters.repeat_penalty}
                onChange={(e) => handleChange('repeat_penalty', parseFloat(e.target.value))}
              />
              <Form.Text className="text-muted">
                Penalize repetition. Higher = less repetitive
              </Form.Text>
            </Form.Group>

            <Accordion className="mb-3">
              <Accordion.Item eventKey="advanced">
                <Accordion.Header>Advanced Settings</Accordion.Header>
                <Accordion.Body>
                  {/* Context Window */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Context Window (num_ctx): <strong>{parameters.num_ctx}</strong>
                    </Form.Label>
                    <Form.Range
                      min={128}
                      max={8192}
                      step={128}
                      value={parameters.num_ctx}
                      onChange={(e) => handleChange('num_ctx', parseInt(e.target.value))}
                    />
                    <Form.Text className="text-muted">
                      Size of context window in tokens
                    </Form.Text>
                  </Form.Group>

                  {/* Max Tokens to Predict */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Max Tokens (num_predict): <strong>{parameters.num_predict}</strong>
                    </Form.Label>
                    <Form.Range
                      min={1}
                      max={4096}
                      step={64}
                      value={parameters.num_predict}
                      onChange={(e) => handleChange('num_predict', parseInt(e.target.value))}
                    />
                    <Form.Text className="text-muted">
                      Maximum tokens to generate
                    </Form.Text>
                  </Form.Group>

                  {/* Threads */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Threads (num_thread): <strong>{parameters.num_thread}</strong>
                    </Form.Label>
                    <Form.Range
                      min={1}
                      max={32}
                      step={1}
                      value={parameters.num_thread}
                      onChange={(e) => handleChange('num_thread', parseInt(e.target.value))}
                    />
                    <Form.Text className="text-muted">
                      Number of threads to use
                    </Form.Text>
                  </Form.Group>

                  {/* Mirostat */}
                  <Form.Group className="mb-3">
                    <Form.Label>Mirostat</Form.Label>
                    <Form.Select
                      value={parameters.mirostat}
                      onChange={(e) => handleChange('mirostat', parseInt(e.target.value))}
                    >
                      <option value={0}>Disabled</option>
                      <option value={1}>Mirostat 1</option>
                      <option value={2}>Mirostat 2</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Alternative sampling algorithm
                    </Form.Text>
                  </Form.Group>

                  {parameters.mirostat > 0 && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Mirostat Tau: <strong>{parameters.mirostat_tau.toFixed(1)}</strong>
                        </Form.Label>
                        <Form.Range
                          min={0}
                          max={10}
                          step={0.5}
                          value={parameters.mirostat_tau}
                          onChange={(e) => handleChange('mirostat_tau', parseFloat(e.target.value))}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Mirostat Eta: <strong>{parameters.mirostat_eta.toFixed(2)}</strong>
                        </Form.Label>
                        <Form.Range
                          min={0}
                          max={1}
                          step={0.05}
                          value={parameters.mirostat_eta}
                          onChange={(e) => handleChange('mirostat_eta', parseFloat(e.target.value))}
                        />
                      </Form.Group>
                    </>
                  )}

                  {/* Seed */}
                  <Form.Group className="mb-3">
                    <Form.Label>Seed (optional)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Random"
                      value={parameters.seed || ''}
                      onChange={(e) => handleChange('seed', e.target.value ? parseInt(e.target.value) : null)}
                    />
                    <Form.Text className="text-muted">
                      Set for reproducible results
                    </Form.Text>
                  </Form.Group>

                  {/* Stream */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="stream-switch"
                      label="Enable Streaming"
                      checked={parameters.stream}
                      onChange={(e) => handleChange('stream', e.target.checked)}
                    />
                    <Form.Text className="text-muted">
                      Stream responses in real-time
                    </Form.Text>
                  </Form.Group>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {/* Reset Button */}
            {onReset && (
              <div className="d-grid">
                <Button variant="outline-secondary" size="sm" onClick={onReset}>
                  Reset to Defaults
                </Button>
              </div>
            )}
          </Form>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
