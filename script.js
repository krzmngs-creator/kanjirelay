const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let canDraw = true;
let timeLeft = 10;
let timerId = null;

let players = [];
let currentPlayer = 0;
let numDraws = 0;
let maxDraws = 3;
let answerer = 0;
let savedImages = [];

// --- 名前入力エリア作成 ---
document.getElementById("numPlayers").addEventListener("change", () => {
  const num = parseInt(document.getElementById("numPlayers").value);
  const container = document.getElementById("nameInputs");
  container.innerHTML = "";
  for (let i = 0; i < num; i++) {
    const input = document.createElement("input");
    input.placeholder = `名前${i+1}`;
    container.appendChild(input);
  }
});

// --- スタート ---
document.getElementById("startGame").addEventListener("click", () => {
  const inputs = document.getElementById("nameInputs").getElementsByTagName("input");
  players = [];
  for (let input of inputs) {
    const val = input.value.trim();
    if (val) players.push(val);
  }
  if (players.length < 2) { alert("名前を入力してください"); return; }

  // 回答者は先頭固定
  answerer = 0;
  currentPlayer = (answerer + 1) % players.length;
  numDraws = 0;
  savedImages = [];

  // 非表示／表示切り替え
  document.getElementById("answererScreen").style.display = "none";
  document.getElementById("turn").style.display = "block";
  document.getElementById("canvas").style.display = "block";
  document.getElementById("clearBtn").style.display = "inline-block";
  document.getElementById("nextBtn").style.display = "inline-block";

  nextTurn();
});

// --- キャンバスサイズ調整 ---
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

// --- 描画 ---
function getPos(e){
  if(e.touches){
    return {x: e.touches[0].clientX - canvas.offsetLeft,
            y: e.touches[0].clientY - canvas.offsetTop};
  }else{
    return {x: e.offsetX, y: e.offsetY};
  }
}
function startDraw(e){
  if(!canDraw) return;
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x,pos.y);
}
function draw(e){
  if(!drawing || !canDraw) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x,pos.y);
  ctx.stroke();
}
function endDraw(){drawing=false;}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", endDraw);

// --- ボタン ---
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
});
document.getElementById("nextBtn").addEventListener("click", () => {
  saveCanvas();
  numDraws++;
  if(numDraws >= maxDraws){
    showAnswererScreen();
  }else{
    nextTurn();
  }
});

// --- タイマー ---
function startTimer(){
  timeLeft=10;
  canDraw=true;
  document.getElementById("timer").textContent = timeLeft;
  if(timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if(timeLeft<=0){
      clearInterval(timerId);
      canDraw=false;
      alert("時間切れ！");
    }
  },1000);
}

// --- 次の人 ---
function nextTurn(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  document.getElementById("turn").textContent = `${players[currentPlayer]}さんの番です`;
  startTimer();
  currentPlayer = (currentPlayer + 1) % players.length;
  if(currentPlayer === answerer) currentPlayer = (currentPlayer + 1) % players.length; // 回答者は描かない
}

// --- 画像保存 ---
function saveCanvas(){
  savedImages.push(canvas.toDataURL());
}

// --- 回答者画面 ---
function showAnswererScreen(){
  document.getElementById("canvas").style.display="none";
  document.getElementById("clearBtn").style.display="none";
  document.getElementById("nextBtn").style.display="none";
  document.getElementById("turn").style.display="none";
  document.getElementById("answererScreen").style.display="block";

  const displayArea = document.getElementById("answererImages");
  displayArea.innerHTML="";
  for(let i=0;i<Math.min(3,savedImages.length);i++){
    const img = document.createElement("img");
    img.src = savedImages[i];
    displayArea.appendChild(img);
  }
}
