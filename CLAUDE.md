# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UCLan Find Me A Room is a Next.js 14 application that helps students find available rooms on the University of Central Lancashire Preston campus. It fetches real-time room availability data and displays it in an intuitive interface.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server on port 4321
- `npm run build` - Build the application for production
- `npm run start` - Start production server on port 4321
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run typecheck` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Development Workflow
Always run `npm run lint` and `npm run typecheck` after making changes to ensure code quality.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand for global state
- **Type Safety**: TypeScript with Zod schemas
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics + Umami tracking

### Key Directories

- `/app` - Next.js 14 App Router pages and layouts
  - `/(home)` - Homepage route group
  - `/find-free-room` - Building-based room search
  - `/room-availability-checker` - Room-specific availability checker
  - `/view-room-details` - Individual room timetable view
- `/components` - Reusable React components
  - `/ui` - Radix UI-based design system components
- `/lib` - Utility functions and API calls
- `/store` - Zustand state management stores
- `/types` - TypeScript type definitions with Zod schemas
- `/config` - Site configuration
- `/content` - Static content (building lists, etc.)

### Core Data Flow

1. **API Integration**: Room data fetched via `lib/apiCalls.ts` from external backend
2. **State Management**: Room data stored in Zustand stores (`store/roomStore.ts`)
3. **Type Safety**: All data validated using Zod schemas (`types/roomData.ts`)
4. **Component Architecture**: Radix UI primitives with custom styling

### Key Features

- **Room Search**: Find rooms by building or specific room name
- **Real-time Availability**: Check current room availability status
- **Timetable View**: Display detailed room schedules with FullCalendar
- **Dark Mode**: Theme switching with next-themes
- **Command Search**: Global command palette for navigation
- **Responsive Design**: Mobile-first responsive layout

### Environment Variables

The app uses `NEXT_PUBLIC_BACKEND_BASE_URL` for API calls to the external room data service.

### Component Conventions

- Use TypeScript with proper typing
- Follow the existing Radix UI + Tailwind CSS pattern
- Import from `@/` paths (configured in tsconfig.json)
- Use Zod schemas for data validation
- Implement proper error handling for API calls

### State Management Pattern

- Room data: `useRoomStore` (Zustand)
- Command bar: `useCommandBarStore` (Zustand)
- Theme: next-themes provider
- Use stores for shared state, local state for component-specific data