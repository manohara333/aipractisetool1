// ✅ App.js (CSS separated into App.css)
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Auth from './Auth';
import { supabase } from './supabaseClient';


function App() {
  const [question, setQuestion] = useState("Tell me about yourself.");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState("experienced");
  const [experiencedFeedback, setExperiencedFeedback] = useState("");
  const [fresherFeedback, setFresherFeedback] = useState("");
  const [suggestionFeedback, setSuggestionFeedback] = useState("");
  const [howToAnswerFeedback, setHowToAnswerFeedback] = useState("");

  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // 🔐 Check session after redirect (for Google login)
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);
      }
    };

    checkSession();
  }, []);

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  const handleSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech Recognition not supported in this browser. Use Chrome.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/interview", {
        question,
        answer,
      });
      const fullFeedback = response.data.feedback;
      setFeedback(fullFeedback);

      const extract = (label) => {
        const regex = new RegExp(`${label}:`, 'i');
        const parts = fullFeedback.split(regex);
        if (parts.length > 1) {
          const rest = parts[1].split(/(EXPERIENCED:|FRESHER:|SUGGESTIONS:|HOW TO ANSWER:)/i);
          return rest[0].trim();
        }
        return '';
      };

      setExperiencedFeedback(extract("EXPERIENCED"));
      setFresherFeedback(extract("FRESHER"));
      setSuggestionFeedback(extract("SUGGESTIONS"));
      setHowToAnswerFeedback(extract("HOW TO ANSWER"));
    } catch (error) {
      setFeedback("❌ Error fetching AI feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionByCategory = async (cat) => {
    setCategory(cat);
    setLevel("");
    setQuestion("Select a difficulty level to begin.");
    setAnswer("");
    setFeedback("");
    setExperiencedFeedback("");
    setFresherFeedback("");
    setSuggestionFeedback("");
    setHowToAnswerFeedback("");
  };

  const fetchQuestionByLevel = async (selectedLevel) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/interview/question/${category}/${selectedLevel}`);
      setLevel(selectedLevel);
      setQuestion(res.data.question);
      setAnswer("");
      setFeedback("");
      setExperiencedFeedback("");
      setFresherFeedback("");
      setSuggestionFeedback("");
      setHowToAnswerFeedback("");
    } catch (err) {
      setQuestion("⚠️ Error loading question.");
    }
  };

  const renderSection = (title, content) => {
    // Remove all possible score display lines from feedback sections
    let cleaned = content.trim()
      .replace(/\*\*FRESHER SCORE:\*\*[\s\S]*?\[.*?\/10\]/gi, '')
      .replace(/\*\*EXPERIENCED SCORE:\*\*[\s\S]*?\[.*?\/10\]/gi, '')
      .replace(/-\s*Score:\s*\d+\s*\/\s*10/gi, '')
      .replace(/-\s*Score\s*\(out of 10\):\s*\d+/gi, '')
      .replace(/-\s*Score\s*\(out of 10\)\s*:\s*\d+/gi, '')
      .replace(/-\s*Score\s*\(out of 10\):?\s*\d+/gi, '')
      .replace(/-\s*Score:?\s*\d+\s*\/\s*10/gi, '');
    return content ? (
      <div className="section-block">
        <h5 className="section-title">{title}</h5>
        <p className="section-text">{cleaned}</p>
      </div>
    ) : null;
  };

  return (
    <div className={`app-container ${fadeIn ? 'fade-in' : ''}`}>
      <div className="app-box">
        <div className="nav-button">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setIsAuthenticated(false);
            }}
            className="logout-button"
          >
            🚪 Log Out
          </button>
        </div>

        <div className="header">
          <h1><span>interview </span><span className="highlight">practice</span></h1>
          <p>Practice key questions, get feedback instantly, and improve your confidence.</p>
        </div>

        <div className="category-block">
          <h4>Select a Category:</h4>
          <button onClick={() => fetchQuestionByCategory('aws')} className={getCategoryButtonClass(category === 'aws', 'aws')}>AWS</button>
          <button onClick={() => fetchQuestionByCategory('devops')} className={getCategoryButtonClass(category === 'devops', 'devops')}>DevOps</button>
        </div>

        {category && (
          <div className="category-block">
            <h4>Select Difficulty:</h4>
            <button onClick={() => fetchQuestionByLevel('easy')} className={`tab-button easy ${level === 'easy' ? 'active' : ''}`}>Easy</button>
            <button onClick={() => fetchQuestionByLevel('medium')} className={`tab-button medium ${level === 'medium' ? 'active' : ''}`}>Medium</button>
            <button onClick={() => fetchQuestionByLevel('hard')} className={`tab-button hard ${level === 'hard' ? 'active' : ''}`}>Hard</button>
          </div>
        )}

        {level && (
          <div style={{ marginBottom: "20px" }}>
            <button onClick={() => fetchQuestionByLevel(level)} className="next-button">
              🔁 Next Question
            </button>
          </div>
        )}

        <h4>Interview Question:</h4>
        <p className="question-line"><strong>{category.toUpperCase() || "GENERAL"} {level && `(${level.toUpperCase()})`}:</strong> {question}</p>

        <textarea
          rows="6"
          placeholder="Type or speak your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="textarea-box"
        />

        <div className="action-buttons">
          <button onClick={handleSpeech} className="default-button">
            🎙️ {isListening ? "Listening..." : "Speak Answer"}
          </button>
          <button
            onClick={handleSubmit}
            className={`submit-button ${isLoading ? 'disabled' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? "⏳ Getting Feedback..." : "Get AI Feedback"}
          </button>
        </div>

        {feedback && (
          <div className="tab-buttons">
            <button onClick={() => setActiveTab("experienced")} className={`tab-button ${activeTab === "experienced" ? 'active' : ''}`}>Experienced</button>
            <button onClick={() => setActiveTab("fresher")} className={`tab-button ${activeTab === "fresher" ? 'active' : ''}`}>Fresher</button>
            <button onClick={() => setActiveTab("suggestions")} className={`tab-button ${activeTab === "suggestions" ? 'active' : ''}`}>Suggestions</button>
            <button onClick={() => setActiveTab("howto")} className={`tab-button ${activeTab === "howto" ? 'active' : ''}`}>How to Answer</button>
          </div>
        )}

        {feedback && (
          <div className="feedback-box">
            <h4>📝 AI Feedback:</h4>
            {activeTab === "experienced" && renderSection("EXPERIENCED", experiencedFeedback)}
            {activeTab === "fresher" && renderSection("FRESHER", fresherFeedback)}
            {activeTab === "suggestions" && renderSection("SUGGESTIONS", suggestionFeedback)}
            {activeTab === "howto" && renderSection("HOW TO ANSWER", howToAnswerFeedback)}
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryButtonClass(active, type) {
  return `category-button ${type} ${active ? 'active' : ''}`;
}

export default App;
