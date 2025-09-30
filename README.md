# BFG Showcase - Bald Foodie Guy Video Summaries

A modern, responsive video summary website for the "Bald Foodie Guy" channel, featuring honest supermarket food reviews. Built with React, Vite, and Node.js.

🔄 **Continuous Deployment**: Automatically deploys to Vercel when changes are pushed to GitHub.

##  Features

- **Video Summaries**: Quick browse through supermarket food reviews
- **Modern Frontend**: React 19 with TypeScript and Vite
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Search Functionality**: Find product reviews quickly and easily
- **Backend API**: Node.js + Express server with MongoDB
- **Cloud Ready**: Configured for Vercel deployment

##  Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (for production)

##  Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

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
- Advanced search and filtering
- Video categories
- User authentication
- Admin panel

---

**Built with  for the Bald Foodie Guy community**