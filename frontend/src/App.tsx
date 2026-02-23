import { useState } from 'react'
import { useNavigate, Link, Route, Routes } from 'react-router-dom'
import RoutingTable from './Routing.tsx'
import './App.css'


function App() {
  // const [count, setCount] = useState(0)
  const navigate = useNavigate()

  return (
    <>
      <h1>High5Girls - NeuralSnake</h1>
      <div className="card">
        <button onClick={() => navigate("/game")}>
          Start
        </button>
      </div>
      <p className="read-the-docs">
        Control a game with AI 
      </p>
    </>
  )
}

export default App
