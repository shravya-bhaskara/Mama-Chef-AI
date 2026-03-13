# MamaChef AI

## Overview
A full-stack AI-powered recipe assistant that helps mothers worldwide discover what to cook based on ingredients they have at home. It uses OpenAI to generate personalized recipe suggestions, YouTube for video recipes, and Google Custom Search for blog recipes.

## Architecture
- **Frontend**: React + TypeScript + Vite, using TailwindCSS and Radix UI components (shadcn/ui)
- **Backend**: Express.js (TypeScript) served via `tsx` in development
- **Database**: PostgreSQL via Drizzle ORM (Replit managed PostgreSQL)
- **AI**: OpenAI GPT-4o-mini via Replit AI Integration
- **Port**: 5000 (development and production)

## Project Structure
```
client/          # React frontend (Vite)
  src/           # App source (components, pages, hooks)
  index.html
server/          # Express backend
  index.ts       # Entry point
  routes.ts      # API routes (recipe generation, search)
  storage.ts     # Database access layer (Drizzle ORM)
  db.ts          # DB connection
  recipeSearch.ts # YouTube + Google search integration
  vite.ts        # Vite dev server middleware
  static.ts      # Static file serving (production)
shared/          # Shared types and route definitions
script/          # Build scripts
```

## Key Scripts
- `npm run dev` — Start development server (tsx + Vite)
- `npm run build` — Build for production
- `npm run start` — Run production build
- `npm run db:push` — Push schema to database

## Environment Variables
All secrets are managed via Replit Secrets:
- `DATABASE_URL` — PostgreSQL connection (Replit managed)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI key (Replit AI Integration)
- `YOUTUBE_API_KEY` — YouTube Data API v3
- `GOOGLE_SEARCH_API_KEY` — Google Custom Search API
- `GOOGLE_SEARCH_ENGINE_ID` — Google Custom Search Engine ID

## Dependencies
Notable packages: express, drizzle-orm, openai, react, vite, tailwindcss, @radix-ui/*, wouter, @tanstack/react-query, zod, framer-motion
