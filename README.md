# Bald Foodie Guy Showcase - Bald Foodie Guy Video Summaries

A modern, responsive video summary website for the "Bald Foodie Guy" channel, featuring honest supermarket food reviews. Built with React, Vite, and Node.js.

🔄 **Continuous Deployment**: Automatically deploys to Vercel when changes are pushed to GitHub.

##  Features

- **Video Summaries**: Quick browse through supermarket food reviews
- **AI-Powered Search**: Vector search using OpenAI embeddings for semantic understanding
- **Dual Search Modes**: Traditional text search and AI-powered semantic search
- **Modern Frontend**: React 19 with TypeScript and Vite
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Backend API**: Node.js + Express server with MongoDB Atlas Vector Search
- **Cloud Ready**: Configured for Vercel deployment

##  Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account with Vector Search enabled
- External system for generating and populating embeddings

##  Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with:
   ```bash
   MONGODB_URI=your_mongodb_atlas_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```
   
   Note: The OpenAI API key is needed to generate embeddings for search queries, not for the video embeddings (which are managed externally).

3. **Development**
   ```bash
   npm run dev      # Frontend
   npm run dev:api  # Backend
   ```

##  Tech Stack

**Frontend:** React 19 + TypeScript, Vite, Tailwind CSS, React Router

**Backend:** Node.js + Express, MongoDB, CORS enabled

**Deployment:** Vercel serverless functions, MongoDB Atlas

##  Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:api` - Start backend with auto-restart
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
##  Vector Search Setup

To enable AI-powered semantic search:

1. **MongoDB Atlas Vector Search Index**: Create a search index named `vector_index` on the `video_summaries` collection with the following configuration:
   ```json
   {
     "fields": [
       {
         "numDimensions": 1536,
         "path": "Embeddings",
         "similarity": "cosine",
         "type": "vector"
       }
     ]
   }
   ```

2. **Embeddings**: Ensure your external system populates the `Embeddings` field in the `video_summaries` collection with OpenAI embedding vectors (1536 dimensions).

3. **AI Search Only**: The application uses only AI-powered semantic search - no traditional text search.

##  Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard

##  Current Status

 **Completed:**
- Full-stack React + Node.js application
- MongoDB integration for video data
- Responsive UI with Tailwind CSS
- Video grid and detail pages
- YouTube embeds and search
- Vercel deployment ready

 **Future Enhancements:**
- Video categories and filtering
- User authentication and favorites
- Admin panel for content management
- Enhanced AI search features

---

**Built with  for the Bald Foodie Guy community**