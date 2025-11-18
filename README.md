# AI-Powered Sentiment Aura

A real-time sentiment visualization application that captures speech, analyzes emotions, and displays them as a beautiful generative art experience. Built for the Memory Machines Full Stack Developer assessment.


## 🌟 Features

- **Real-time Speech Transcription** using Deepgram WebSocket API
- **AI-Powered Sentiment Analysis** with OpenAI/Anthropic integration
- **Live Generative Visualization** using Perlin noise fields that respond to emotions
- **5 Distinct Emotions** with unique color palettes and visual effects
- **Modern Glassmorphism UI** with smooth animations
- **Robust Fallback System** that works without external API dependencies

## 🏗️ Architecture

### Full-Stack Components:
1. **Frontend (React + p5.js)** - Captures audio, manages transcription, renders visualization
2. **Backend (FastAPI + Python)** - Processes text, calls AI APIs, returns structured sentiment data
3. **External APIs** - Deepgram (transcription) + OpenAI/Anthropic (sentiment analysis)

### Data Flow:
```
User Speech → Deepgram → Real-time Transcript → Backend AI Analysis → Sentiment Data → Perlin Noise Visualization
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- API Keys: Deepgram, OpenAI (or Anthropic)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd sentiment-aura
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Add your API keys to .env file
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_DEEPGRAM_API_KEY=your_deepgram_key_here" > .env
```

### 4. Add API Keys (Important: 2 separate .env files needed)

You need to create **2 different .env files** - one for frontend and one for backend:

#### Backend Environment File
**Create `/backend/.env` with:**
```env
OPENAI_API_KEY=sk-proj-your_openai_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
```

#### Frontend Environment File  
**Create `/frontend/.env` with:**
```env
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_key_here
```

**Note:** The frontend .env file requires the `REACT_APP_` prefix for React to access the environment variable.

#### How to Get API Keys:
- **Deepgram**: Sign up at https://deepgram.com (get $200 free credits)
- **OpenAI**: Get API key from https://platform.openai.com/api-keys  
- **Anthropic**: Get API key from https://console.anthropic.com (optional)

### 5. Run the Application

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python main.py
```
*Backend runs on http://localhost:8000*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```
*Frontend opens at http://localhost:3000*

## 🎮 Usage

1. **Open** http://localhost:3000 in your browser
2. **Click "START RECORDING"** and grant microphone permissions
3. **Speak naturally** - watch your words appear in real-time
4. **Observe the magic**:
   - Live transcription in the left panel
   - Keywords floating into the right panel
   - Sentiment/energy meters updating
   - Beautiful Perlin noise visualization responding to your emotions
5. **Try different emotions**:
   - *"I'm so excited and thrilled about this amazing project!"* → Joy
   - *"This is terrible and I'm really frustrated"* → Anger
   - *"Hello, this is a simple test"* → Neutral

## 🎨 Emotion System

The app detects **5 distinct emotions** with unique visual responses:

| Emotion | Sentiment Range | Color Palette | Visual Effect |
|---------|----------------|---------------|---------------|
| **Joy** | > 0.4 | Gold, Pink, Green | Bright bursts, upward energy |
| **Surprise** | 0.1 to 0.4 | Light blue, Soft colors | Scattered sparkles |
| **Neutral** | -0.1 to 0.1 | Blue, Teal, Orange | Balanced flow |
| **Anger** | -0.4 to -0.1 | Red, Dark red | Sharp, angular effects |
| **Sadness** | < -0.4 | Dark blue, Purple | Downward flow, muted colors |

## 🛠️ Technical Implementation

### Frontend Stack:
- **React** for component management
- **p5.js** for Perlin noise visualization
- **Deepgram SDK** for real-time speech transcription
- **Axios** for API communication

### Backend Stack:
- **FastAPI** for high-performance API server
- **OpenAI/Anthropic APIs** for sentiment analysis
- **Pydantic** for data validation
- **Python-dotenv** for environment management

### Key Features:
- **WebSocket integration** for real-time transcription
- **Async processing** with proper error handling
- **Intelligent fallback system** works without API keys
- **CORS configuration** for cross-origin requests
- **Responsive UI** with smooth animations

## 📁 Project Structure

```
sentiment-aura/
├── backend/
│   ├── main.py              # FastAPI server with AI integration
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # API keys (create this)
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── components/     # UI components
│   │   │   ├── AuraVisualization.js
│   │   │   ├── TranscriptDisplay.js
│   │   │   ├── KeywordsDisplay.js
│   │   │   └── Controls.js
│   │   └── styles/
│   │       └── App.css     # All styling and animations
│   ├── package.json        # Node dependencies
│   └── .env               # Deepgram API key (create this)
└── README.md
```

## 🎯 Assessment Criteria Met

This implementation demonstrates:

- ✅ **Full-Stack Orchestration** - Seamless integration between React frontend, FastAPI backend, and external APIs
- ✅ **Data-Driven Visualization** - Sentiment data directly drives color, motion, and form in the Perlin noise field
- ✅ **Frontend Polish** - Smooth transitions, graceful keyword animations, modern glassmorphism UI
- ✅ **Async Management** - Proper handling of WebSocket connections, API calls, and error states
- ✅ **Real-time Performance** - Sub-second response times from speech to visualization

## 🚀 Deployment

### Development:
- Backend: `python main.py` (runs on port 8000)
- Frontend: `npm start` (runs on port 3000)

### Production Considerations:
- Use environment-specific API keys
- Configure CORS for production domains
- Add HTTPS for microphone access
- Implement rate limiting and authentication
- Use production-ready hosting (Vercel, Heroku, etc.)

## 🤝 Contributing

This is a take-home assessment project for Memory Machines. The implementation showcases full-stack development skills, real-time AI integration, and creative visualization techniques.

## 📝 License

This project is created for the Memory Machines Full Stack Developer assessment.

---

**Built with ❤️ for Memory Machines - Showcasing the future of AI-powered human-computer interaction**