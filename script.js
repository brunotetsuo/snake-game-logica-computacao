/* ========= RANKING LOCAL STORAGE ========= */
let playerName = "";

function saveRanking(name, score) {
  const ranking = JSON.parse(localStorage.getItem("snakeRanking") || "[]");
  ranking.push({ name, score });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem("snakeRanking", JSON.stringify(ranking));
}

function loadRanking() {
  return JSON.parse(localStorage.getItem("snakeRanking") || "[]");
}

function showRanking() {
  const data = loadRanking();
  const rankingBox = document.getElementById("rankingBox");

  if (!data.length) {
    rankingBox.innerHTML = "<b>Ninguém jogou ainda!</b>";
  } else {
    rankingBox.innerHTML = "<h3>🏆 Ranking</h3>" +
      data.slice(0, 5).map(e => `${e.name}: ${e.score}`).join("<br>");
  }
}

let bgMusic = new Audio("music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const questionEl = document.getElementById("question");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const pauseBtn = document.getElementById("pauseBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const TILE_COUNT = 20;
let tileSize = canvas.width / TILE_COUNT;

const correctSound = new Audio("correct.wav");
const wrongSound = new Audio("failure.wav");

let questions = [
  { q: "Se, somente se", options: ["↔", "→"], correct: 0 },
  { q: "E", options: ["∨", "∧"], correct: 1 },
  { q: "True ∧ True", options: ["True", "False"], correct: 0 },
  { q: "True → False", options: ["False", "True"], correct: 0 },
  { q: "Não True", options: ["True", "False"], correct: 1 },
  { q: "True ∨ False", options: ["False", "True"], correct: 1 },
  { q: "¬(P ∧ ¬P)", options: ["V", "F"], correct: 0 },
  { q: "(P ↔ ¬P)", options: ["F", "V"], correct: 0 },
  { q: "A expressão ¬(¬P) é equivalente a:", options: ["P", "¬P"], correct: 0 },
  { q: "Se P → Q é falso, qual é o valor de P ∧ ¬Q?", options: ["Verdadeiro", "Falso"], correct: 0 },
  { q: "Operador que só é falso quando ambas são falsas", options: ["∨", "∧"], correct: 0 },
  { q: "Operador que representa 'não A ou B'", options: ["¬A ∨ B", "A ∧ ¬B"], correct: 0 },
  { q: "OU", options: ["∧", "∨"], correct: 1 },
  { q: "Se, Então", options: ["↔", "→"], correct: 1 },
  { q: "P ∨ Q =", options: ["H", "R"], correct: 0 },
  { q: "_ ↔ P = T", options: ["¬P", "P"], correct: 1 },
  { q: "_ ↔ P = F", options: ["¬P", "P"], correct: 0 },
];

questions = questions.sort(() => Math.random() - 0.5);

let snake, dir, nextDir, foods, score, gameOver, currentQuestion, paused;
let effectColor = null;
let effectTimer = 0;
let running = false;

/* ==== TIMER ===== */
let timeLeft = 60;
let timerInterval = null;

function startTimer() {
  timerInterval = setInterval(() => {
    if (!paused && !gameOver) {
      timeLeft--;

      if (timeLeft <= 10) {
        timerEl.style.color = timeLeft % 2 === 0 ? "#ff4d4d" : "#ffffff";
        timerEl.style.transform = timeLeft % 2 === 0 ? "scale(1.2)" : "scale(1)";
      }

      timerEl.textContent = "Tempo: " + timeLeft + "s";

      if (timeLeft <= 0) {
        gameOver = true;
        clearInterval(timerInterval);
        saveRanking(playerName, score);
      }
    }
  }, 1000);
}


function spawnFoods() {
  const pos = [];
  while (pos.length < 2) {
    const p = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT),
    };
    if (
      !snake.some((s) => s.x === p.x && s.y === p.y) &&
      !pos.some((f) => f.x === p.x && f.y === p.y)
    ) {
      pos.push(p);
    }
  }
  return pos;
}

function resetGame() {
  snake = Array.from({ length: 1 }, (_, i) => ({ x: 10 - i, y: 10 }));
  dir = { x: 0, y: 0 };
  nextDir = { x: 0, y: 0 };
  currentQuestion = 0;
  questionEl.textContent = "Clique em Iniciar para começar";
  foods = spawnFoods();
  score = 0;
  gameOver = false;
  paused = false;
  running = false;
  timeLeft = 60;
  timerEl.textContent = "Tempo: 1 Minuto";
  clearInterval(timerInterval);
  scoreEl.textContent = "Score: " + score;
  draw();
}

function setNextDir(x, y) {
  if (dir.x === -x && dir.y === -y) return;
  nextDir = { x, y };
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "arrowup" || key === "w") setNextDir(0, -1);
  if (key === "arrowdown" || key === "s") setNextDir(0, 1);
  if (key === "arrowleft" || key === "a") setNextDir(-1, 0);
  if (key === "arrowright" || key === "d") setNextDir(1, 0);
  if (key === " " && running) paused = !paused;
});

startBtn.addEventListener("click", () => {
  const input = document.getElementById("playerName");
  if (!input.value.trim()) return alert("Digite seu nome!");
  playerName = input.value.trim();

  bgMusic.play();
  startScreen.style.display = "none";
  resetGame();
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  running = true;
  questionEl.textContent = questions[currentQuestion].q;
  startTimer();
  requestAnimationFrame(loop);
});

showRanking();

pauseBtn.addEventListener("click", () => {
  if (!running) return;
  paused = !paused;
  if (paused) {
    pauseBtn.textContent = "Continuar";
    bgMusic.pause();
  } else {
    pauseBtn.textContent = "Pausar";
    bgMusic.play();
  }
});

function update() {
  if (gameOver || paused || !running) return;

  if (nextDir.x !== 0 || nextDir.y !== 0) dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0) head.x = TILE_COUNT - 1;
  if (head.x >= TILE_COUNT) head.x = 0;
  if (head.y < 0) head.y = TILE_COUNT - 1;
  if (head.y >= TILE_COUNT) head.y = 0;

  if (snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) {
    gameOver = true;
    clearInterval(timerInterval);
    saveRanking(playerName, score);
    return;
  }

  snake.unshift(head);

  const ateIndex = foods.findIndex(
    (f) => f.x === head.x && f.y === head.y
  );

  if (ateIndex !== -1) {
    const isCorrect = ateIndex === questions[currentQuestion].correct;

    if (isCorrect) {
      score++;
      correctSound.play();
      effectColor = "rgba(0,255,100,0.4)";
      // NÃO FAZ MAIS push, o crescimento ocorre pelo unshift sem pop
    } else {
      wrongSound.play();
      effectColor = "rgba(255,0,0,0.4)";
      if (snake.length <= 2) {
        gameOver = true;
        clearInterval(timerInterval);
        saveRanking(playerName, score);
      } else {
        snake.pop();
        snake.pop();
      }
    }

    scoreEl.textContent = "Score: " + score;
    currentQuestion = (currentQuestion + 1) % questions.length;
    questionEl.textContent = questions[currentQuestion].q;
    foods = spawnFoods();
    effectTimer = 15;
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tileSize = canvas.width / TILE_COUNT;

  snake.forEach((s, i) => {
    ctx.fillStyle = `rgba(126,231,135,${0.2 + 0.8 * (1 - i / snake.length)})`;
    ctx.fillRect(s.x * tileSize, s.y * tileSize, tileSize, tileSize);
  });

  foods.forEach((f, i) => {
    ctx.fillStyle = "#4dabf7";
    ctx.fillRect(f.x * tileSize, f.y * tileSize, tileSize, tileSize);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(questions[currentQuestion].options[i],
      f.x * tileSize + tileSize / 2,
      f.y * tileSize + tileSize / 2
    );
  });

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff6b6b";
    ctx.font = "bold 42px Inter";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);

    setTimeout(() => location.reload(), 1500);
  }
}

let frameCount = 0;
const speed = 10;

function loop() {
  if (!running) return;

  frameCount++;
  if (frameCount % speed === 0) update();
  draw();
  requestAnimationFrame(loop);
}

resetGame();
