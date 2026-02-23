# InsightClass - AI-Powered Classroom Decision Support Platform

An intelligent platform that helps teachers understand learning patterns and receive tailored instructional guidance through AI-powered analysis of classroom data.

## 🚀 Quick Start

### Prerequisites
- Node.js 22.17.0 or higher
- PostgreSQL database
- AI API key (Anthropic, OpenAI, or Google Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd edu-insight-pro-641633
   ```

2. **Set up Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database URL and API keys
   npm install
   npm run db:generate
   npm run db:push
   npm run dev
   ```

3. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your backend URL
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5000
   - Backend: http://localhost:9000

## 📚 Documentation

- [Environment Setup Guide](./ENV_SETUP.md) - Detailed environment configuration
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Netlify and other platforms

## 🏗️ Project Structure

```
├── backend/              # Node.js/Hono API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middlewares/  # Express middlewares
│   │   └── prisma/       # Database schema
│   └── .env.example      # Environment template
│
├── frontend/             # React/Vite application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── lib/          # Utilities
│   └── .env.example      # Environment template
│
└── docs/                 # Documentation
```

## ✨ Features

- **AI-Powered Analysis**: Leverages Claude, GPT, or Gemini for intelligent insights
- **Learning Pattern Detection**: Identifies student learning patterns automatically
- **Risk Assessment**: Proactive identification of students needing support
- **Teaching Copilot**: Interactive AI assistant for classroom guidance
- **CSV Data Import**: Easy upload of classroom data
- **Real-time Insights**: Instant analysis and recommendations
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Built-in theme switching

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Hono
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Anthropic Claude, OpenAI GPT, Google Gemini
- **Authentication**: JWT

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite (Rolldown)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI SDK**: Vercel AI SDK

## 🔒 Security

- Environment variables are never committed to git
- JWT-based authentication
- Secure API key management
- CORS protection
- Input validation with Zod

## 📝 Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Netlify:
1. Push code to GitHub
2. Connect repository to Netlify
3. Set base directory to `frontend`
4. Add environment variables
5. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Uptiq Platform](https://uptiq.dev)
- AI powered by Anthropic Claude
- UI components inspired by modern design systems

## 📧 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ for educators
