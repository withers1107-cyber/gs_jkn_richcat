const cvs = document.getElementById("c");
const ctx = cvs.getContext("2d");

const bgCvs = document.getElementById("outer-bg");
const bgCtx = bgCvs.getContext("2d");

function resizeOuterBg() {
  bgCvs.width = window.innerWidth;
  bgCvs.height = window.innerHeight;
}
window.addEventListener("resize", resizeOuterBg);
resizeOuterBg();

const HANDS = new Array(
  { className: "hand-rock", color: "#ff7675" },
  { className: "hand-scissors", color: "#ffeaa7" },
  { className: "hand-paper", color: "#74b9ff" }
);
const ARROWS = new Array("←", "↓", "↑", "→");
const JUDGE_Y = 220;
const WIN_SCORE = 10000;

let score = 0;
let combo = 0;
let bossHand = 1;
let laneHands = new Array(0, 1, 2, 0);
let noteTimer = 0;
let bossTimer = 0;
let notes = new Array();
let effects = new Array();
let bgCats = new Array();
let outerCats = new Array();
let isGameClear = false;

const bgColors = new Array("#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe");
const noteCatColors = new Array("#ffffff", "#ffeaa7", "#fab1a0", "#81ecec", "#dfe6e9");

for (let i = 0; i < 14; i++) {
  bgCats.push({
    x: Math.random() * 400,
    y: Math.random() * 650,

    size: 16 + Math.random() * 20,
speed: 0.3 + Math.random() * 0.5,
swayOffset: Math.random() * Math.PI * 2,
color: bgColors[i % 5],
isPaw: (i % 3 === 0)
});
}
for (let i = 0; i < 24; i++) {
outerCats.push({
x: Math.random() * window.innerWidth,
y: Math.random() * window.innerHeight,
size: 20 + Math.random() * 26,
speed: 0.4 + Math.random() * 0.6,
swayOffset: Math.random() * Math.PI * 2,
color: bgColors[i % 5],
isPaw: (i % 2 === 0)
});
}
function syncCssHands() {
const bossEl = document.getElementById("boss-hand-el");
bossEl.className = "css-hand boss-scale " + HANDS[bossHand].className;
for (let i = 0; i < 4; i++) {
const laneEl = document.getElementById("lane-hand-" + i);
laneEl.className = "css-hand " + HANDS[laneHands[i]].className;
}
}
function randomizeLaneHands() {
const winHand = (bossHand + 2) % 3;
for (let i = 0; i < 4; i++) {
laneHands[i] = Math.floor(Math.random() * 3);
}
laneHands[Math.floor(Math.random() * 4)] = winHand;
syncCssHands();
}
function resetGame() {
score = 0;
combo = 0;
bossHand = 1;
noteTimer = 0;
bossTimer = 0;
notes = new Array();
effects = new Array();
isGameClear = false;
document.getElementById("retry-btn").style.display = "none";
document.getElementById("css-crown").style.display = "none";
randomizeLaneHands();
notes.push({ lane: Math.floor(Math.random() * 4), y: 600, colorIndex: 0 });
updateUI();
loop();
}
randomizeLaneHands();
notes.push({ lane: Math.floor(Math.random() * 4), y: 600, colorIndex: 0 });
// 基本の猫輪郭描画（ボス猫・レーン枠・背景用）
function drawCat(targetCtx, x, y, s, color, alpha, hasFace) {
targetCtx.save();
if (alpha !== undefined) targetCtx.globalAlpha = alpha;
targetCtx.fillStyle = color;
targetCtx.beginPath();
targetCtx.moveTo(x - s * 0.8, y - s * 0.2);
targetCtx.lineTo(x - s * 0.9, y - s * 0.9);
targetCtx.lineTo(x - s * 0.3, y - s * 0.5);
targetCtx.lineTo(x + s * 0.3, y - s * 0.5);
targetCtx.lineTo(x + s * 0.9, y - s * 0.9);
targetCtx.lineTo(x + s * 0.8, y - s * 0.2);
targetCtx.bezierCurveTo(x + s * 0.9, y + s * 0.6, x - s * 0.9, y + s * 0.6, x - s * 0.8, y - s * 0.2);
targetCtx.fill();
if (hasFace) {
targetCtx.fillStyle = "#16161d";
targetCtx.beginPath();
targetCtx.arc(x - s * 0.3, y - s * 0.05, s * 0.1, 0, Math.PI * 2);
targetCtx.arc(x + s * 0.3, y - s * 0.05, s * 0.1, 0, Math.PI * 2);
targetCtx.fill();
}
targetCtx.restore();
}
// ★流れるノーツ用のとびきり可愛い猫描画関数
function drawCuteNoteCat(targetCtx, x, y, s, bodyColor) {
targetCtx.save();
// 1. ふっくら丸みのある顔の輪郭
targetCtx.fillStyle = bodyColor;
targetCtx.strokeStyle = "#2d3436";
targetCtx.lineWidth = 2;
targetCtx.beginPath();
targetCtx.moveTo(x - s * 0.85, y - s * 0.15);
targetCtx.lineTo(x - s * 0.92, y - s * 0.92);
targetCtx.lineTo(x - s * 0.32, y - s * 0.52);
targetCtx.quadraticCurveTo(x, y - s * 0.58, x + s * 0.32, y - s * 0.52);
targetCtx.lineTo(x + s * 0.92, y - s * 0.92);
targetCtx.lineTo(x + s * 0.85, y - s * 0.15);
targetCtx.bezierCurveTo(x + s * 1.05, y + s * 0.68, x - s * 1.05, y + s * 0.68, x - s * 0.85, y - s * 0.15);
targetCtx.closePath();
targetCtx.fill();
targetCtx.stroke();
// 2. ピンクの耳の内側（左右）
targetCtx.fillStyle = "#ff7675";
targetCtx.beginPath();
targetCtx.moveTo(x - s * 0.72, y - s * 0.35);
targetCtx.lineTo(x - s * 0.78, y - s * 0.75);
targetCtx.lineTo(x - s * 0.42, y - s * 0.5);
targetCtx.closePath();
targetCtx.fill();
targetCtx.beginPath();
targetCtx.moveTo(x + s * 0.72, y - s * 0.35);
targetCtx.lineTo(x + s * 0.78, y - s * 0.75);
targetCtx.lineTo(x + s * 0.42, y - s * 0.5);
targetCtx.closePath();
targetCtx.fill();
// 3. ほっぺたの赤み（チーク）
targetCtx.fillStyle = "rgba(255, 118, 117, 0.55)";
targetCtx.beginPath();
targetCtx.ellipse(x - s * 0.52, y + s * 0.18, s * 0.18, s * 0.11, 0, 0, Math.PI * 2);
targetCtx.ellipse(x + s * 0.52, y + s * 0.18, s * 0.18, s * 0.11, 0, 0, Math.PI * 2);
targetCtx.fill();
// 4. うるうるの大きな瞳＋白いハイライト
targetCtx.fillStyle = "#1e272e";
targetCtx.beginPath();
targetCtx.arc(x - s * 0.34, y - s * 0.02, s * 0.16, 0, Math.PI * 2);
targetCtx.arc(x + s * 0.34, y - s * 0.02, s * 0.16, 0, Math.PI * 2);
targetCtx.fill();
targetCtx.fillStyle = "#ffffff";
targetCtx.beginPath();
targetCtx.arc(x - s * 0.39, y - s * 0.07, s * 0.06, 0, Math.PI * 2);
targetCtx.arc(x + s * 0.29, y - s * 0.07, s * 0.06, 0, Math.PI * 2);
targetCtx.fill();
targetCtx.beginPath();
targetCtx.arc(x - s * 0.28, y + s * 0.04, s * 0.03, 0, Math.PI * 2);
targetCtx.arc(x + s * 0.40, y + s * 0.04, s * 0.03, 0, Math.PI * 2);
targetCtx.fill();
// 5. 小さなピンクの逆三角形のお鼻
targetCtx.fillStyle = "#ff7675";
targetCtx.beginPath();
targetCtx.moveTo(x - s * 0.09, y + s * 0.12);
targetCtx.lineTo(x + s * 0.09, y + s * 0.12);
targetCtx.lineTo(x, y + s * 0.21);
targetCtx.closePath();
targetCtx.fill();
// 6. にっこりω（オメガ）型の口
targetCtx.strokeStyle = "#2d3436";
targetCtx.lineWidth = 1.8;
targetCtx.lineCap = "round";
targetCtx.beginPath();
targetCtx.arc(x - s * 0.11, y + s * 0.23, s * 0.11, 0, Math.PI * 0.85);
targetCtx.stroke();
targetCtx.beginPath();
targetCtx.arc(x + s * 0.11, y + s * 0.23, s * 0.11, Math.PI * 0.15, Math.PI);
targetCtx.stroke();
// 7. 左右の可愛いヒゲ（各2本）
targetCtx.strokeStyle = "rgba(45, 52, 54, 0.65)";
targetCtx.lineWidth = 1.5;
targetCtx.beginPath();
targetCtx.moveTo(x - s * 0.68, y + s * 0.08);
targetCtx.lineTo(x - s * 1.12, y + s * 0.02);
targetCtx.moveTo(x - s * 0.68, y + s * 0.20);
targetCtx.lineTo(x - s * 1.10, y + s * 0.24);
targetCtx.moveTo(x + s * 0.68, y + s * 0.08);
targetCtx.lineTo(x + s * 1.12, y + s * 0.02);
targetCtx.moveTo(x + s * 0.68, y + s * 0.20);
targetCtx.lineTo(x + s * 1.10, y + s * 0.24);
targetCtx.stroke();
targetCtx.restore();
}
function drawPaw(targetCtx, x, y, s, color, alpha) {
targetCtx.save();
if (alpha !== undefined) targetCtx.globalAlpha = alpha;
targetCtx.fillStyle = color;
targetCtx.beginPath();
targetCtx.ellipse(x, y + s * 0.2, s * 0.6, s * 0.45, 0, 0, Math.PI * 2);
targetCtx.fill();
targetCtx.beginPath(); targetCtx.ellipse(x - s * 0.5, y - s * 0.25, s * 0.2, s * 0.28, -0.2, 0, Math.PI * 2); targetCtx.fill();
targetCtx.beginPath(); targetCtx.ellipse(x - s * 0.18, y - s * 0.5, s * 0.2, s * 0.32, -0.05, 0, Math.PI * 2); targetCtx.fill();
targetCtx.beginPath(); targetCtx.ellipse(x + s * 0.18, y - s * 0.5, s * 0.2, s * 0.32, 0.05, 0, Math.PI * 2); targetCtx.fill();
targetCtx.beginPath(); targetCtx.ellipse(x + s * 0.5, y - s * 0.25, s * 0.2, s * 0.28, 0.2, 0, Math.PI * 2); targetCtx.fill();
targetCtx.restore();
}
function addFx(x, y, text, color) {
effects.push({ x: x, y: y, text: text, color: color, life: 35 });
}
function drawClearScreen() {
ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
ctx.fillRect(0, 0, 400, 650);
drawCuteNoteCat(ctx, 200, 230, 56, "#ffeaa7");
document.getElementById("css-crown").style.display = "block";
ctx.fillStyle = "#ffeaa7";
ctx.font = "bold 34px sans-serif";
ctx.textAlign = "center";
ctx.fillText("YOU WIN!", 200, 330);
ctx.fillStyle = "#fff";
ctx.font = "bold 20px sans-serif";
ctx.fillText("10,000点 達成おめでとう！", 200, 380);
ctx.fillText("FINAL SCORE: " + score, 200, 420);
}
function loop() {
bgCtx.clearRect(0, 0, bgCvs.width, bgCvs.height);
for (let i = 0; i < outerCats.length; i++) {
let o = outerCats[i];
o.y -= o.speed;
o.swayOffset += 0.015;
let drawX = o.x + Math.sin(o.swayOffset) * 18;
if (o.y < -50) {
o.y = bgCvs.height + 50;
o.x = Math.random() * bgCvs.width;
}
if (o.isPaw) {
drawPaw(bgCtx, drawX, o.y, o.size, o.color, 0.16);
} else {
drawCat(bgCtx, drawX, o.y, o.size, o.color, 0.16, true);
}
}
if (isGameClear) {
drawClearScreen();
requestAnimationFrame(loop);
return;
}
ctx.clearRect(0, 0, 400, 650);
for (let i = 0; i < bgCats.length; i++) {
let b = bgCats[i];
b.y -= b.speed;
b.swayOffset += 0.02;
let drawX = b.x + Math.sin(b.swayOffset) * 12;
if (b.y < -40) {
b.y = 690;
b.x = Math.random() * 400;
}
if (b.isPaw) {
drawPaw(ctx, drawX, b.y, b.size, b.color, 0.12);
} else {
drawCat(ctx, drawX, b.y, b.size, b.color, 0.12, false);
}
}
ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
ctx.lineWidth = 1;
for (let i = 1; i < 4; i++) {
ctx.beginPath();
ctx.moveTo(i * 100, 150);
ctx.lineTo(i * 100, 650);
ctx.stroke();
}
// ボス猫エリア
ctx.fillStyle = "rgba(26, 26, 46, 0.85)";
ctx.fillRect(0, 0, 400, 150);
ctx.strokeStyle = "#444";
ctx.lineWidth = 2;
ctx.strokeRect(10, 10, 380, 130);
ctx.fillStyle = "#aaa";
ctx.font = "bold 13px sans-serif";
ctx.textAlign = "left";
ctx.fillText("対戦相手（ボス猫）", 22, 30);
bossTimer++;
if (bossTimer >= 180) {
bossHand = Math.floor(Math.random() * 3);
randomizeLaneHands();
bossTimer = 0;
addFx(200, 50, "SHUFFLE!", "#fff");
}
drawCat(ctx, 200, 82, 48, HANDS[bossHand].color, 1, false);
// ノーツの生成
noteTimer++;
if (noteTimer >= 70) {
const winHand = (bossHand + 2) % 3;
const winLanes = new Array();
for (let i = 0; i < 4; i++) {
if (laneHands[i] === winHand) {
winLanes.push(i);
}
}
let targetLane = Math.floor(Math.random() * 4);
if (Math.random() < 0.7 && winLanes.length > 0) {
targetLane = winLanes[Math.floor(Math.random() * winLanes.length)];
}
const randomColorIndex = Math.floor(Math.random() * noteCatColors.length);
notes.push({ lane: targetLane, y: 650, colorIndex: randomColorIndex });
noteTimer = 0;
}
// 判定ライン
for (let i = 0; i < 4; i++) {
const h = laneHands[i];
ctx.strokeStyle = HANDS[h].color;
ctx.lineWidth = 3;
ctx.strokeRect(i * 100 + 10, JUDGE_Y - 30, 80, 60);
drawCat(ctx, i * 100 + 50, JUDGE_Y, 28, HANDS[h].color, 1, false);
ctx.fillStyle = "#aaa";
ctx.font = "bold 16px sans-serif";
ctx.textAlign = "center";
ctx.fillText(ARROWS[i], i * 100 + 50, JUDGE_Y + 45);
}
// 流れる可愛い猫ノーツ
for (let i = notes.length - 1; i >= 0; i--) {
let n = notes[i];
n.y -= 3.0;
let x = n.lane * 100 + 50;
let catColor = noteCatColors[n.colorIndex || 0];
drawCuteNoteCat(ctx, x, n.y, 28, catColor);
if (n.y < JUDGE_Y - 45) {
notes.splice(i, 1);
const myLaneHand = laneHands[n.lane];
if ((myLaneHand === 0 && bossHand === 1) || (myLaneHand === 1 && bossHand === 2) || (myLaneHand === 2 && bossHand === 0)) {
addFx(x, JUDGE_Y - 30, "MISS", "#ff4757");
combo = 0;
updateUI();
}
}
}
// エフェクト描画
for (let i = effects.length - 1; i >= 0; i--) {
let f = effects[i];
f.y -= 0.7;
ctx.save();
ctx.globalAlpha = f.life / 35;
ctx.fillStyle = f.color;
ctx.font = "bold 18px sans-serif";
ctx.textAlign = "center";
ctx.fillText(f.text, f.x, f.y);
ctx.restore();
f.life--;
if (f.life <= 0) {
effects.splice(i, 1);
}
}
requestAnimationFrame(loop);
}
window.addEventListener("keydown", function(e) {
let lane = -1;
if (e.key === "ArrowLeft") lane = 0;
if (e.key === "ArrowDown") lane = 1;
if (e.key === "ArrowUp") lane = 2;
if (e.key === "ArrowRight") lane = 3;
if (lane === -1) return;
e.preventDefault();
if (isGameClear) return;
for (let i = 0; i < notes.length; i++) {
let n = notes[i];
if (n.lane === lane && Math.abs(n.y - JUDGE_Y) < 55) {
let x = lane * 100 + 50;
const myHand = laneHands[lane];
if ((myHand === 0 && bossHand === 1) || (myHand === 1 && bossHand === 2) || (myHand === 2 && bossHand === 0)) {
score += 200 + combo * 20;
combo++;
addFx(x, JUDGE_Y - 30, "WIN!", "#55efc4");
bossHand = Math.floor(Math.random() * 3);
randomizeLaneHands();
bossTimer = 0;
} else if (myHand === bossHand) {
score += 30;
combo++;
addFx(x, JUDGE_Y - 30, "AIKO", "#dfe6e9");
} else {
combo = 0;
addFx(x, JUDGE_Y - 30, "LOSE", "#ff4757");
}
notes.splice(i, 1);
updateUI();
if (score >= WIN_SCORE) {
isGameClear = true;
document.getElementById("retry-btn").style.display = "block";
}
break;
}
}
});
function updateUI() {
document.getElementById("score").innerText = score;
document.getElementById("combo").innerText = combo;
}
loop();


