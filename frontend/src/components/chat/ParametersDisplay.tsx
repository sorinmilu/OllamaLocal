/**
 * Component to display current generation parameters
 */
import { Badge } from 'react-bootstrap';
import { Parameters } from '../../types/parameters';
import './ParametersDisplay.css';

interface ParametersDisplayProps {
  parameters: Parameters;
}

export default function ParametersDisplay({ parameters }: ParametersDisplayProps) {
  // Only show non-default or important parameters
  const displayParams = [];

  // Temperature (always show if not 0.7)
  if (parameters.temperature !== 0.7) {
    displayParams.push({ label: 'Temp', value: parameters.temperature.toFixed(2) });
  }

  // Top P (show if not default)
  if (parameters.top_p !== 0.9) {
    displayParams.push({ label: 'Top-P', value: parameters.top_p.toFixed(2) });
  }

  // Top K (show if not default)
  if (parameters.top_k !== 40) {
    displayParams.push({ label: 'Top-K', value: parameters.top_k.toString() });
  }

  // Repeat Penalty (show if not default)
  if (parameters.repeat_penalty !== 1.1) {
    displayParams.push({ label: 'Repeat', value: parameters.repeat_penalty.toFixed(2) });
  }

  // Context size (show if not default)
  if (parameters.num_ctx !== 2048) {
    displayParams.push({ label: 'Context', value: parameters.num_ctx.toString() });
  }

  // Max tokens (show if not default)
  if (parameters.num_predict !== 512) {
    displayParams.push({ label: 'Max Tokens', value: parameters.num_predict.toString() });
  }

  // Seed (show if set)
  if (parameters.seed) {
    displayParams.push({ label: 'Seed', value: parameters.seed.toString() });
  }

  // Streaming status
  const streamBadge = parameters.stream ? (
    <Badge bg="success" pill className="ms-1">Streaming ON</Badge>
  ) : (
    <Badge bg="secondary" pill className="ms-1">Streaming OFF</Badge>
  );

  if (displayParams.length === 0) {
    // Show default state
    return (
      <div className="parameters-display">
        <small className="text-muted">
          ⚙️ Default parameters {streamBadge}
        </small>
      </div>
    );
  }

  return (
    <div className="parameters-display">
      <small className="text-muted">
        ⚙️ Active parameters: {' '}
        {displayParams.map((param, index) => (
          <span key={param.label}>
            <strong>{param.label}</strong>: {param.value}
            {index < displayParams.length - 1 && ' • '}
          </span>
        ))}
        {streamBadge}
      </small>
    </div>
  );
}
