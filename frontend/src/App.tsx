import { Route, Routes } from "react-router-dom";
import Game from "./game/Game";
import Home from "./home/Home";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  );
}

export default App;
