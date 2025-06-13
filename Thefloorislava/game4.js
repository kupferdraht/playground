//let canvas= document.getElementById("canvas")
//var window_height=window.innerHeight;
//var window_width=window.innerWidth;
// gegenstand hinzufügen
//let context= canvas.getContext("2d");

/*canvas.width= 1000;
canvas.height=500;
canvas.style.background="violet";
// stylen vor Rect dingens

context.fillStyle="white";

// x y width height
context.fillRect(0,100,2000,10);
context.fillRect(0,200,2000,10);
context.fillRect(0,300,2000,10);
context.fillRect(0,400,2000,10);

context.fillRect(100,0,10,2000);
context.fillRect(200,0,10,2000);
context.fillRect(300,0,10,2000);
context.fillRect(400,0,10,2000);
context.fillRect(500,0,10,2000);
context.fillRect(600,0,10,2000);
context.fillRect(700,0,10,2000);
context.fillRect(800,0,10,2000);
context.fillRect(900,0,10,2000);

DIES IST BLOß EINE SICHERHEITS KOPIE GEWESEN STAND: ETWA MODUS 5 ODER ETWAS SPÄTER ALSO UNVOLLSTÄNDIG!
*/
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

const cols = 10;
const rows = 5;
const cellWidth = canvas.width / cols;
const cellHeight = canvas.height / rows;

let player = { x: 0, y: 0 };
let gameState = "start"; // start, playing, win, lose
let timer = 30;
let interval;
let dangerFields = []; // {x, y, state: "yellow"|"red", time: ms}
let dangerInterval;
let selectedMode = 1;

// Modus 3/4/5: bewegende Felder
let movingFields = [];
let movingFieldSpeed = 1000;
let movingFieldInterval;
let speedUpInterval;

// Modus 4: Sterne
let stars = [];
let starTimers = [];
let collectedStars = 0;

// Modus 5: Gegenstände und Felder
let itemFields = [];
let itemTimers = [];
let playerFieldHistory = [];
let collectedItems = 0;

// Modus- und Timer-Bar ganz rechts außen
const rightBar = document.createElement("div");
rightBar.id = "rightBar";
rightBar.style.position = "fixed"; // Fixiert!
rightBar.style.right = "40px";    // Abstand zum rechten Rand
rightBar.style.top = "230px";     // Abstand zum oberen Rand (nur für Modus-Buttons!)
rightBar.style.display = "flex";
rightBar.style.flexDirection = "column";
rightBar.style.alignItems = "flex-start";
rightBar.style.gap = "30px";
rightBar.style.minWidth = "220px";
rightBar.style.zIndex = 2000;
document.body.appendChild(rightBar);

// Timer immer ganz oben rechts, unabhängig von den Modus-Buttons
const timerBar = document.createElement("div");
timerBar.id = "timerBar";
timerBar.style.position = "fixed";
timerBar.style.top = "10px";
timerBar.style.right = "40px";
timerBar.style.fontSize = "2.5em";
timerBar.style.fontWeight = "bold";
timerBar.style.color = "#e53935";
timerBar.style.background = "#fff";
timerBar.style.border = "2px solid #e53935";
timerBar.style.borderRadius = "12px";
timerBar.style.padding = "10px 30px";
timerBar.style.textAlign = "center";
timerBar.style.width = "220px";
timerBar.style.display = "none"; // Standardmäßig ausgeblendet
timerBar.style.zIndex = 2100; // Über rightBar
document.body.appendChild(timerBar);

// Modus-Button-Leiste darunter
const modeBar = document.createElement("div");
modeBar.id = "modeBar";
modeBar.style.display = "flex";
modeBar.style.flexDirection = "column";
modeBar.style.gap = "12px";
modeBar.style.width = "100%";
rightBar.appendChild(modeBar);

// Info-Overlay für Modus-Infos
const infoOverlay = document.createElement("div");
infoOverlay.id = "infoOverlay";
infoOverlay.style.position = "fixed";
infoOverlay.style.left = "0";
infoOverlay.style.top = "0";
infoOverlay.style.width = "100vw";
infoOverlay.style.height = "100vh";
infoOverlay.style.display = "none";
infoOverlay.style.alignItems = "center";
infoOverlay.style.justifyContent = "center";
infoOverlay.style.zIndex = 3000;
infoOverlay.style.background = "rgba(0,0,0,0.25)";
document.body.appendChild(infoOverlay);

const infoBox = document.createElement("div");
infoBox.style.background = "#fff";
infoBox.style.borderRadius = "16px";
infoBox.style.boxShadow = "0 4px 24px #0004";
infoBox.style.padding = "32px 32px 24px 32px";
infoBox.style.maxWidth = "400px";
infoBox.style.fontSize = "1.2em";
infoBox.style.position = "relative";
infoOverlay.appendChild(infoBox);

const infoClose = document.createElement("button");
infoClose.textContent = "✖";
infoClose.style.position = "absolute";
infoClose.style.top = "10px";
infoClose.style.right = "16px";
infoClose.style.background = "transparent";
infoClose.style.border = "none";
infoClose.style.fontSize = "1.3em";
infoClose.style.cursor = "pointer";
infoClose.onclick = () => { infoOverlay.style.display = "none"; };
infoBox.appendChild(infoClose);

const infoContent = document.createElement("div");
infoContent.id = "infoContent";
infoBox.appendChild(infoContent);

// NUR 5 Modus-Buttons + Info-Buttons!
const modeInfos = [
    // ==== HIER DEINE MODUS-INFOS EINFÜGEN ====
    // Modus 1
    `Modus 1:<br>
    <b>Ziel:</b> Überlebe 30 Sekunden.<br>
    <b>Mechanik:</b> Jede Sekunde erscheinen neue gelbe Felder, die nach kurzer Zeit rot werden und tödlich sind.<br>
    <b>Bewegung:</b> Klicke auf ein angrenzendes Feld, um dich zu bewegen.`,
    // Modus 2
    `Modus 2:<br>
    <b>Ziel:</b> Überlebe 30 Sekunden.<br>
    <b>Mechanik:</b> Ganze Reihen oder Spalten werden gelb und dann rot.<br>
    <b>Bewegung:</b> Klicke auf ein angrenzendes Feld, um dich zu bewegen.`,
    // Modus 3
    `Modus 3:<br>
    <b>Ziel:</b> Überlebe 30 Sekunden.<br>
    <b>Mechanik:</b> Zwei rote Gegner bewegen sich diagonal über das Feld. Nach 15 Sekunden werden sie schneller.<br>
    <b>Bewegung:</b> Klicke auf ein angrenzendes Feld, um dich zu bewegen.`,
    // Modus 4
    `Modus 4:<br>
    <b>Ziel:</b> Sammle 3 gelbe Sterne ein.<br>
    <b>Mechanik:</b> Zwei rote Gegner bewegen sich. Nach 10, 20 und 30 Sekunden erscheint je ein Stern.<br>
    <b>Bewegung:</b> Klicke auf ein angrenzendes Feld, um dich zu bewegen.`,
    // Modus 5
    `Modus 5:<br>
    <b>Ziel:</b> Sammle 3 pinke Gegenstände ein.<br>
    <b>Mechanik:</b> Zwei lila Gegner bewegen sich. Jedes Feld, das du betrittst, wird erst grün, dann gelb, dann rot. Betrittst du ein rotes Feld erneut, verlierst du.<br>
    <b>Bewegung:</b> Klicke auf ein angrenzendes Feld, um dich zu bewegen.`
    // ==== ENDE MODUS-INFOS ====
];

for (let i = 1; i <= 5; i++) {
    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.alignItems = "center";
    btnRow.style.gap = "8px";
    btnRow.style.width = "100%";

    const btn = document.createElement("button");
    btn.textContent = "Modus " + i;
    btn.style.flex = "1";
    btn.style.height = "44px";
    btn.style.fontSize = "1.1em";
    btn.style.background = "#1976d2";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.transition = "background 0.2s";
    btn.onmouseover = () => btn.style.background = "#1565c0";
    btn.onmouseout = () => btn.style.background = "#1976d2";
    btn.id = "modeBtn" + i;
    btn.onclick = () => {
        selectedMode = i;
        for (let j = 1; j <= 5; j++) {
            document.getElementById("modeBtn" + j).style.outline = "";
        }
        btn.style.outline = "3px solid #ffeb3b";
    };

    // Info-Button
    const infoBtn = document.createElement("button");
    infoBtn.textContent = "ℹ️";
    infoBtn.title = "Info zu Modus " + i;
    infoBtn.style.background = "transparent";
    infoBtn.style.border = "none";
    infoBtn.style.fontSize = "1.3em";
    infoBtn.style.cursor = "pointer";
    infoBtn.onclick = () => {
        infoContent.innerHTML = modeInfos[i - 1];
        infoOverlay.style.display = "flex";
    };

    btnRow.appendChild(btn);
    btnRow.appendChild(infoBtn);
    modeBar.appendChild(btnRow);
}

// Nach dem Erstellen der Buttons: Standardmäßig Modus 1 hervorheben
document.getElementById("modeBtn1").style.outline = "3px solid #ffeb3b";
selectedMode = 1;

// Overlay für Start/Gewonnen/Verloren zentral im Canvas
const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.style.position = "absolute";
overlay.style.left = canvas.offsetLeft + "px";
overlay.style.top = canvas.offsetTop + "px";
overlay.style.width = canvas.width + "px";
overlay.style.height = canvas.height + "px";
overlay.style.display = "flex";
overlay.style.flexDirection = "column";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.background = "rgba(0,0,0,0.45)";
overlay.style.zIndex = 1000; // Hoch genug, damit es immer über dem Canvas liegt
overlay.style.backdropFilter = "blur(2px)";
document.body.appendChild(overlay);

function showOverlay(html) {
    overlay.innerHTML = html;
    overlay.style.display = "flex";
    // Timer IMMER ausblenden, wenn Overlay angezeigt wird!
    timerBar.style.display = "none";
}
function hideOverlay() {
    overlay.style.display = "none";
    // Timer-Anzeige wird beim Starten des Spiels über showTimer() geregelt
}

function showStartScreen() {
    showOverlay(`
        <button id="startBtn" style="font-size:2em;padding:20px 40px;border-radius:12px;background:#43a047;color:#fff;border:none;box-shadow:0 2px 8px #0002;cursor:pointer;">Starten</button>
    `);
    document.getElementById("startBtn").onclick = () => {
        hideOverlay();
        startGame();
    };
    timerBar.style.display = "none";
}

function showWinScreen() {
    overlay.style.background = "rgba(56, 183, 0, 0.18)"; // leicht grün transparent
    showOverlay(`
        <div style="display:flex;flex-direction:column;align-items:center;gap:24px;">
            <h2 style="color:#2e7d32;font-size:2.7em;margin:0 0 10px 0;text-shadow:0 2px 12px #b9f6ca;">🎉 Du hast gewonnen! 🎉</h2>
            <button id="restartBtn" style="font-size:1.3em;padding:14px 38px;border-radius:14px;background:linear-gradient(90deg,#43a047,#66bb6a);color:#fff;border:none;box-shadow:0 2px 12px #0002;cursor:pointer;transition:background 0.2s;">Erneut spielen</button>
            <div style="display:flex;gap:12px;">
                <button id="btn1" style="font-size:1em;padding:8px 18px;border-radius:8px;background:#fffde7;color:#43a047;border:2px solid #43a047;cursor:pointer;">Button 1</button>
                <button id="btn2" style="font-size:1em;padding:8px 18px;border-radius:8px;background:#fffde7;color:#43a047;border:2px solid #43a047;cursor:pointer;">Button 2</button>
                <button id="btn3" style="font-size:1em;padding:8px 18px;border-radius:8px;background:#fffde7;color:#43a047;border:2px solid #43a047;cursor:pointer;">Button 3</button>
            </div>
        </div>
    `);
    document.getElementById("restartBtn").onclick = () => {
        overlay.style.background = "rgba(0,0,0,0.45)";
        showStartScreen();
        gameState = "start";
    };
    timerBar.style.display = "none";
}

function showLoseScreen() {
    overlay.style.background = "rgba(220, 38, 38, 0.22)"; // leicht rot transparent
    showOverlay(`
        <div style="display:flex;flex-direction:column;align-items:center;gap:24px;">
            <h2 style="color:#b71c1c;font-size:2.7em;margin:0 0 10px 0;text-shadow:0 2px 12px #ffcdd2;">💀 Du hast verloren! 💀</h2>
            <button id="restartBtn" style="font-size:1.3em;padding:14px 38px;border-radius:14px;background:linear-gradient(90deg,#e53935,#ff7043);color:#fff;border:none;box-shadow:0 2px 12px #0002;cursor:pointer;transition:background 0.2s;">Wiederholen</button>
            <div style="display:flex;gap:12px;">
                <button id="btn1" style="font-size:1em;padding:8px 18px;border-radius:8px;background:#fffde7;color:#e53935;border:2px solid #e53935;cursor:pointer;">Button 1</button>
                <button id="btn2" style="font-size:1em;padding:8px 18px;border-radius:8px;background:#fffde7;color:#e53935;border:2px solid #e53935;cursor:pointer;">Button 2</button>
                <button id="btn3" style="font-size:1em;padding:8px 18px;border-radius:8px;background:#fffde7;color:#e53935;border:2px solid #e53935;cursor:pointer;">Button 3</button>
            </div>
        </div>
    `);
    document.getElementById("restartBtn").onclick = () => {
        overlay.style.background = "rgba(0,0,0,0.45)";
        showStartScreen();
        gameState = "start";
    };
    timerBar.style.display = "none";
}

// Timer nur in Modus 1 und 2 anzeigen
function showTimer() {
    if (selectedMode === 1 || selectedMode === 2) {
        timerBar.style.display = "block";
        timerBar.textContent = timer;
    } else {
        timerBar.style.display = "none";
    }
}

function resetGame() {
    if (selectedMode === 3 || selectedMode === 4 || selectedMode === 5) {
        player = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
    } else {
        player = { x: 0, y: 0 };
    }
    timer = 30;
    dangerFields = [];
    movingFields = [];
    movingFieldSpeed = 1000;
    clearInterval(movingFieldInterval);
    clearTimeout(speedUpInterval);
    // Für Modus 4:
    stars = [];
    collectedStars = 0;
    for (let t of starTimers) clearTimeout(t);
    starTimers = [];
    // Für Modus 5:
    itemFields = [];
    collectedItems = 0;
    for (let t of itemTimers) clearTimeout(t);
    itemTimers = [];
    playerFieldHistory = [];
}

function drawGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // 1. Felder (inkl. farbige Felder)
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let pf = playerFieldHistory.find(f => f.x === i && f.y === j);
            if (selectedMode === 5 && pf) {
                if (pf.state === "green") context.fillStyle = "#43a047";
                else if (pf.state === "yellow") context.fillStyle = "#ffd600";
                else if (pf.state === "red") context.fillStyle = "#e53935";
                else context.fillStyle = "#222";
                context.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            } else {
                // Gefahrfelder (nur Modus 1/2)
                let field = dangerFields.find(f => f.x === i && f.y === j);
                if (field) {
                    context.fillStyle = field.state === "yellow" ? "yellow" : "red";
                    context.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
                } else {
                    context.fillStyle = "#222";
                    context.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
                }
            }
            // Umrandung
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.strokeRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }
    // 2. Gegenstände (über Feldern)
    if (selectedMode === 5) {
        for (let item of itemFields) {
            drawPinkCircle(item.x, item.y);
        }
    }
    // 3. Gegner (über Feldern und Gegenständen)
    if (selectedMode === 5) {
        for (let f of movingFields) {
            context.fillStyle = "purple";
            context.fillRect(f.x * cellWidth, f.y * cellHeight, cellWidth, cellHeight);
        }
    }
    // 4. Sterne für Modus 4
    if (selectedMode === 4) {
        for (let star of stars) {
            drawYellowCircle(star.x, star.y);
        }
        for (let f of movingFields) {
            context.fillStyle = "red";
            context.fillRect(f.x * cellWidth, f.y * cellHeight, cellWidth, cellHeight);
        }
    }
    // Gesamtes Spielfeld umranden
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1;
}

// Gelber Kreis für Sterne/Gegenstände
function drawYellowCircle(x, y) {
    const cx = x * cellWidth + cellWidth / 2;
    const cy = y * cellHeight + cellHeight / 2;
    const radius = Math.min(cellWidth, cellHeight) * 0.3;
    context.save();
    context.beginPath();
    context.arc(cx, cy, radius, 0, 2 * Math.PI);
    context.fillStyle = "#ffd600";
    context.shadowColor = "#fffde7";
    context.shadowBlur = 10;
    context.fill();
    context.restore();
}

// Ersetze die Funktion drawYellowCircle durch drawPinkCircle
function drawPinkCircle(x, y) {
    const cx = x * cellWidth + cellWidth / 2;
    const cy = y * cellHeight + cellHeight / 2;
    const radius = Math.min(cellWidth, cellHeight) * 0.3;
    context.save();
    context.beginPath();
    context.arc(cx, cy, radius, 0, 2 * Math.PI);
    context.fillStyle = "#e040fb"; // Pink
    context.shadowColor = "#f8bbd0";
    context.shadowBlur = 10;
    context.fill();
    context.restore();
}

function drawPlayer() {
    // Spieler kleiner und mittig im Feld zeichnen
    const playerSize = Math.min(cellWidth, cellHeight) * 0.5;
    const offsetX = player.x * cellWidth + (cellWidth - playerSize) / 2;
    const offsetY = player.y * cellHeight + (cellHeight - playerSize) / 2;
    context.fillStyle = "blue";
    context.fillRect(offsetX, offsetY, playerSize, playerSize);
}

function draw() {
    drawGrid();
    drawPlayer();
}

function startGame() {
    resetGame();
    gameState = "playing";
    draw();
    showTimer();
    clearInterval(interval);
    clearInterval(dangerInterval);
    clearInterval(movingFieldInterval);
    clearTimeout(speedUpInterval);

    if (selectedMode === 1) {
        timerBar.style.display = "block";
        timer = 30;
        interval = setInterval(() => {
            timer--;
            showTimer();
            if (timer <= 0) {
                clearInterval(interval);
                clearInterval(dangerInterval);
                gameState = "win";
                showWinScreen();
            }
        }, 1000);
        dangerInterval = setInterval(spawnDangerField, 700);
    } else if (selectedMode === 2) {
        timerBar.style.display = "block";
        timer = 30;
        interval = setInterval(() => {
            timer--;
            showTimer();
            if (timer <= 0) {
                clearInterval(interval);
                clearInterval(dangerInterval);
                gameState = "win";
                showWinScreen();
            }
        }, 1000);
        dangerInterval = setInterval(spawnDangerRowOrCol, 3000);
    } else {
        timerBar.style.display = "none";
        // ...restlicher Code für Modus 3, 4, 5...
        // (unverändert)
    }
}

function spawnDangerField() {
    let freeFields = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (!dangerFields.find(f => f.x === i && f.y === j)) {
                freeFields.push({ x: i, y: j });
            }
        }
    }
    if (freeFields.length === 0) return;
    let idx = Math.floor(Math.random() * freeFields.length);
    let field = { ...freeFields[idx], state: "yellow", time: Date.now() };
    dangerFields.push(field);

    setTimeout(() => {
        let f = dangerFields.find(f2 => f2.x === field.x && f2.y === field.y);
        if (f && f.state === "yellow") f.state = "red";
        draw();
    }, 3000);
}

function spawnDangerRowOrCol() {
    const type = Math.random() < 0.5 ? "row" : "col";
    if (type === "row") {
        const y = Math.floor(Math.random() * rows);
        for (let x = 0; x < cols; x++) {
            if (!dangerFields.find(f => f.x === x && f.y === y)) {
                let field = { x, y, state: "yellow", time: Date.now() };
                dangerFields.push(field);
                setTimeout(() => {
                    let f = dangerFields.find(f2 => f2.x === x && f2.y === y);
                    if (f && f.state === "yellow") f.state = "red";
                    draw();
                }, 3000);
            }
        }
    } else {
        const x = Math.floor(Math.random() * cols);
        for (let y = 0; y < rows; y++) {
            if (!dangerFields.find(f => f.x === x && f.y === y)) {
                let field = { x, y, state: "yellow", time: Date.now() };
                dangerFields.push(field);
                setTimeout(() => {
                    let f = dangerFields.find(f2 => f2.x === x && f2.y === y);
                    if (f && f.state === "yellow") f.state = "red";
                    draw();
                }, 3000);
            }
        }
    }
    draw();
}

function moveMovingFields() {
    for (let i = 0; i < movingFields.length; i++) {
        let f = movingFields[i];
        let nx = f.x + f.dx;
        let ny = f.y + f.dy;

        // Rand-Kollision
        if (nx < 0 || nx >= cols) f.dx *= -1;
        if (ny < 0 || ny >= rows) f.dy *= -1;

        nx = f.x + f.dx;
        ny = f.y + f.dy;

        // Kollision mit anderem Feld
        for (let j = 0; j < movingFields.length; j++) {
            if (i !== j && nx === movingFields[j].x && ny === movingFields[j].y) {
                f.dx *= -1;
                f.dy *= -1;
            }
        }

        f.x += f.dx;
        f.y += f.dy;
    }
    draw();
    if (selectedMode === 4 || selectedMode === 5) {
        checkMovingFieldLose();
    }
}

function checkLose() {
    let field = dangerFields.find(f => f.x === player.x && f.y === player.y && f.state === "red");
    if (field) {
        clearInterval(interval);
        clearInterval(dangerInterval);
        gameState = "lose";
        showLoseScreen();
    }
}

function checkMovingFieldLose() {
    for (let f of movingFields) {
        if (f.x === player.x && f.y === player.y) {
            clearInterval(movingFieldInterval);
            clearTimeout(speedUpInterval);
            for (let t of starTimers) clearTimeout(t);
            for (let t of itemTimers) clearTimeout(t);
            gameState = "lose";
            showLoseScreen();
        }
    }
}

// Modus 4: Stern an zufälliger freier Position erzeugen
function spawnStar() {
    let freeFields = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (
                !stars.some(s => s.x === i && s.y === j) &&
                !movingFields.some(f => f.x === i && f.y === j) &&
                !(player.x === i && player.y === j)
            ) {
                freeFields.push({ x: i, y: j });
            }
        }
    }
    if (freeFields.length === 0) return;
    let idx = Math.floor(Math.random() * freeFields.length);
    stars.push(freeFields[idx]);
    draw();
}

// Modus 5: Gegenstand an zufälliger freier Position erzeugen
function spawnItem() {
    let freeFields = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (
                !itemFields.some(f => f.x === i && f.y === j) &&
                !movingFields.some(f => f.x === i && f.y === j) &&
                !(player.x === i && player.y === j)
            ) {
                freeFields.push({ x: i, y: j });
            }
        }
    }
    if (freeFields.length === 0) return;
    let idx = Math.floor(Math.random() * freeFields.length);
    itemFields.push(freeFields[idx]);
    draw();
}

// Modus 4: Stern einsammeln prüfen
function checkStarCollect() {
    for (let i = 0; i < stars.length; i++) {
        if (player.x === stars[i].x && player.y === stars[i].y) {
            stars.splice(i, 1);
            collectedStars++;
            draw();
            break;
        }
    }
    if (collectedStars >= 3) {
        clearInterval(movingFieldInterval);
        clearTimeout(speedUpInterval);
        for (let t of starTimers) clearTimeout(t);
        gameState = "win";
        showWinScreen();
    }
}

// Modus 5: Gegenstand einsammeln prüfen
function checkItemCollect() {
    for (let i = 0; i < itemFields.length; i++) {
        if (player.x === itemFields[i].x && player.y === itemFields[i].y) {
            itemFields.splice(i, 1);
            collectedItems++;
            draw();
            break;
        }
    }
    if (collectedItems >= 3) {
        clearInterval(movingFieldInterval);
        clearTimeout(speedUpInterval);
        for (let t of itemTimers) clearTimeout(t);
        gameState = "win";
        showWinScreen();
    }
}

// Modus 5: Spieler-Feld-Überwachung
function startPlayerFieldTimer() {
    playerFieldHistory = [];
    updatePlayerField();
}

// Modus 5: Spieler-Feld-Überwachung (Statuswechsel bei jedem Betreten)
function updatePlayerField() {
    if (gameState !== "playing" || selectedMode !== 5) return;
    let pf = playerFieldHistory.find(f => f.x === player.x && f.y === player.y);
    if (!pf) {
        playerFieldHistory.push({ x: player.x, y: player.y, state: "green" });
    } else if (pf.state === "green") {
        pf.state = "yellow";
    } else if (pf.state === "yellow") {
        pf.state = "red";
    } else if (pf.state === "red") {
        // Spieler verliert!
        pf.state = "red";
        draw();
        clearInterval(movingFieldInterval);
        clearTimeout(speedUpInterval);
        for (let t of itemTimers) clearTimeout(t);
        gameState = "lose";
        showLoseScreen();
        return;
    }
    draw();
}

// Spieler bewegt sich per Klick (nur ein Listener!)
canvas.addEventListener("click", function(e) {
    if (gameState !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const clickedX = Math.floor(mouseX / cellWidth);
    const clickedY = Math.floor(mouseY / cellHeight);

    // Prüfen, ob das Feld maximal 1 Feld entfernt ist (auch diagonal)
    const dx = Math.abs(clickedX - player.x);
    const dy = Math.abs(clickedY - player.y);
    if ((dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0)) {
        player.x = clickedX;
        player.y = clickedY;
        if (selectedMode === 5) {
            updatePlayerField();
            checkMovingFieldLose();
            checkItemCollect();
        } else if (selectedMode === 4) {
            checkMovingFieldLose();
            checkStarCollect();
        } else if (selectedMode === 3) {
            checkMovingFieldLose();
        } else {
            checkLose();
        }
        draw();
    }
});

function gameLoop() {
    if (gameState === "playing") {
        draw();
        if (selectedMode === 5) {
            checkMovingFieldLose();
        } else if (selectedMode === 4) {
            checkMovingFieldLose();
        } else if (selectedMode === 3) {
            checkMovingFieldLose();
        } else {
            checkLose();
        }
    }
    requestAnimationFrame(gameLoop);
}

showStartScreen();
gameLoop();
