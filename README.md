# NeuralSnake

Welcome to **NeuralSnake**!  A game setup for High5Girls!
A fun snake game where you can either play yourself or control the snake using your own AI 🤖✨

---

## 🌐 Play the Game

The game is hosted on GitHub pages. </br>
👉 [https://hmhauter.github.io/NeuralSnake/](https://hmhauter.github.io/NeuralSnake/)

---

## 🎮 How to Play

### 🧍 Manual Mode
- Select **Manual** at the top
- Use your keyboard:
  - ⬆ Up Arrow
  - ⬇ Down Arrow
  - ⬅ Left Arrow
  - ➡ Right Arrow
- Press **Start** to begin

---

### 🤖 AI Mode (Teachable Machine)

1. Go to Teachable Machine
2. Create an **Image Project**
3. Add these classes:
   - `UP`
   - `DOWN`
   - `LEFT`
   - `RIGHT`
4. Train the model using your webcam
5. Click **Export → TensorFlow.js**
6. Copy the model link

Back in the game:
- Paste the link into the input field
- Click **Load Model**
- Switch to **AI mode**
- Allow webcam access
- Move your head to control the snake 🎥

---

## 📜 Game Rules

- The game ends when the snake hits the **border**
- The snake **can cross itself**
- Each food gives **+1 score**

---

## 🧠 How to Train a Good Model

To make your AI work well, follow these tips:

### ✅ Be consistent
- Always use the same movement for each direction  
  (e.g. tilt head left = LEFT)

### ✅ Record enough samples
- At least **50–100 images per class**

### ✅ Use different angles
- Move slightly, change lighting, don’t stay too static

### ✅ Add a “neutral” position (optional but helpful)
- Helps reduce random movements

### ❌ Avoid:
- Mixing movements (e.g. left sometimes looks like up)
- Training too fast with few samples
- Big background changes

💡 Tip: If the snake moves randomly, your model probably needs more training data.

---

## 💡 How It Works

This project is built with **React + TypeScript**.

### 🎮 Game Logic
- The snake is a list of positions
- The game updates every ~150ms
- A canvas draws:
  - the snake
  - the food
- Eating food:
  - increases score
  - grows the snake

---

### 🤖 AI Control
- The webcam runs in your browser
- The model from Teachable Machine is loaded via URL
- Every frame:
  - the model predicts a direction
  - the snake moves based on that
