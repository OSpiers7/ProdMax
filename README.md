# ProdMax - Productivity Scheduling App

A comprehensive scheduling application based on the proven 90-minute productivity rule, featuring calendar management, focus timers, and detailed analytics.

## Features

- 📅 **Calendar Week View**: Google Calendar-like interface for scheduling tasks
- ⏱️ **Focus Timer**: 90-minute work sessions with 15-20 minute breaks
- 📊 **Analytics Dashboard**: Track time spent by category and subcategory
- 🏷️ **Category Management**: Hierarchical task organization
- 📱 **Responsive Design**: Mobile-first approach with PWA capabilities

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Query for state management
- Socket.io for real-time features

### Backend
- Node.js with Express
- TypeScript for type safety
- PostgreSQL database
- Prisma ORM
- Socket.io for real-time communication

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the development environment:**
   ```bash
   docker-compose up -d
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Project Structure

```
ProdMax/
├── frontend/          # React application
├── backend/           # Node.js API server
├── shared/            # Shared types and utilities
└── docker-compose.yml   # Development environment
```

## Development

- **Frontend**: `npm run dev:frontend`
- **Backend**: `npm run dev:backend`
- **Both**: `npm run dev`

## Database Setup

The application uses PostgreSQL with Prisma ORM. Database migrations are handled automatically during development.

## License

MIT
