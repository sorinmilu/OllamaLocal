"""
Service for exporting conversations to PDF.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT
from io import BytesIO
from typing import List
from app.models.database import Session, Message


class ExportService:
    """Export conversation sessions to various formats."""

    @staticmethod
    def export_to_pdf(session: Session, messages: List[Message]) -> bytes:
        """
        Export a conversation session to PDF.
        
        Args:
            session: Session object
            messages: List of messages
        
        Returns:
            PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18,
        )
        
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor='#2c3e50',
            spaceAfter=30,
        )
        title = Paragraph(f"<b>{session.name}</b>", title_style)
        story.append(title)

        # Metadata
        meta_style = ParagraphStyle(
            'Metadata',
            parent=styles['Normal'],
            fontSize=10,
            textColor='#7f8c8d',
            spaceAfter=20,
        )
        metadata = Paragraph(
            f"<b>Model:</b> {session.model_name}<br/>"
            f"<b>Endpoint:</b> {session.endpoint_type}<br/>"
            f"<b>Created:</b> {session.created_at.strftime('%Y-%m-%d %H:%M:%S')}<br/>"
            f"<b>Messages:</b> {len(messages)}",
            meta_style
        )
        story.append(metadata)
        story.append(Spacer(1, 0.3 * inch))

        # Messages
        user_style = ParagraphStyle(
            'UserMessage',
            parent=styles['Normal'],
            fontSize=11,
            textColor='#2c3e50',
            spaceAfter=5,
            leftIndent=10,
        )
        
        assistant_style = ParagraphStyle(
            'AssistantMessage',
            parent=styles['Normal'],
            fontSize=11,
            textColor='#34495e',
            spaceAfter=5,
            leftIndent=10,
        )
        
        role_style = ParagraphStyle(
            'Role',
            parent=styles['Heading3'],
            fontSize=12,
            textColor='#3498db',
            spaceAfter=5,
        )

        for msg in messages:
            # Role header
            role_text = f"<b>{msg.role.upper()}</b>"
            if msg.role == 'assistant':
                role_text = f'<b><font color="#27ae60">{msg.role.upper()}</font></b>'
            elif msg.role == 'user':
                role_text = f'<b><font color="#3498db">{msg.role.upper()}</font></b>'
            
            role_para = Paragraph(role_text, role_style)
            story.append(role_para)

            # Message content (escape HTML special characters)
            content = msg.content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            content = content.replace('\n', '<br/>')
            
            style = assistant_style if msg.role == 'assistant' else user_style
            content_para = Paragraph(content, style)
            story.append(content_para)
            story.append(Spacer(1, 0.2 * inch))

        # Build PDF
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes
