# StudyNotes - AI-Powered Study Material Generator

StudyNotes is a Next.js application that generates educational content using AI. The platform allows users to create study notes and practice papers on any subject or topic with ease.

## Features

- **AI-Generated Study Notes**: Create comprehensive notes on any subject
- **Custom Practice Papers**: Generate practice papers with adjustable difficulty levels
- **Text Summarizer**: AI-powered text summarization with various styles and lengths
- **Multi-Subject Support**: Works with mathematics, science, languages, history, and more
- **Premium Tiers**: Free tier with basic features, premium tiers with advanced options
- **Personal Library**: Save all generated content for future reference
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI Integration**: OpenRouter API (various LLM models)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenRouter API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gmmdabd/studynotes-ai.git
   cd studynotes-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   DATABASE_URL="postgresql://postgres:xxx@your-supabase-project.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:xxx@your-supabase-project.supabase.co:5432/postgres"
   OPENROUTER_API_KEY="your-openrouter-api-key"
   ```

4. Set up the database:
   Execute the SQL commands in `schema.sql` in your Supabase SQL Editor

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
studynotes-ai/
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # User dashboard pages
│   │   └── ...              # Other pages
│   ├── components/          # React components
│   │   ├── ui/              # UI components
│   │   └── ...              # Feature components
│   ├── lib/                 # Utility functions and services
│   └── types/               # TypeScript type definitions
└── ...
```

## Subscription Plans

| Feature                      | Free             | Premium          | Pro              |
|------------------------------|------------------|------------------|------------------|
| Note Generation              | 5 per day        | 50 per day       | Unlimited        |
| Practice Paper Generation    | ❌               | ✅               | ✅               |
| Text Summarization Storage   | ❌               | ✅               | ✅               |
| AI Model Quality             | Basic            | Advanced         | Premium          |
| Custom Prompts               | Limited          | Full Access      | Full Access      |
| Print & Export               | ✅               | ✅               | ✅               |
| Price                        | $0               | $9.99/month      | $19.99/month     |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenRouter](https://openrouter.ai) for providing access to various LLM models
- [Supabase](https://supabase.com) for database and auth
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Prisma](https://www.prisma.io/) for database access
