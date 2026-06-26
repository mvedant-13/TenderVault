# TenderVault

A full-stack Tender Management System with AI-assisted features, built using the MERN stack.

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **AI:** OpenAI/Anthropic API (planned)

## Current Progress
- [x] Project structure set up (client + server)
- [x] Express server running with MongoDB connection (local, via Mongoose)
- [ ] Auth APIs (register/login)
- [ ] Tender CRUD APIs
- [ ] Bid submission APIs
- [ ] Frontend pages
- [ ] AI feature integration
- [ ] Deployment

## Setup Instructions
\`\`\`bash
cd server
npm install
cp .env.example .env   # then fill in your values
npm run dev
\`\`\`

## Environment Variables (server/.env)
\`\`\`
PORT=5000
MONGO_URI=your_mongodb_connection_string
\`\`\`