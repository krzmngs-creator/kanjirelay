const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 4;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

let drawing = false;
let canDraw = true;
let timeLeft = 10;
let timerId = null;

let players = [];
let currentTurn = 0;   // 0～2の3回
let turnOrder = [];     // 描く人の順番（回答者除外）
let answerer = 0;       // 回答者のindex

let themes = ["りんご","ねこ","でんしゃ","さくら","カレー","うみ","やま","がっこう","ゆき","おにぎり"];
let theme = "";

let phase = "draw"; // draw / answer
let drawings = []; // 各回の描画保存

// ========================
// 人数決定ボタン
// ========================
document.getElementById("setCountBtn").addEventListener("click", () => {
  const count = parseInt(document.getElementById("playerCount").value);
  if (!count || count < 1) {
    alert("1人以上を選択してください");
    return;
  }

  const nameFields = document.getElementById("nameFields");
  nameFields.innerHTML = ""; // リセット
  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.placeholder = `名前${i+1}`;
    input.className = "playerName";
    nameFields.appendChild(input);
    nameFields.appendChild(document.createElement("br"));
  }

  document.getElementById("nameInputs").style.display = "block";
});

// ========================
// スタートボタン
// ========================
document.getElementById("startGame").addEventListener("click", () => {
  players = Array.from(document.getElementsByClassName("playerName"))
    .map(input => input.value.trim())
    .filter(name => name);

  if (players.length < 2) {
    alert("2人以上名前を入力してください");
    return;
  }

  // お題ランダム
  theme = themes[Math.floor(Math.random() * themes.length)];
  console.log("お題:", theme);

  // 回答者ランダム
  answerer = Math.floor(Math.random() * players.length);
  alert(`🎯 ${players[answerer]} さんが回答者です！`);

  setupTurnOrder();

  currentTurn = 0;
  drawings = [];
  phase = "draw";

  document.getElementById("answerArea").style.display = "none";
  document.getElementById("nextBtn").style.display = "inline-block";

  nextTurn();
});

// ========================
// 描画順番作成（3回描画、回答者除外）
// ========================
function setupTurnOrder() {
  turnOrder = [];
  const drawPlayers = players.map((_, idx) => idx).filter(idx => idx !== answerer);
  for (let i = 0; i < 3; i++) {
    turnOrder.push(drawPlayers[i % drawPlayers.length]);
  }
}

// ========================
// ターン管理
// ========================
function nextTurn() {
  // 前の回の描画を保存（最初のターンは保存なし）
  if (phase === "draw" && currentTurn > 0) {
    const imageData = canvas.toDataURL("image/png");
    drawings.push(imageData);
  }

  // 3回描いたら回答者フェーズ
  if (currentTurn >= 3) {
    startAnswerPhase();
    return;
  }

  const playerIdx = turnOrder[currentTurn];
  phase = "draw";
  canDraw = true;

  document.getElementById("turn").textContent =
    `${players[playerIdx]} さんの番です（お題：${theme}）`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (timerId) clearInterval(timerId);
  startTimer();

  currentTurn++;
}

// ========================
// 回答者フェーズ
// ========================
function startAnswerPhase() {
  phase = "answer";
  canDraw = false;

  document.getElementById("turn").textContent =
    `${players[answerer]} さん、答えてください！`;
  document.getElementById("answerArea").style.display = "block";
  document.getElementById("nextBtn").style.display = "none";

  if (timerId) clearInterval(timerId);

  // 最後の描画も追加
  drawings.push(canvas.toDataURL("image/png"));

  // 全部の描画をまとめて表示
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawings.forEach((imgSrc, index) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const offsetX = index * 100;
      const offsetY = 0;
      ctx.drawImage(img, offsetX, offsetY, 100, 100);
    };
  });
}

// ========================
// 回答判定
// ========================
document.getElementById("answerBtn").addEventListener("click", () => {
  const answer = document.getElementById("answer").value.trim();
  if (!answer) return;

  if (answer === theme) {
    alert("🎉 正解！！！");
  } else {
    alert(`😢 ちがうよ！正解は「${theme}」でした`);
  }

  resetGame();
});

// ========================
// ゲームリセット
// ========================
function resetGame() {
  currentTurn = 0;
  drawings = [];
  document.getElementById("answer").value = "";
  document.getElementById("answerArea").style.display = "none";
  document.getElementById("turn").textContent = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ========================
// 次の人ボタン
// ========================
document.getElementById("nextBtn").addEventListener("click", () => {
  nextTurn();
});

// ========================
// タイマー
// ========================
function startTimer() {
  timeLeft = 10;
  document.getElementById("timer").textContent = timeLeft;

  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerId);
      canDraw = false;
      alert("時間切れ！");
    }
  }, 1000);
}

// ========================
// お絵かき処理
// ========================
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
      y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
    };
  } else {
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }
}

function startDraw(e) {
  if (!canDraw || phase !== "draw") return;
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing || !canDraw || phase !== "draw") return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function endDraw() {
  drawing = false;
}

// マウス
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);

// タッチ
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", endDraw);

// 消すボタン
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
