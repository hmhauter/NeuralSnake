import { useState } from "react"
import "./Game.css"

export default function Game() {
//   const [prediction, setPrediction] = useState("Waiting...")
  const [modelUrl, setModelUrl] = useState("")

  return (
    <div className="game-container">

      <div className="game-layout">

        {/* LEFT: GAME PANEL */}
        <div className="game-panel">
          <h2 className="panel-title">Snake Arena</h2>

          <div className="game-board">
            <p className="placeholder-text">Control 🐍 with AI...</p>
          </div>
        </div>

        {/* RIGHT: AI CONTROL PANEL */}
        <div className="ai-panel">
          <h2 className="panel-title">AI Motion Control</h2>

          {/* VIDEO FEED */}
          <div className="video-container">
            <video
              className="video-feed"
              autoPlay
              playsInline
              muted
            />
          </div>

          {/* DETECTION OUTPUT */}
          <div className="prediction-box">
            <span>Detected Movement:</span>
            <strong className="prediction-value">
              {}
            </strong>
          </div>

          {/* MODEL INPUT */}
          <div className="model-upload">
            <input
              type="text"
              placeholder="Paste Teachable Machine model URL..."
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              className="model-input"
            />
            <button className="small-btn">
              Load Model
            </button>
          </div>

          {/* CONTROL BUTTONS */}
          <div className="control-panel">
            <button className="control-btn">Start</button>
            <button className="control-btn secondary">Stop</button>
            <button className="control-btn danger">Reset</button>
          </div>

        </div>
      </div>
    </div>
  )
}