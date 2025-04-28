# 🧠 AI Task Prioritizer

AI-powered Task Management App with real-time updates, drag & drop, and OpenAI smart task classification.

---

## 📸 Live Demo

[![AI Task Prioritizer Screenshot](https://i.postimg.cc/252THccM/image.png)](https://postimg.cc/qt68qLdx)

🚀 **Visit Live:** [https://ai-task-prioritizer.vercel.app/](https://ai-task-prioritizer.vercel.app/)

---

## ✨ Key Features

- 🧠 **AI Task Priority + Status Prediction** (using OpenAI)
- 🔥 **Guest Mode** (Use without login)
- ✅ **Authentication** (Login, Register, Forgot Password)
- 📦 **Real-time Sync** (Socket.IO)
- 🌙 **Dark/Light Mode**
- 🖐️ **Drag & Drop Tasks**
- 📈 **Task Analytics Dashboard**
- 📱 **PWA Supported** (Install as App)

---

## ⚙️ Tech Stack

| Frontend         | Backend             | AI & Extras          |
|------------------|---------------------|----------------------|
| React + Vite     | Node.js + Express    | OpenAI API           |
| TailwindCSS      | Prisma + PostgreSQL  | Socket.IO            |
| React Router     | JWT Authentication   | Railway + Vercel Hosting |
| PWA (Vite Plugin) | Nodemailer (Reset Email) | Real-time Updates  |

---

## 🛠️ Local Development Setup

### 1. Clone the Repo

```bash
git clone https://github.com/your_username/ai-task-prioritizer.git
cd ai-task-prioritizer
```

### 2. Backend Setup

```bash
cd server
npm install
npx prisma generate
npm run dev
```

✅ `.env` file in `server/` must have:

```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=your_openai_key
```

---

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

✅ `.env` file in `client/` must have:

```env
VITE_API_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your_openai_key
VITE_OPENAI_ENDPOINT=https://api.openai.com/v1/chat/completions
```

---

## 🌐 Production Deployment (Railway + Vercel)

- Backend ➡️ Hosted on **Railway**
- Frontend ➡️ Hosted on **Vercel**

✅ Update `.env` values properly on Railway & Vercel.  
✅ `useSocket.js` automatically adjusts WebSocket URL (`http → ws`) in production.  
✅ CORS setup includes localhost and Vercel site URL.

---

## 🧠 How AI Prioritization Works

- **Priority** (Low / Medium / High) based on:
  - End date closeness
  - Urgent keywords ("urgent", "now", "soon", "ASAP", "today")
  - Numbers detected in description (e.g., "50 pages")

- **Status** (Pending / In Progress / Completed) based on:
  - Start date compared to today
  - Title/description words like "done", "submitted"

✅ Fallback logic ensures prediction even if OpenAI fails!

---

## 📈 Analytics Dashboard Inside

- View tasks grouped by:
  - Priority
  - Status
  - Completion rates

✨ Using `ChartStats.jsx` inside the project.

---

## 📄 License

MIT License © 2025 — Built with ❤️ by **Al Jubair Hossain**

---

## 💬 Need Help?

Feel free to [open an issue](https://github.com/your_username/ai-task-prioritizer/issues) if you face any problems!

---

## 🛡️ Bonus Features Coming

- Add Open Graph metadata (better link previews).
- Add Google Analytics.

---

# 🚀 Let's Prioritize Smarter with AI!

---

## 📂 Folder Structure

```bash
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
```
