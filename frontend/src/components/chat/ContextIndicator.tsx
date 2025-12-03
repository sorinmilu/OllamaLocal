/**
 * Context indicator component - shows token usage.
 */
import { useState, useEffect } from 'react';
import { ProgressBar, Badge } from 'react-bootstrap';
import { getContextInfo } from '../../services/api';
import { ContextInfo } from '../../types/session';
import './ContextIndicator.css';

interface ContextIndicatorProps {
  sessionId: string;
}

export default function ContextIndicator({ sessionId }: ContextIndicatorProps) {
  const [contextInfo, setContextInfo] = useState<ContextInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContextInfo();
  }, [sessionId]);

  const loadContextInfo = async () => {
    try {
      setLoading(true);
      const info = await getContextInfo(sessionId);
      setContextInfo(info);
    } catch (error) {
      console.error('Failed to load context info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !contextInfo) {
    return null;
  }

  const getVariant = (percentage: number) => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'danger';
  };

  return (
    <div className="context-indicator p-2 border-top bg-light">
      <div className="d-flex align-items-center justify-content-between small">
        <div>
          <Badge bg="secondary" className="me-2">
            {contextInfo.context_messages} / {contextInfo.total_messages} messages
          </Badge>
          <span className="text-muted">
            {contextInfo.estimated_tokens} / {contextInfo.context_limit} tokens
          </span>
        </div>
        <div style={{ width: '200px' }}>
          <ProgressBar
            now={contextInfo.usage_percentage}
            variant={getVariant(contextInfo.usage_percentage)}
            label={`${contextInfo.usage_percentage.toFixed(0)}%`}
            className="mb-0"
          />
        </div>
      </div>
    </div>
  );
}
