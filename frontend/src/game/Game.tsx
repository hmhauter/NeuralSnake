import * as tmImage from "@teachablemachine/image";
import { useEffect, useRef, useState } from "react";

import "./Game.css";
import {
  saveScore,
  subscribeToLeaderboard,
} from "../firebase";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID = 20;
const SIZE = 400;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [running, setRunning] = useState(false);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const modeRef = useRef(mode);

  const [modelUrl, setModelUrl] = useState("");
  const [prediction, setPrediction] = useState("Stopped");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [aiLeaderboard, setAiLeaderboard] = useState<any[]>([]);
  const [manualLeaderboard, setManualLeaderboard] = useState<any[]>([]);

  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const aiRunningRef = useRef(false);
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);

  /* KEEP MODE REF UPDATED */
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  /* GAME LOOP */
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(updateGame, 150);
    return () => clearInterval(interval);
  }, [running]);

  /* KEYBOARD CONTROLS */
  useEffect(() => {
    if (mode === "ai") return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") changeDirection("UP");
      if (e.key === "ArrowDown") changeDirection("DOWN");
      if (e.key === "ArrowLeft") changeDirection("LEFT");
      if (e.key === "ArrowRight") changeDirection("RIGHT");
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, direction]);

  useEffect(() => {
    const unsubscribeAI = subscribeToLeaderboard("ai", setAiLeaderboard);
    const unsubscribeManual = subscribeToLeaderboard(
      "manual",
      setManualLeaderboard,
    );

    return () => {
      unsubscribeAI();
      unsubscribeManual();
    };
  }, []);

  function changeDirection(newDir: Direction) {
    const opposite: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    if (opposite[direction] === newDir) return;
    setDirection(newDir);
  }

  /* LOAD MODEL */
  async function loadModel() {
    if (!modelUrl) return;

    const model = await tmImage.load(
      modelUrl + "model.json",
      modelUrl + "metadata.json",
    );

    modelRef.current = model;
    setModelLoaded(true);
  }

  /* AI LOOP */
  async function loop() {
    if (!aiRunningRef.current) return;

    const webcam = webcamRef.current;
    const model = modelRef.current;
    if (!webcam || !model) return;

    webcam.update();

    const predictions = await model.predict(webcam.canvas);

    const best = predictions.reduce((a: any, b: any) =>
      a.probability > b.probability ? a : b,
    );

    if (best.probability > 0.8) {
      setPrediction(best.className);

      if (modeRef.current === "ai") {
        changeDirection(best.className as Direction);
      }
    }

    requestAnimationFrame(loop);
  }

  /* START AI */
  async function startAI() {
    if (!modelRef.current) return;

    setAiLoading(true);

    const webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();

    webcamRef.current = webcam;
    setWebcamReady(true);

    setAiLoading(false);

    aiRunningRef.current = true;
    loop();
  }

  /* STOP AI */
  function stopAI() {
    aiRunningRef.current = false;
    setAiLoading(false);
    if (webcamRef.current) {
      webcamRef.current.stop();
      webcamRef.current = null;
    }

    setWebcamReady(false);
    setPrediction("Stopped");
  }

  /* ATTACH WEBCAM TO DOM */
  useEffect(() => {
    if (mode !== "ai" || !webcamReady) return;

    const container = videoContainerRef.current;
    const webcam = webcamRef.current;

    if (container && webcam) {
      container.innerHTML = "";
      container.appendChild(webcam.canvas);
    }
  }, [mode, webcamReady]);

  /* GAME UPDATE */
  function updateGame() {
    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const currentScore = scoreRef.current;

    const head = { ...currentSnake[0] };
    const dir = directionRef.current;

    if (dir === "UP") head.y--;
    if (dir === "DOWN") head.y++;
    if (dir === "LEFT") head.x--;
    if (dir === "RIGHT") head.x++;

    // WALL COLLISION
    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
      setRunning(false);
      setGameOver(true);
      const name = localStorage.getItem("playerName") || "anonymous";
      saveScore(name, currentScore, mode);
      return;
    }

    const ateFood = head.x === currentFood.x && head.y === currentFood.y;

    const newSnake = [head, ...currentSnake];
    if (!ateFood) newSnake.pop();

    // Update states AND refs together
    setSnake(newSnake);
    snakeRef.current = newSnake;

    if (ateFood) {
      const newScore = currentScore + 1;
      setScore(newScore);
      scoreRef.current = newScore;

      const newFood = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
      setFood(newFood);
      foodRef.current = newFood;
    }
  }

  /* DRAW */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0c0c18";
    ctx.fillRect(0, 0, SIZE, SIZE);

    const fx = food.x * 20 + 10;
    const fy = food.y * 20 + 10;

    ctx.beginPath();
    ctx.arc(fx, fy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ff2bd6";
    ctx.shadowColor = "#ff2bd6";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? "#7df9ff" : "#8affb5";
      ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });
  }, [snake, food]);

  function resetGame() {
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setFood({ x: 5, y: 5 });
    setRunning(false);
    setGameOver(false);
    setScore(0);
  }

  return (
    <div className="game-container">
      <div className="game-layout">
        {/* LEFT: GAME */}
        <div className="game-panel">
          <h2 className="panel-title">Snake Arena</h2>

          <div className="mode-switch">
            <button
              className={mode === "manual" ? "mode-btn active" : "mode-btn"}
              disabled={running}
              onClick={() => {
                if (running) return;
                setMode("manual");
                stopAI();
              }}
            >
              Manual
            </button>

            <button
              className={mode === "ai" ? "mode-btn active" : "mode-btn"}
              disabled={running || !modelLoaded}
              onClick={async () => {
                if (running || !modelLoaded) return;
                setMode("ai");
                await startAI();
              }}
            >
              AI
            </button>

            <div className="score-display">Score: {score}</div>
          </div>
          {!modelLoaded && (
            <div className="model-status">
              Load a model trained on UP, DOWN, LEFT, RIGHT to enable AI
            </div>
          )}
          <div className="game-board">
            {gameOver && (
              <div className="gameover-overlay">
                <h2>Game Over</h2>
                <p>Your Score: {score}</p>
                <button onClick={resetGame}>Play Again</button>
              </div>
            )}
            {aiLoading && (
              <div className="gameover-overlay">
                <h2>Starting Camera...</h2>
                <p>Please allow camera access</p>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              className="snake-canvas"
            />
          </div>

          <div className="control-panel">
            <button className="control-btn" onClick={() => setRunning(true)}>
              Start
            </button>

            <button
              className="control-btn secondary"
              onClick={() => setRunning(false)}
            >
              Stop
            </button>

            <button className="control-btn danger" onClick={resetGame}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT: AI PANEL */}
        <div className="ai-panel">
          <h2 className="panel-title">AI Motion Control</h2>

          <div className="video-container">
            {mode === "ai" && <div ref={videoContainerRef} />}
          </div>

          <div className="prediction-box">
            <span>Detected Movement:</span>
            <strong className="prediction-value">{prediction}</strong>
          </div>

          <div className="rules-box">
            <h3>Game Rules</h3>
            <ul>
              <li>Game ends when snake hits the border</li>
              <li>Snake can cross itself</li>
            </ul>
          </div>

          <div className="model-upload">
            <input
              type="text"
              placeholder="Paste Teachable Machine model URL..."
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              className="model-input"
            />

            <button className="small-btn" onClick={loadModel}>
              Load Model
            </button>
          </div>

          <div className="model-status">
            {modelLoaded
              ? "✅ Model Loaded"
              : "❌ No Model Loaded (Required for AI mode)"}
          </div>

          <div className="rules-box">
            <h3>🤖 AI Leaderboard</h3>
            {aiLeaderboard.map((entry, i) => (
              <div key={i} className="leaderboard-item">
                <span>
                  {i + 1}. {entry.name}
                </span>
                <strong>{entry.score}</strong>
              </div>
            ))}

            <h3 style={{ marginTop: "16px" }}>🎮 Manual Leaderboard</h3>
            {manualLeaderboard.map((entry, i) => (
              <div key={i} className="leaderboard-item">
                <span>
                  {i + 1}. {entry.name}
                </span>
                <strong>{entry.score}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
