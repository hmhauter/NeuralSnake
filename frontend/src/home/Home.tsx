import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const startGame = () => {
    if (!name.trim()) return;
    // Carefule - usage of local storage -> will be firebase session
    localStorage.setItem("playerName", name.trim());

    navigate(`/game?player=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="home-container">
      <div className="background-blur"></div>

      <div className="landing-card">
        <h1 className="landing-title">
          High5Girls <br /> x <br />
          <span className="accent">NeuralSnake</span>
        </h1>

        <p className="landing-subtitle">Train AI. Play Smart. Slay the Grid.</p>
        <div className="login-section">
          <input
            className="name-input"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="start-button" onClick={startGame}>
            Start Game →
          </button>
        </div>
      </div>
    </div>
  );
}
