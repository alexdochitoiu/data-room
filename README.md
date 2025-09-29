# Data Room - Social Login Implementation

A Next.js TypeScript application with social authentication using Google and GitHub OAuth providers.

## Features

- ✅ **Social Login**: Google & GitHub OAuth integration
- ✅ **NextAuth.js**: Secure authentication with JWT sessions
- ✅ **Protected Routes**: Middleware-based route protection
- ✅ **TypeScript**: Full type safety
- ✅ **Tailwind CSS**: Modern UI styling
- ✅ **Bun**: Fast package manager and runtime

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

#### GitHub OAuth Setup

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Data Room
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

**Important**: 
- Generate a strong `NEXTAUTH_SECRET` for production
- Replace all placeholder values with your actual OAuth credentials

### 4. Run the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── auth/signin/            # Custom sign-in page
│   ├── dashboard/              # Protected dashboard
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Home page
├── components/
│   ├── Navigation.tsx          # Navigation with auth state
│   └── Providers.tsx           # Session provider wrapper
├── types/
│   └── next-auth.d.ts         # NextAuth type extensions
└── middleware.ts              # Route protection middleware
```

## Authentication Flow

1. **Sign In**: Users click "Sign In" → redirected to custom sign-in page
2. **Provider Selection**: Choose Google or GitHub
3. **OAuth Redirect**: Redirected to provider for authentication
4. **Callback**: Provider redirects back with auth code
5. **Session Creation**: NextAuth creates JWT session
6. **Protected Access**: Middleware protects specified routes

## Protected Routes

The following routes are protected by authentication middleware:

- `/dashboard/*` - Main dashboard area
- `/profile/*` - User profile pages
- `/admin/*` - Administrative pages

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Security Considerations

- Environment variables for sensitive data
- Secure JWT sessions
- HTTPS required in production
- CSRF protection enabled by default
- Secure cookie settings

## Next Steps

1. **Configure OAuth Apps**: Set up Google and GitHub OAuth applications
2. **Update Environment**: Add your OAuth credentials to `.env.local`
3. **Test Authentication**: Try signing in with both providers
4. **Customize UI**: Modify components to match your design
5. **Add Features**: Implement file upload, user management, etc.
