# CogniTrack 🧠

CogniTrack is an AI-powered cognitive health monitor and daily conversational companion. Designed as a friendly check-in assistant named **Alex**, the website conducts short, 4-question voice check-ins, extracts vocal and text biomarkers (speech pace, topic coherence, emotional valence, vocabulary richness), and generates a warm, personalized report filled with actionable advice, daily goals, and friendly reminders.

---

## 📸 Website Screenshot

### CogniTrack Interface
Interactive voice check-in website with collapsible history logs and custom chat interface.
![CogniTrack Website Interface](screenshots/screenshot.png)

---

## 🌟 Key Features

*   **🎙️ Interactive Voice Check-in**: A conversational voice interface equipped with a responsive 2D SVG companion mascot that reacts and tilts its head based on whether it is listening, thinking, speaking, or comfort-hugging.
*   **📝 Best Friend Reports**: Generates a warm WhatsApp-style personal message at the end of each 4-question conversation containing:
    *   💬 *How you seemed today* (Warm summaries referencing your words)
    *   🌟 *What I noticed about you* (Positive reinforcement)
    *   🤝 *Real talk from your friend* (3 concrete, helpful pieces of advice)
    *   🎯 *Your one thing for tomorrow* (A tiny, specific micro-action)
    *   💙 *I'm proud of you* (Warm validation)
*   **📁 Sidebar History Logs**: Slides open to reveal all completed sessions. You can expand any log to review the **complete dialogue history** (full transcripts of what you and Alex said) and reread the past reports.
*   **📊 Multivariate Trends**: Interactive Recharts-based line graph tracking speaking pace (Words Per Minute), semantic coherence %, and emotional valence across days.
*   **🚨 Cognitive Drift Detection**: Automatically monitors user biomarkers against their personal baseline over time to alert on noticeable changes (e.g. speaking slower, increased pauses, flatter vocal energy).

---

## 🛠️ Technology Stack

### Frontend (Client)
*   **Vite + React**: Core website skeleton.
*   **React Router**: Navigation routing between active check-ins and trends.
*   **Recharts**: Visualizes multivariate biomarker charts.
*   **Axios**: Manages HTTP communications with the backend API.
*   **CSS Variable Design System**: Premium frosted-glass neon dark aesthetic (`#0D0D1A` with purple, pink, and teal highlights).

### Backend (Server)
*   **FastAPI**: High-performance backend API.
*   **SQLAlchemy + SQLite**: Fast, lightweight local database persistence.
*   **Groq API (Llama-3.3-70b)**: Orchestrates conversational dialogue responses and generates session report summaries.
*   **Numpy**: Computes cognitive drift scores and standard deviations for baseline metrics.

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [Python](https://www.python.org/) (v3.9+)
*   Groq API Key (Set in `.env` file)

### Setup & Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Helnavshaji/CogniTrack.git
   cd CogniTrack
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   DATABASE_URL=sqlite:///./data/sessions.db
   ```

3. **Backend Setup**:
   ```bash
   # Create and activate python virtual environment
   python -m venv venv
   venv\Scripts\activate # On macOS/Linux: source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start the FastAPI server
   python backend/main.py
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   
   # Install node packages
   npm install
   
   # Run the Vite development server
   npm run dev
   ```
   Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🔒 License
Distributed under the MIT License. See `LICENSE` for more information.
