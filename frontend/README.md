# Ollama Web Interface - Frontend

React + TypeScript frontend for the Ollama Web Interface.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **React Bootstrap** - UI components
- **Axios** - HTTP client
- **Bootstrap 5** - CSS framework

## Setup

1. Install Node.js 18+

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

Create a `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Project Structure

```
src/
├── components/     # React components (to be expanded)
├── contexts/       # React contexts (Theme, etc.)
├── services/       # API client
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Development

The frontend proxies API requests to the backend at `http://localhost:8000`.

This is configured in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- ✅ Light/Dark theme toggle
- ✅ Responsive sidebar
- ✅ API client setup
- ✅ TypeScript types for all data models
- 🔄 Chat interface (to be expanded)
- 🔄 Model management UI (to be expanded)
- 🔄 Parameter configuration panel (to be expanded)

## Next Steps for UI Development

The basic structure is in place. To continue development:

1. Create chat components in `src/components/chat/`
2. Create model management components in `src/components/models/`
3. Create parameter panel components in `src/components/parameters/`
4. Implement WebSocket for streaming
5. Add session management UI
6. Implement export functionality

## API Integration

The API client is ready in `src/services/api.ts` with all backend endpoints:

- Model management
- Session CRUD
- Message handling
- Parameter presets
- PDF export

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
