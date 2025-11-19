# ResumeMatch AI - Frontend

A modern, professional web application for AI-powered resume screening built with React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **File Upload**: React Dropzone
- **Date Utilities**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- Python backend running on http://localhost:8000 (see parent directory)

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 🚀 Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js app router pages
│   ├── dashboard/           # Dashboard pages
│   │   ├── page.tsx        # Main dashboard
│   │   └── layout.tsx      # Dashboard layout with sidebar
│   ├── upload/             # Resume upload page
│   ├── analytics/          # Analytics dashboard
│   ├── settings/           # Settings page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   ├── Sidebar.tsx
│   ├── TopNav.tsx
│   ├── StatsCard.tsx
│   └── Logo.tsx
├── lib/                    # Utilities and API
│   ├── api.ts             # API client and functions
│   └── utils.ts           # Helper functions
├── public/                # Static assets
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: `#1E40AF` (Deep Blue)
- **Secondary**: `#059669` (Emerald Green)
- **Accent**: `#F59E0B` (Amber)
- **Background Light**: `#F9FAFB`
- **Background Dark**: `#111827`

### Components
- Glassmorphism cards for modern UI
- Consistent spacing and typography
- Dark mode support
- Responsive design (mobile-first)

## 🔗 API Endpoints

The frontend expects the following backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/jobs` - Create job posting
- `GET /api/jobs` - List jobs
- `POST /api/resumes/upload` - Upload resumes
- `GET /api/resumes/analyze/:jobId` - Analyze resumes
- `POST /api/chat` - RAG Q&A
- `GET /api/analytics/dashboard` - Get analytics

## 🌐 Pages

1. **Landing Page** (`/`) - Marketing page with features
2. **Dashboard** (`/dashboard`) - Overview with stats and recent activity
3. **Upload** (`/upload`) - Resume upload and job description input
4. **Analytics** (`/analytics`) - Charts and insights
5. **Comparison** (`/comparison`) - Side-by-side candidate comparison
6. **Settings** (`/settings`) - API keys and preferences

## 🔐 Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 📝 License

MIT

## 👨‍💻 Development Team

Built with ❤️ for modern recruitment
