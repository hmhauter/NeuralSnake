import { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import "./Game.css"

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

const GRID = 20
const SIZE = 400

export default function Game() {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [running, setRunning] = useState(false)

  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const [mode, setMode] = useState<"manual" | "ai">("manual")
  const [modelUrl, setModelUrl] = useState("")

  

  /* GAME LOOP */

  useEffect(() => {
    if (!running) return

    const interval = setInterval(updateGame, 150)

    return () => clearInterval(interval)
  })

  /* KEYBOARD CONTROLS */

  useEffect(() => {

    const handleKey = (e: KeyboardEvent) => {

      if (e.key === "ArrowUp") changeDirection("UP")
      if (e.key === "ArrowDown") changeDirection("DOWN")
      if (e.key === "ArrowLeft") changeDirection("LEFT")
      if (e.key === "ArrowRight") changeDirection("RIGHT")

    }

    window.addEventListener("keydown", handleKey)

    return () => window.removeEventListener("keydown", handleKey)

  }, [direction])

  /* GAME UPDATE */

  function changeDirection(newDir: Direction) {

    const opposite: Record<Direction, Direction> = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT"
  }

  // Prevent reversing
  if (opposite[direction] === newDir) return

  setDirection(newDir)
}

  function updateGame() {

    setSnake(prev => {

      const head = { ...prev[0] }

      if (direction === "UP") head.y--
      if (direction === "DOWN") head.y++
      if (direction === "LEFT") head.x--
      if (direction === "RIGHT") head.x++

      /* BORDER COLLISION */

      if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= GRID ||
        head.y >= GRID
      ) {
        setRunning(false)
        setGameOver(true)
        return prev
      }

      const newSnake = [head, ...prev]

      /* FOOD COLLISION */

      if (head.x === food.x && head.y === food.y) {

        setScore(s => s + 1)

        setFood({
          x: Math.floor(Math.random() * GRID),
          y: Math.floor(Math.random() * GRID)
        })

      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }

  /* DRAW */

  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0c0c18"
    ctx.fillRect(0, 0, SIZE, SIZE)

    /* FOOD */

    const fx = food.x * 20 + 10
    const fy = food.y * 20 + 10

    ctx.beginPath()
    ctx.arc(fx, fy, 8, 0, Math.PI * 2)

    ctx.fillStyle = "#ff2bd6"
    ctx.shadowColor = "#ff2bd6"
    ctx.shadowBlur = 15

    ctx.fill()

    ctx.shadowBlur = 0

    /* SNAKE */

    snake.forEach((segment, i) => {

      ctx.fillStyle = i === 0 ? "#7df9ff" : "#8affb5"

      ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20)

    })

  }, [snake, food])

  /* RESET */

  function resetGame() {

    setSnake([{ x: 10, y: 10 }])
    setDirection("RIGHT")
    setFood({ x: 5, y: 5 })
    setRunning(false)
    setGameOver(false)
    setScore(0)

  }

  return (
    <div className="game-container">


      <div className="game-layout">

        {/* LEFT: GAME */}

        <div className="game-panel">

          <h2 className="panel-title">Snake Arena</h2>

        {/* MODE SWITCH */}

      <div className="mode-switch">
        <button
          className={mode === "manual" ? "mode-btn active" : "mode-btn"}
          onClick={() => setMode("manual")}
        >
          Manual
        </button>

        <button
          className={mode === "ai" ? "mode-btn active" : "mode-btn"}
          onClick={() => setMode("ai")}
        >
          AI
        </button>

        <div className="score-display">
          Score: {score}
        </div>

      </div>

          <div className="game-board">
           {gameOver && (
            <div className="gameover-overlay">
              <h2>Game Over</h2>
              <p>Your Score: {score}</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              className="snake-canvas"
            ></canvas>



            {/* {mode === "manual" && (
              <div className="control-overlay">

                <button onClick={() => setDirection("UP")}>⬆</button>

                <div>
                  <button onClick={() => setDirection("LEFT")}>⬅</button>
                  <button onClick={() => setDirection("DOWN")}>⬇</button>
                  <button onClick={() => setDirection("RIGHT")}>➡</button>
                </div>

              </div>
            )} */}

          </div>

          <div className="control-panel">

            <button className="control-btn" onClick={() => setRunning(true)}>
              Start
            </button>

            <button className="control-btn secondary" onClick={() => setRunning(false)}>
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
            <Webcam
              audio={false}
              screenshotFormat="image/jpeg"
              width={400}
              mirrored={true}
            />
          </div>

          <div className="prediction-box">
            <span>Detected Movement:</span>
            <strong className="prediction-value">
              Waiting...
            </strong>
          </div>

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

        </div>

      </div>
    </div>
  )
}