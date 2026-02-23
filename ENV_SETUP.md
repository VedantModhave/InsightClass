# Environment Setup Guide

This guide explains how to set up environment variables for local development.

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and fill in your values:
   ```bash
   # Required
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   JWT_SECRET=your-secret-key-here
   
   # LLM Configuration (choose one provider)
   LLM_PROVIDER=Anthropic
   ANTHROPIC_API_KEY=your-api-key
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your backend URL:
   ```bash
   VITE_API_BASE_URL=http://localhost:9000
   VITE_USE_MOCK_DATA=false
   ```

## Environment Variables Reference

### Backend Variables

#### Required
- `PORT` - Server port (default: 9000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens

#### LLM Configuration (Required for AI features)
- `LLM_PROVIDER` - AI provider: `Anthropic`, `OpenAI`, or `Google`
- `LLM_MODEL` - Model name for the chosen provider
- `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` - API key for chosen provider

#### Optional
- `BUCKET_NAME` - Cloud storage bucket name
- `STORAGE_BASE_PATH` - Base path for file storage
- `INFRA_PROVIDER` - Infrastructure provider (GCP, AWS, Azure)
- `IMAGE_GENERATION_PROVIDER` - Image generation provider
- `IMAGE_GENERATION_API_KEY` - API key for image generation
- `STRIPE_SECRET_KEY` - Stripe payment gateway key
- `GOOGLE_OAUTH_CLIENT_ID` - Google OAuth credentials
- `MCP_API_KEY` - Integration SDK API key

### Frontend Variables

#### Required
- `VITE_API_BASE_URL` - Backend API URL (e.g., http://localhost:9000)
- `VITE_USE_MOCK_DATA` - Use mock data instead of API (true/false)

#### Optional
- `VITE_AGENT_BASE_URL` - Agent SDK base URL
- `VITE_DEPLOYMENT_ID` - Deployment identifier
- `VITE_BUILDER_PLATFORM_LOGO` - Platform logo URL
- `VITE_BUILDER_PLATFORM_NAME` - Platform name
- `VITE_BUILDER_PLATFORM_URL` - Platform URL

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use strong secrets** - Generate random strings for JWT_SECRET
3. **Rotate keys regularly** - Update API keys and secrets periodically
4. **Use different values** - Use different credentials for dev/staging/production
5. **Limit access** - Only share credentials with team members who need them

## Troubleshooting

### Backend won't start
- Check if `DATABASE_URL` is correct
- Verify database is running and accessible
- Ensure all required environment variables are set

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` matches your backend URL
- Check if backend is running on the specified port
- Try setting `VITE_USE_MOCK_DATA=true` to test without backend

### AI features not working
- Verify you've set the correct `LLM_PROVIDER`
- Check that the corresponding API key is valid
- Ensure you have credits/quota on your AI provider account

## Production Deployment

For production deployments:

1. **Never use `.env` files** - Use your hosting platform's environment variable settings
2. **Set NODE_ENV=production** - Enables production optimizations
3. **Use secure secrets** - Generate new, strong secrets for production
4. **Enable HTTPS** - Always use HTTPS in production
5. **Set proper CORS** - Configure FRONTEND_DOMAIN and BACKEND_DOMAIN

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
