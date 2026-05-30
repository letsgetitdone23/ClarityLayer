# Clarity Layer

Clarity Layer is an advanced chat interface designed to explicitly model AI uncertainty and expose the hidden context assumptions LLMs make.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and enter your values:
   * `GROQ_API_KEY`: Get a free key from the [Groq Console](https://console.groq.com).
   * `TAVILY_API_KEY`: Get a free key from [Tavily](https://tavily.com).

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to test the flow.

## Environment Variables Needed

* `GROQ_API_KEY` — Required for streaming chat responses and running post-generation Clarity analysis.
* `TAVILY_API_KEY` — Required for real-time web search capabilities.

## Deploy to Vercel

The easiest way to deploy your Next.js app is to use the **Vercel Platform**:

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. In the project settings, add the Environment Variables:
   * `GROQ_API_KEY`
   * `TAVILY_API_KEY`
4. Click **Deploy**. Vercel will automatically build the Next.js app and serve both the frontend and API routes (Serverless Functions) out of the box.
