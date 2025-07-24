
// Modern Professional LandingPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [role, setRole] = useState("AWS");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setRole(prev => (prev === "AWS" ? "DevOps" : "AWS"));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */} 
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'float 20s infinite linear',
        zIndex: 0
      }} />
      
      <style>
        {`
          @keyframes float {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-50px, -50px); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>

      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        animation: 'fadeInUp 1s ease-out'
      }}>
        <h1 style={{
          fontSize: "72px",
          fontWeight: "900",
          marginBottom: "24px",
          letterSpacing: "-0.03em",
          textShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <span style={{ color: "#ffffff" }}>interview </span>
          <span style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>practice</span>
        </h1>

        <div style={{ 
          marginTop: "20px", 
          textAlign: "center",
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <p style={{ 
            fontSize: "28px", 
            color: "rgba(255,255,255,0.9)", 
            marginBottom: "16px",
            fontWeight: "500"
          }}>
            A quick way to prepare for your next interview in
          </p>
          <span style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "16px",
            fontWeight: "700",
            fontSize: "22px",
            display: "inline-block",
            boxShadow: "0 8px 25px rgba(251, 191, 36, 0.3)",
            border: "2px solid rgba(255,255,255,0.2)"
          }}>
            {role}
          </span>
        </div>

        <p style={{
          color: "rgba(255,255,255,0.8)",
          marginTop: "32px",
          fontSize: "20px",
          maxWidth: "600px",
          textAlign: "center",
          lineHeight: "1.6",
          fontWeight: "400"
        }}>
          Practice key questions, get insights about your answers, and get more comfortable interviewing.
        </p>

        <button
          onClick={() => navigate("/practice")}
          style={{
            marginTop: "40px",
            padding: "18px 36px",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: "700",
            borderRadius: "16px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 12px 35px rgba(251, 191, 36, 0.4)",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 16px 45px rgba(47, 251, 36, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 12px 35px rgba(251, 191, 36, 0.4)";
          }}
        >
          Start practicing
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
