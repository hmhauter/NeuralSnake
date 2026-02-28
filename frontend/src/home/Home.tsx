import { useNavigate } from "react-router-dom"
import "./Home.css"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <div className="background-blur"></div>

      <div className="landing-card">
        <h1 className="landing-title">
            High5Girls <br /> x <br />
          <span className="accent">NeuralSnake</span>
        </h1>

        <p className="landing-subtitle">
          Train AI. Play Smart. Slay the Grid.
        </p>

        <button 
          className="start-button"
          onClick={() => navigate("/game")}
        >
          Start Game →
        </button>
      </div>
    </div>
  )
}