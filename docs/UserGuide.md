# User Guide

## Overview

Welcome to the Ollama Web Interface! This guide will help you get started with using the application to interact with your local Ollama instance through an intuitive web interface.

**Version**: 1.0  
**Last Updated**: December 3, 2025

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Managing Models](#managing-models)
4. [Starting a Conversation](#starting-a-conversation)
5. [Managing Sessions](#managing-sessions)
6. [Configuring Parameters](#configuring-parameters)
7. [Using Parameter Presets](#using-parameter-presets)
8. [Context Management](#context-management)
9. [Exporting Conversations](#exporting-conversations)
10. [Tips and Best Practices](#tips-and-best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before using the Ollama Web Interface, ensure you have:

1. **Ollama installed** on your local machine
2. Ollama **running** on `http://localhost:11434`
3. A modern web browser (Chrome, Firefox, Edge, or Safari)

### Accessing the Application

1. Open your web browser
2. Navigate to `http://localhost:5173` (or the URL provided by your administrator)
3. The application will load and connect to your local Ollama instance

---

## Interface Overview

The application interface consists of several main areas:

### Main Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [☰ Menu]  Ollama Web Interface            [🌙 Theme] [⚙️]  │  ← Header
├──────┬──────────────────────────────────────────────────────┤
│      │                                                      │
│ Main │                 Chat Area                            │
│ Menu │   ┌────────────────────────────────────────────┐    │
│      │   │ [Session 1] [Session 2] [+ New]            │    │
│ - New│   ├────────────────────────────────────────────┤    │
│ - Mod│   │                                            │    │
│ - Par│   │  User: Hello!                              │    │
│ - Ses│   │  Assistant: Hi there! How can I help?      │    │
│ - Exp│   │                                            │    │
│      │   ├────────────────────────────────────────────┤    │
│      │   │  Type your message here...        [Send]   │    │
│      │   └────────────────────────────────────────────┘    │
│      │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

### Component Description

1. **Header**: Contains app title, theme toggle, and settings
2. **Sidebar** (collapsible): Navigation menu with main functions
3. **Chat Area**: Main workspace for conversations
4. **Session Tabs**: Switch between multiple conversations
5. **Message History**: Displays the conversation
6. **Input Area**: Where you type your messages
7. **Parameter Panel** (collapsible): Configure generation parameters
8. **Model Panel** (collapsible): Select and manage models

---

## Managing Models

### Viewing Available Models

1. Click **"Models"** in the sidebar menu
2. The model panel will expand showing all installed models
3. Each model displays:
   - Model name and version
   - Size on disk
   - Last modified date
   - Model family and parameters

### Downloading a New Model

1. In the Models panel, click **"Download Model"**
2. Enter the model name (e.g., `llama2:latest`, `mistral:7b`, `codellama:13b`)
3. Click **"Download"**
4. A progress bar will show download status:
   - Pulling manifest
   - Downloading (with percentage and speed)
   - Verifying
   - Complete

**Note**: Large models may take several minutes to download depending on your internet speed.

### Selecting a Model

1. In the Models panel, find the **Model Selector** dropdown
2. Click to view all available models
3. Select your desired model
4. The selected model will be used for all new messages in the current session

### Deleting a Model

1. In the Models panel, find the model you want to remove
2. Click the **trash icon** (🗑️) next to the model
3. Confirm the deletion
4. The model will be removed from your system

**Warning**: Deleted models must be re-downloaded to use again.

---

## Starting a Conversation

### Creating a New Session

1. Click **"+ New Session"** button in the session tabs area
2. Enter a name for your conversation (e.g., "Code Review", "Creative Writing")
3. Select a model from the dropdown
4. Choose an endpoint type:
   - **Chat**: For conversational interactions (recommended)
   - **Generate**: For single-turn completions
5. Click **"Create"**

### Sending Messages

1. Type your message in the input field at the bottom
2. Press **Enter** or click the **"Send"** button
3. Your message will appear in the chat area
4. The assistant's response will stream in real-time (if streaming is enabled)

### Understanding Message Roles

- **User** (You): Your input messages (typically in blue)
- **Assistant**: The model's responses (typically in gray/green)
- **System** (Advanced): Instructions that guide the model's behavior

---

## Managing Sessions

### Switching Between Sessions

1. Click on any session tab at the top of the chat area
2. The conversation history for that session will load
3. You can have multiple sessions open simultaneously

### Renaming a Session

1. Right-click on a session tab (or click the edit icon)
2. Enter a new name
3. Press Enter to save

### Deleting a Session

1. Click the **"×"** button on the session tab
2. Confirm the deletion
3. The session and all its messages will be permanently deleted

**Warning**: This action cannot be undone!

### Session Information

Each session stores:
- Conversation name
- Selected model
- Endpoint type
- All messages and responses
- Timestamp information

---

## Configuring Parameters

### Opening the Parameter Panel

1. Click **"Parameters"** in the sidebar menu
2. The parameter panel will expand showing all available settings

### Available Parameters

#### Core Parameters

**Temperature** (0.0 - 2.0)
- Controls randomness in responses
- **Lower values** (0.1 - 0.3): More focused, deterministic
- **Medium values** (0.7 - 0.9): Balanced creativity
- **Higher values** (1.0 - 2.0): More creative, diverse

**Top P** (0.0 - 1.0)
- Nucleus sampling threshold
- Lower values: More focused vocabulary
- Higher values: Broader word choices
- Default: 0.9

**Top K** (1 - 100)
- Limits vocabulary to top K tokens
- Lower values: More conservative
- Higher values: More variety
- Default: 40

**Repeat Penalty** (0.0 - 2.0)
- Penalizes repetition
- 1.0 = No penalty
- Higher values: Reduces repetitive text
- Default: 1.1

#### Advanced Parameters

**Context Window** (num_ctx)
- Maximum tokens to consider as context
- Range: 128 - 8192
- Default: 2048
- Larger values use more memory

**Max Tokens** (num_predict)
- Maximum tokens in response
- Range: 1 - 4096
- Default: 512
- Controls response length

**Stream Mode** (checkbox)
- ✓ **Enabled**: Responses appear word-by-word (real-time)
- ☐ **Disabled**: Full response appears at once
- Default: Enabled

**Seed** (optional)
- Set for reproducible results
- Leave empty for random seed
- Use same seed for consistent outputs

**Stop Sequences**
- Text patterns that end generation
- Add multiple stop sequences
- Useful for structured outputs

**Mirostat**
- Advanced sampling algorithm
- 0 = Disabled
- 1 or 2 = Enabled with different strategies

**Thread Count** (num_thread)
- CPU threads for generation
- More threads = Faster (up to a point)
- Default: 4

### Applying Parameters

1. Adjust any parameter using the sliders or input fields
2. Parameters apply to the **next message** you send
3. Each message can use different parameters
4. Parameters are saved per session

---

## Using Parameter Presets

### What are Presets?

Presets are pre-configured parameter combinations optimized for specific use cases.

### Available Presets

1. **Creative Writing**
   - High temperature (0.9)
   - High top_p (0.95)
   - Best for: Stories, poems, creative content

2. **Precise/Technical**
   - Low temperature (0.3)
   - Lower top_p (0.5)
   - Best for: Code, technical explanations, factual answers

3. **Balanced** (Default)
   - Moderate temperature (0.7)
   - Standard settings
   - Best for: General conversation

4. **Fast Response**
   - Optimized thread count
   - Lower max tokens
   - Best for: Quick answers, testing

### Applying a Preset

1. Open the Parameter Panel
2. Find the **"Preset"** dropdown at the top
3. Select your desired preset
4. All parameters will update automatically
5. You can still adjust individual parameters after applying a preset

---

## Context Management

### What is Context?

Context refers to the previous messages that the model "remembers" when generating a response. The application manages context automatically.

### Context Window Settings

**Default Context Size**: 10 messages

This means the model will consider the last 10 messages (5 exchanges) when generating a response.

### Context Indicator

Look for the **Context Indicator** in the chat interface:

```
┌─────────────────────────────────────┐
│ Context: 1024 / 2048 tokens (50%)  │
│ [████████████░░░░░░░░░░░░░]        │
└─────────────────────────────────────┘
```

This shows:
- **Current tokens**: Tokens in active context
- **Max tokens**: Context window limit
- **Usage percentage**: How full the context is
- **Visual bar**: Color-coded indicator
  - Green: < 70%
  - Yellow: 70-90%
  - Red: > 90%

### When Context is Full

When your conversation exceeds the context window:
- Older messages are automatically excluded
- The model won't "remember" messages outside the window
- The application manages this automatically
- No action needed from you

### Tips for Managing Context

1. **Start new sessions** for different topics
2. **Keep context size appropriate** for your use case
3. **Increase num_ctx parameter** if you need more context
4. **Be aware** that larger contexts use more memory

---

## Exporting Conversations

### Exporting to PDF

1. Open the session you want to export
2. Click **"Export"** in the sidebar menu
3. Select **"Export as PDF"**
4. Choose where to save the file
5. The PDF will include:
   - Session name and metadata
   - Model information
   - Complete conversation history
   - Timestamps

### PDF Contents

The exported PDF contains:
- **Header**: Session name
- **Metadata**: Model, creation date, message count
- **Messages**: Full conversation with roles clearly marked
- **Formatting**: Clean, readable layout

### Use Cases for Export

- Share conversations with team members
- Archive important interactions
- Documentation and record-keeping
- Review and analysis

---

## Tips and Best Practices

### Getting Better Responses

1. **Be specific**: Clearly state what you need
2. **Provide context**: Give relevant background information
3. **Use examples**: Show what you want
4. **Iterate**: Refine your prompts based on responses
5. **Adjust parameters**: Experiment with different settings

### Parameter Guidelines

**For creative tasks:**
- Temperature: 0.8 - 1.0
- Top P: 0.9 - 0.95

**For analytical tasks:**
- Temperature: 0.2 - 0.4
- Top P: 0.5 - 0.7

**For balanced conversation:**
- Use the default "Balanced" preset

### Session Organization

1. **Create separate sessions** for different projects
2. **Use descriptive names** for easy identification
3. **Delete old sessions** you no longer need
4. **Export important conversations** before deleting

### Performance Tips

1. **Choose appropriate models**: Smaller models respond faster
2. **Limit max tokens**: Shorter responses are quicker
3. **Adjust thread count**: Match your CPU capabilities
4. **Close unused sessions**: Free up resources

---

## Troubleshooting

### Common Issues and Solutions

#### "Cannot connect to Ollama"

**Problem**: The application can't reach your Ollama instance.

**Solutions**:
1. Verify Ollama is running: `ollama serve`
2. Check it's on port 11434: `curl http://localhost:11434`
3. Restart Ollama if needed
4. Check firewall settings

#### "Model not found"

**Problem**: Selected model isn't available.

**Solutions**:
1. Refresh the model list
2. Download the model if it's not installed
3. Check model name spelling
4. Verify disk space for download

#### Slow Responses

**Problem**: Responses take a long time.

**Solutions**:
1. Use a smaller model
2. Reduce max tokens (num_predict)
3. Increase thread count (num_thread)
4. Close other applications
5. Check system resources

#### Streaming Not Working

**Problem**: Responses appear all at once instead of streaming.

**Solutions**:
1. Enable "Stream" checkbox in parameters
2. Check WebSocket connection
3. Refresh the page
4. Clear browser cache

#### Context Errors

**Problem**: Model seems to "forget" previous messages.

**Solutions**:
1. Check context indicator
2. Increase num_ctx parameter
3. Reduce number of messages in session
4. Start a new session for new topics

#### Export Failed

**Problem**: PDF export doesn't work.

**Solutions**:
1. Check session has messages
2. Verify write permissions
3. Try exporting a different session
4. Check browser download settings

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for error messages (F12)
2. Verify Ollama logs for backend errors
3. Review the Architecture documentation
4. Check system resources (CPU, memory, disk)

### System Requirements

**Minimum**:
- Modern web browser (Chrome 90+, Firefox 88+, Edge 90+)
- Ollama installed and running
- 4GB RAM
- 10GB free disk space (for models)

**Recommended**:
- 8GB+ RAM
- 50GB+ free disk space
- Multi-core CPU (4+ cores)
- SSD storage

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in input |
| `Ctrl/Cmd + N` | New session |
| `Ctrl/Cmd + W` | Close current session |
| `Ctrl/Cmd + ,` | Open settings |
| `Ctrl/Cmd + /` | Toggle sidebar |
| `Ctrl/Cmd + E` | Export current session |

---

## Endpoint Types Explained

### Chat Endpoint

- **Use for**: Conversational interactions
- **Maintains**: Full conversation context
- **Best for**: Back-and-forth dialogue, Q&A sessions
- **Message format**: Structured with roles (user/assistant/system)

### Generate Endpoint

- **Use for**: Single-turn completions
- **Maintains**: Simple prompt-response
- **Best for**: Text completion, single questions
- **Message format**: Simple prompt text

**Recommendation**: Use **Chat** endpoint for most use cases.

---

## Glossary

**Context Window**: The amount of previous conversation the model can "see" and consider when generating a response.

**Endpoint**: The API method used to communicate with Ollama (Chat or Generate).

**Model**: A language model installed in Ollama (e.g., Llama 2, Mistral).

**Parameter**: A setting that controls how the model generates text.

**Preset**: A predefined set of parameters optimized for specific use cases.

**Session**: A single conversation thread with its own history.

**Streaming**: Real-time display of text as it's generated, word by word.

**Temperature**: Parameter controlling randomness (creativity) of outputs.

**Token**: A unit of text (roughly 4 characters) used to measure context and output length.

---

## Appendix: Model Recommendations

### General Purpose
- **llama2:7b**: Fast, good for conversation
- **llama2:13b**: Better quality, moderate speed
- **mistral:7b**: Excellent balance of speed and quality

### Code & Technical
- **codellama:7b**: Python, JavaScript, general coding
- **codellama:13b**: More complex code tasks
- **deepseek-coder**: Specialized for programming

### Creative Writing
- **llama2:13b**: Stories and creative content
- **nous-hermes**: Role-play and creative scenarios

### Lightweight/Fast
- **phi-2**: Very fast, good for simple tasks
- **tinyllama**: Minimal resource usage

### Research & Analysis
- **llama2:70b**: High-quality analytical responses (requires 40GB+ RAM)
- **mixtral:8x7b**: Mixture of experts, strong reasoning

---

## Safety and Privacy

### Data Privacy

- **All data stays local**: No data sent to external servers
- **Local database**: Conversations stored on your machine
- **No telemetry**: Application doesn't track usage
- **Complete control**: You own all your data

### Best Practices

1. Don't share sensitive information in conversations
2. Export and backup important sessions
3. Regularly delete old sessions you don't need
4. Keep Ollama and models updated

---

## Updates and Changelog

This user guide corresponds to **Version 1.0** of the Ollama Web Interface.

For latest updates and features, check the project documentation.

---

**Thank you for using the Ollama Web Interface!**

If you have questions or feedback, please refer to the other documentation files:
- **API.md**: Technical API reference
- **Architecture.md**: System design and architecture
- **CoreReference.md**: Developer reference for core functions

---

**Document Version**: 1.0  
**Last Updated**: December 3, 2025  
**Status**: Design Phase - Not Yet Implemented
