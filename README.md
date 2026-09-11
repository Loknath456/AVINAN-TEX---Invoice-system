# AVINAN TEX Invoice System

A production-ready invoice management application built with React, TypeScript, Vite, and Supabase. The system allows users to create, manage, search, duplicate, and print GST-compliant invoices with company branding and client-specific business configuration.

## Overview

This application is designed for businesses that need a reliable invoice workflow with:

- Invoice creation and editing
- GST tax calculations
- Company logo and branding support
- Search and listing of invoice records
- Print-ready invoice layout
- Supabase-powered authentication and persistence

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase

## Project Structure

```text
.
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── integrations/
│   ├── lib/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
├── .env.example
├── .gitignore
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
└── ...
```

## Prerequisites

- Node.js 18+
- npm
- Supabase project access

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Environment Variables

This application uses the following environment variables in the browser:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

### Required values

- `VITE_SUPABASE_URL`: your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: your Supabase anonymous/public API key

Create a local `.env` file in the project root using the values from your Supabase project. Do not commit the real `.env` file.

### Vercel deployment

1. Open your Vercel project.
2. Go to Project Settings.
3. Open Environment Variables.
4. Add the required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Redeploy the application.

## Run Locally

```bash
npm run dev -- --host 0.0.0.0
```

## Production Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview -- --host 0.0.0.0
```

## Features

- Create and update invoices
- Auto-calculate GST and totals
- Manage company branding and logo
- Search, duplicate, and organize invoice records
- Print-ready invoice output
- Authentication and database integration via Supabase

## Deployment Notes

This project is intended to be deployed as a standalone frontend application with a Supabase backend configuration. Ensure the required environment variables are configured in the target environment before deployment.

## Security Notes

- Keep `.env` files private
- Do not commit API keys, secrets, or credentials
- Use environment variables for all runtime configuration

## License

This project is provided for client delivery and internal business use as applicable.
