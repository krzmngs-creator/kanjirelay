// --- お題 ---
const topics = [
  "りんご", "みかん", "さくらんぼ", "ぶどう",
  "もも", "すいか", "なし", "いちご", "パイナップル"
];

// --- キャンバス ---
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let canDraw = true;
let timeLeft = 10;
let timerId = null;

// --- ゲーム状態 ---
let players = [];
let answerer = 0;
let currentPlayer = 0;
let numDraws = 0;
const maxDraws = 3;
let savedImages = [];
let currentTopic = "";

// --- 人数選択＆名前入力 ---
function createNameInputs(num){
  const container = document.getElementById("nameInputs");
  container.innerHTML="";
  for(let i=0;i<num;i++){
    const input=document.createElement("input");
    input.placeholder=`名前${i+1}`;
    container.appendChild(input);
  }
}
createNameInputs(2);

document.getElementById("numPlayers").addEventListener("change",()=>{
  createNameInputs(parseInt(document.getElementById("numPlayers").value));
});

// --- スタート ---
document.getElementById("startGame").addEventListener("click",()=>{
  const inputs = document.getElementById("nameInputs").getElementsByTagName("input");
  players = [];
  for(let input of inputs){
    const val = input.value.trim();
    if(val) players.push(val);
  }
  if(players.length<2){alert("名前を入力してください"); return;}

  answerer = Math.floor(Math.random() * players.length);
  currentPlayer = (answerer + 1) % players.length;
  numDraws = 0;
  savedImages = [];
  currentTopic = topics[Math.floor(Math.random()*topics.length)];

  document.getElementById("prepareScreen").style.display="block";
  document.getElementById("answererInfo").textContent=
    `${players[answerer]}さんが回答者です。${players[currentPlayer]}さんにスマホを渡してください！`;

  document.getElementById("nameInputs").style.display="none";
  document.getElementById("startGame").style.display="none";
});

// --- 準備→書き手画面 ---
document.getElementById("goToWriting").addEventListener("click",()=>{
  document.getElementById("prepareScreen").style.display="none";
  document.getElementById("writingScreen").style.display="block";
  nextTurn();
});

// --- キャンバスサイズ ---
function resizeCanvas(){
  canvas.width = Math.min(window.innerWidth-20, 400);
  canvas.height = canvas.width;
}
window.addEventListener("load",resizeCanvas);
window.addEventListener("resize",resizeCanvas);

// --- 描画 ---
function getPos(e){
  if(e.touches){
    return {x:e.touches[0].clientX-canvas.offsetLeft,
            y:e.touches[0].clientY-canvas.offsetTop};
  }else{
    return {x:e.offsetX, y:e.offsetY};
  }
}
function startDraw(e){ e.preventDefault(); if(!canDraw) return; drawing=true; const pos=getPos(e); ctx.beginPath(); ctx.moveTo(pos.x,pos.y);}
function draw(e){ e.preventDefault(); if(!drawing||!canDraw) return; const pos=getPos(e); ctx.lineTo(pos.x,pos.y); ctx.stroke();}
function endDraw(e){ e.preventDefault(); drawing=false;}
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", endDraw);

// --- ボタン ---
document.getElementById("clearBtn").addEventListener("click",()=>{ctx.clearRect(0,0,canvas.width,canvas.height);});

// --- タイマー ---
function startTimer(){
  if(timerId) clearInterval(timerId);
  timeLeft=10; canDraw=true; document.getElementById("timer").textContent=timeLeft;
  timerId=setInterval(()=>{
    timeLeft--; document.getElementById("timer").textContent=timeLeft;
    if(timeLeft<=0){ clearInterval(timerId); canDraw=false; alert("時間切れ！"); }
  },1000);
}

// --- 次の人 ---
document.getElementById("nextBtn").addEventListener("click",()=>{
  if(timerId) clearInterval(timerId);
  saveCanvas();
  numDraws++;
  if(numDraws>=maxDraws){ showAnswererScreen(); }
  else{
    currentPlayer = (currentPlayer + 1) % players.length;
    if(currentPlayer===answerer) currentPlayer = (currentPlayer + 1) % players.length;
    nextTurn();
  }
});

function nextTurn(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  document.getElementById("topic").textContent = `お題：${currentTopic}`;
  document.getElementById("turn").textContent = `${players[currentPlayer]}さんの番です`;
  startTimer();
}

// --- 画像保存 ---
function saveCanvas(){ savedImages.push(canvas.toDataURL()); }

// --- 回答者画面 ---
function showAnswererScreen(){
  document.getElementById("writingScreen").style.display="none";
  const screen = document.getElementById("answererScreen");
  screen.style.display="block";
  document.getElementById("answererName").textContent = `${players[answerer]}さんが回答者です！`;
  document.getElementById("passMsg").textContent = `${players[answerer]}さんにスマホを渡してください！`;
  const displayArea = document.getElementById("answererImages");
  displayArea.innerHTML="";
  for(let i=0;i<Math.min(3,savedImages.length);i++){
    const img=document.createElement("img"); img.src=savedImages[i]; displayArea.appendChild(img);
  }
  document.getElementById("answerInput").value="";
  document.getElementById("result").textContent="";
}

// --- ひらがな変換 ---
function toHiragana(str){
  return str.replace(/[\u30a1-\u30f6]/g, ch=>String.fromCharCode(ch.charCodeAt(0)-0x60))
            .normalize("NFKC").replace(/\s+/g,"").toLowerCase();
}

// --- 回答入力 ---
document.getElementById("submitAnswer").addEventListener("click",()=>{
  const ans=toHiragana(document.getElementById("answerInput").value);
  const correct=toHiragana(currentTopic);
  if(ans===correct) document.getElementById("result").textContent=`正解！答えは「${currentTopic}」です`;
  else document.getElementById("result").textContent=`不正解！答えは「${currentTopic}」です`;
});

// --- もう一度遊ぶ ---
document.getElementById("playAgain").addEventListener("click",()=>{
  document.getElementById("writingScreen").style.display="none";
  document.getElementById("answererScreen").style.display="none";
  document.getElementById("answerInput").value="";
  document.getElementById("result").textContent="";
  document.getElementById("answererImages").innerHTML="";
  document.getElementById("answererName").textContent="";
  document.getElementById("passMsg").textContent="";
  numDraws=0; savedImages=[];
  answerer=Math.floor(Math.random()*players.length);
  currentPlayer=(answerer+1)%players.length;
  currentTopic=topics[Math.floor(Math.random()*topics.length)];
  document.getElementById("prepareScreen").style.display="block";
  document.getElementById("answererInfo").textContent=
    `${players[answerer]}さんが回答者です。${players[currentPlayer]}さんにスマホを渡してください！`;
});
