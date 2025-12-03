# New Features Added - Session Management & Parameters

## Overview
Added comprehensive session management and Ollama parameter control to the web interface.

## Features Added

### 1. Session Rename/Save Functionality

**Location**: Sidebar → Sessions list

**How to Use**:
1. Open the sidebar (☰ menu button)
2. Find the session you want to rename in the "Sessions" list
3. Click the ✏️ (pencil) icon next to the session name
4. Enter the new name in the modal dialog
5. Click "Save" or press Enter

**Backend API Used**: 
- `PUT /api/sessions/{id}` - Updates session name
- Sessions are automatically saved to the database

**Note**: Sessions are automatically saved as you chat. The rename feature simply allows you to give them more meaningful names after creation.

---

### 2. Ollama Parameters Control Panel

**Location**: Sidebar → Bottom section (collapsible accordion)

**Parameters Available**:

#### Basic Parameters (Always Visible):
- **Temperature** (0.0 - 2.0)
  - Controls randomness in generation
  - Lower = more focused and deterministic
  - Higher = more creative and random
  - Default: 0.7

- **Top P** (0.0 - 1.0)
  - Nucleus sampling threshold
  - Controls diversity via probability mass
  - Default: 0.9

- **Top K** (1 - 100)
  - Limits vocabulary selection to top K tokens
  - Reduces unlikely token selection
  - Default: 40

- **Repeat Penalty** (0.0 - 2.0)
  - Penalizes token repetition
  - Higher values = less repetitive output
  - Default: 1.1

#### Advanced Parameters (Collapsible):
- **Context Window (num_ctx)** (128 - 8192)
  - Size of context window in tokens
  - Larger = more context but slower
  - Default: 2048

- **Max Tokens (num_predict)** (1 - 4096)
  - Maximum tokens to generate per response
  - Default: 512

- **Threads (num_thread)** (1 - 32)
  - Number of CPU threads to use
  - Adjust based on your system
  - Default: 4

- **Mirostat** (0, 1, 2)
  - Alternative sampling algorithm
  - 0 = Disabled (default)
  - 1 or 2 = Mirostat sampling

- **Mirostat Tau** (0.0 - 10.0)
  - Target entropy for Mirostat
  - Only visible when Mirostat enabled

- **Mirostat Eta** (0.0 - 1.0)
  - Learning rate for Mirostat
  - Only visible when Mirostat enabled

- **Seed** (optional number)
  - Random seed for reproducible results
  - Leave empty for random generation

- **Enable Streaming** (toggle)
  - Stream responses in real-time
  - Default: ON

#### Reset Button:
- Click "Reset to Defaults" to restore all parameters to default values

---

## UI Layout

```
┌─────────────────────────────────────┐
│ ☰  Ollama Web Interface    🌙 📄   │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Sidebar                Main Chat   │
│  ┌──────────┐          ┌──────────┐│
│  │ New      │          │ Messages ││
│  │ Session  │          │          ││
│  ├──────────┤          │          ││
│  │ Models   │          └──────────┘│
│  │ (select) │                      │
│  ├──────────┤          ┌──────────┐│
│  │ Sessions │          │ Context  ││
│  │  Name ✏️ │          │ Indicator││
│  │  Name ✏️ │          ├──────────┤│
│  │          │          │ Input    ││
│  ├──────────┤          │ Area     ││
│  │ ⚙️       │          └──────────┘│
│  │ Params   │                      │
│  │ (expand) │                      │
│  └──────────┘                      │
└─────────────────────────────────────┘
```

---

## Technical Details

### Files Modified:
1. **`frontend/src/App.tsx`**
   - Added rename session modal
   - Added state management for parameters
   - Integrated ParametersPanel component
   - Added rename button to session list

2. **`frontend/src/components/chat/ParametersPanel.tsx`** (NEW)
   - Complete parameters control interface
   - Collapsible sections for organization
   - Real-time parameter updates
   - Reset to defaults functionality

3. **`frontend/src/components/chat/ParametersPanel.css`** (NEW)
   - Styling for parameters panel

### API Endpoints Used:
- `GET /api/parameters/defaults` - Get default parameters
- `PUT /api/sessions/{id}` - Update session name
- `POST /api/chat/generate` - Send parameters with each request

### State Management:
- Parameters are stored in App state
- Changes apply immediately to all new generations
- Each chat request includes current parameter values
- Reset restores original defaults from backend

---

## User Workflow Examples

### Example 1: Creative Writing
1. Create new session for story writing
2. Open parameters panel
3. Increase Temperature to 1.2-1.5
4. Increase num_predict to 2048
5. Start chatting for creative output

### Example 2: Code Generation
1. Create session for coding help
2. Set Temperature to 0.2-0.4 (more deterministic)
3. Set repeat_penalty to 1.3 (avoid repetitive code)
4. Increase context window to 4096 if working with large files

### Example 3: Reproducible Results
1. Set a specific seed value (e.g., 12345)
2. Generate response
3. Use same seed later to get similar results

---

## Tips

1. **Parameters persist** during the session but reset on page reload
2. **Test different values** to find what works best for your use case
3. **Start with defaults** and adjust incrementally
4. **Streaming** provides better UX but can be disabled if needed
5. **Rename sessions** to keep track of different topics/tasks

---

## Keyboard Shortcuts

- `Enter` in rename modal → Save
- `Esc` in any modal → Cancel/Close

---

## Future Enhancements (Potential)

- [ ] Save parameter presets per session
- [ ] Parameter profiles (Creative, Balanced, Precise)
- [ ] Visual indicators for non-default parameters
- [ ] Parameter change history/undo
- [ ] Export parameters with session
- [ ] Import/export parameter configurations
