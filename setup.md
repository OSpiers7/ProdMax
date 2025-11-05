# ProdMax Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Database
```bash
docker-compose up -d
```

### 3. Setup Backend Environment
```bash
cd backend
cp env.example .env
# Edit .env file with your database credentials
```

### 4. Setup Database
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 5. Setup Frontend Environment
```bash
cd frontend
cp env.example .env
# Edit .env file with your API URL
```

### 6. Start Development Servers
```bash
# From root directory
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5432

## Project Structure

```
ProdMax/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── services/      # API Services
│   │   ├── store/         # State Management
│   │   └── types/         # TypeScript Types
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Route Handlers
│   │   ├── middleware/    # Auth & Error Handling
│   │   ├── routes/        # API Routes
│   │   └── services/      # Business Logic
│   └── prisma/           # Database Schema
├── shared/            # Shared Types
└── docker-compose.yml # Development Environment
```

## Features Implemented

✅ **Project Structure**: Complete monorepo setup
✅ **Database Schema**: PostgreSQL with Prisma ORM
✅ **Authentication**: JWT-based auth system
✅ **API Routes**: Complete REST API
✅ **Frontend Layout**: Responsive navigation
✅ **State Management**: Zustand store
✅ **Type Safety**: Shared TypeScript types

## Next Steps

1. **Calendar Component**: Implement React Big Calendar
2. **Timer Component**: Build focus timer with Socket.io
3. **Analytics Dashboard**: Add Chart.js visualizations
4. **Task Management**: Complete CRUD operations
5. **Real-time Features**: Socket.io integration

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test
```
