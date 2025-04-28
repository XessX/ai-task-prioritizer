🧠 AI Task Prioritizer

AI-powered Task Management App with real-time updates, drag & drop, and OpenAI smart task classification.

📸 Live Demo

[![image.png](https://i.postimg.cc/252THccM/image.png)](https://postimg.cc/qt68qLdx)

Website Preview:

🚀 Visit Live: https://ai-task-prioritizer.vercel.app/

✨ Key Features
🧠 AI Task Priority + Status Prediction (using OpenAI)

🔥 Guest Mode (Use without login)

✅ Authentication (Login, Register, Forgot Password)

📦 Real-time Sync (Socket.IO)

🌙 Dark/Light Mode

🖐️ Drag & Drop Tasks

📈 Task Analytics Dashboard

📱 PWA Supported (Install as App)

⚙️ Tech Stack

Frontend	Backend	AI & Extras
React + Vite	Node.js + Express	OpenAI API
TailwindCSS	Prisma + PostgreSQL	Socket.IO
React Router	JWT Auth	Railway + Vercel Hosting
PWA (Vite Plugin)	Nodemailer (Reset Email)	Real-time Updates

🛠️ Local Development Setup

1. Clone the Repo
bash

git clone https://github.com/your_username/ai-task-prioritizer.git
cd ai-task-prioritizer
2. Backend Setup
bash

cd server
npm install
npx prisma generate
npm run dev
✅ .env file in server/ must have:

env

DATABASE_URL=your_postgresql_url
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=your_openai_key
3. Frontend Setup

bash

cd ../client
npm install
npm run dev
✅ .env file in client/ must have:

env

VITE_API_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your_openai_key
VITE_OPENAI_ENDPOINT=https://api.openai.com/v1/chat/completions
🌐 Production Deployment (Railway + Vercel)
Backend ➡️ Railway Hosting

Frontend ➡️ Vercel Hosting

✅ Update .env values on Railway & Vercel properly.

✅ In production useSocket.js, WebSocket URL auto-fixes from http to ws.

✅ CORS setup includes localhost and Vercel URL.

🧠 How AI Prioritization Works
Predicts Priority (Low / Medium / High) based on:

End date closeness

Urgent words ("urgent", "now", "soon", etc.)

Numbers detected in description (e.g., "50 pages")

Predicts Status (Pending / In Progress / Completed) based on:

Start date compared to today

Keywords like "done", "submitted"

Fallback logic guarantees classification even if OpenAI fails.

📈 Analytics Dashboard Inside using Chartstat

📄 License
MIT License © 2024 — Built with ❤️ by Al_Jubair_Hossain

💬 Need Help?
Feel free to open an issue if you face any problems!

Add "Install App" PWA prompt popup.

🚀 Let's Prioritize Smarter with AI!
📂 Folder Structure (Optional Section)
bash

ai-task-prioritizer/
├── server/
│   ├── prisma/
│   ├── services/
│   ├── utils/
│   ├── index.js
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── screenshots/
│   └── .env
├── README.md
└── package.json