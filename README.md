# Data Room

A modern, secure file management system built with Next.js and TypeScript. This production-ready application provides cloud-based file storage with folder organization, file sharing, and OAuth authentication.

🌐 **Live Demo**: [https://data-room-doc.vercel.app](https://data-room-doc.vercel.app)

## Features

- 📁 **File & Folder Management**: Create, organize, and manage files in a hierarchical folder structure
- ☁️ **Cloud Storage**: Vercel Blob storage for secure, scalable file uploads
- 🔐 **OAuth Authentication**: Sign in with Google or GitHub
- 📱 **Responsive Design**: Modern UI built with shadcn/ui and Tailwind CSS
- 🔍 **File Search**: Real-time search across files and folders
- 📊 **File Conflict Resolution**: Smart conflict handling during file uploads
- 🗂️ **Multiple View Modes**: Tree view and flat file view for different workflows
- 🛡️ **Error Boundaries**: Comprehensive error handling and user feedback
- ⚡ **Performance Optimized**: Built with Next.js 15 App Router for speed

## Technology Stack

- **Frontend**: Next.js 15.5.4, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon for production)
- **Authentication**: NextAuth.js with Google/GitHub OAuth
- **Storage**: Vercel Blob (production), Local filesystem (development)
- **State Management**: Zustand
- **Validation**: Zod for type-safe schema validation
- **Deployment**: Vercel Platform

## Local Development

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (local or cloud)
- OAuth applications (Google and GitHub)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/alexdochitoiu/data-room.git
   cd data-room
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Environment Configuration**

   Create a `.env.local` file:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/dataroom"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"

   # Vercel Blob (optional for development)
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   bunx prisma generate

   # Run migrations
   bunx prisma db push
   ```

5. **Start Development Server**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

### OAuth Provider Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth configuration
│   │   ├── files/          # File management APIs
│   │   ├── folders/        # Folder management APIs
│   │   └── upload/         # File upload endpoints
│   ├── dashboard/          # Main application dashboard
│   ├── not-found.tsx      # 404 error page
│   ├── error.tsx          # Error boundary
│   └── loading.tsx        # Loading states
├── components/
│   ├── DocumentView/      # Main file manager interface
│   ├── ui/                # shadcn/ui components
│   └── modals/            # Modal dialogs
├── lib/
│   ├── auth.ts            # Authentication configuration
│   ├── storage.ts         # Cloud storage abstraction
│   └── store.ts           # Zustand state management
├── prisma/
│   └── schema.prisma      # Database schema
└── types/                 # TypeScript type definitions
```

## Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production (includes Prisma generation)
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting
- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Run database migrations (development)
- `bun run db:push` - Push schema changes to database
- `bun run db:seed` - Seed database with initial data

## Production Deployment

This application is deployed on Vercel with:

- **Database**: Neon PostgreSQL
- **Storage**: Vercel Blob
- **Authentication**: OAuth with domain verification
- **CDN**: Automatic optimization and global distribution

## Future Enhancements

#### Performance

- 📄 Pagination with infinite loading
- 🎯 Smart filtering by content and file properties
- 🔍 Enhanced search with fuzzy matching

#### UI/UX

- 📊 Grid view layout
- 📱 Better mobile experience / responsiveness

#### Data Management

- 🗂️ Smart archive system with restore option
- 📋 Bulk operations (multi-select)
- 🔄 File versioning and history

#### Advanced Features

- 👥 Real-time collaboration
- 🔗 Advanced sharing with permissions
