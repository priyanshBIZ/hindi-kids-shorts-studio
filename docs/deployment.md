# Deployment Guide

## Production Deployment (Vercel / Node.js / Docker)

### Environment Variables
Ensure all production environments supply the following variables:
- `GEMINI_API_KEY`: Google Gemini API Key
- `GEMINI_MODEL`: `gemini-2.5-flash`
- `DATABASE_URL`: Connection string (PostgreSQL for cloud deployments, or SQLite with persistent disk volume)
- `AUTH_SECRET`: Random 32+ character string

### Database Migration
Before launching the server, run:
```bash
npx prisma db push
# or
npx prisma migrate deploy
```

### Build & Run
```bash
npm run build
npm start
```
