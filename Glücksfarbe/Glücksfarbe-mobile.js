const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext("2d");
canvas.width = 300; // muss exakt dem CSS-Wert entsprechen
canvas.height = 600;
let counter = 0;
let rekord = localStorage.getItem("rekord") || 0;
rekord = parseInt(rekord);
document.getElementById("rekordZahl").innerText = rekord;
let rekord2 = parseInt(localStorage.getItem("rekord2")) || 0;
let rekord3 = parseInt(localStorage.getItem("rekord3")) || 0;


let boxes = [];
let selectedBox = null;
let boxSize = 80;
const boxDefinitions = [
  { color: "yellow", border: "black", x: 50, y: 100 },
  { color: "pink",   border: "black", x: 200, y: 200 },
  { color: "orange", border: "black", x: 50, y: 300 },
  { color: "blue",   border: "black", x: 200, y: 400 },
  { color: "green",  border: "black", x: 50, y: 500 }
];
let showArrow = true;
let arrowY = 0;
let arrowDir = 1; // 1 = runter, -1 = hoch
let isInGreen = false; // true, wenn Pfeil über grün ist
let arrowInterval; // für Bewegungstimer
let arrowSpeed = 30; 
let spielLaeuft = false;










// Overlay erstellen und zum body hinzufügen
const overlay = document.createElement("div");
overlay.id = "overlay";
Object.assign(overlay.style, {
  position: "absolute",
  color: "white",
  fontSize: "24px",
  display: "none",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  flexDirection: "column",
  backdropFilter: "blur(2px)",
  zIndex: "999",});
document.body.appendChild(overlay);
  overlay.style.background = "linear-gradient(90deg, rgb(255, 217, 0) 0%, rgb(76, 175, 79) 25%, rgb(33, 149, 243) 50%, rgb(233, 30, 98) 75%, rgb(255, 153, 0) 100%)";


let currentMode = "mode-1"; // Startmodus

function checkMode() {
  // Alle Modus-Elemente durchgehen
  document.querySelectorAll('.modemobile').forEach(p => {
    if (p.id === currentMode) {
      p.style.border = "3px solid red";
    } else {
      p.style.border = "2px dashed #001aff";
      p.style.backgroundColor = "linear-gradient(90deg, rgba(255, 215, 0, 0.5) 0%, rgba(76, 175, 80, 0.5) 25%, rgba(33, 150, 243, 0.5) 50%, rgba(233, 30, 99, 0.5) 75%, rgba(255, 153, 0, 0.5) 100%);";
    }
  });
  let anzeige;
if (currentMode === "mode-1") anzeige = rekord;
if (currentMode === "mode-2") anzeige = rekord2;
if (currentMode === "mode-3") anzeige = rekord3;
document.getElementById("rekordZahl").innerText = anzeige;
}

// Click-Listener für alle <p> im Modus-Wrapper
document.querySelectorAll('.modemobile').forEach(p => {
  // Klick-Verhalten
  p.addEventListener('click', () => {
    if (spielLaeuft) {
      zeigeRundeLaeuftPopup(); // Popup anzeigen, wenn Spiel läuft
      return;
    }
    currentMode = p.id;
    checkMode();
  });

  // Cursor ändern beim Hover
  p.addEventListener('mouseover', () => {
    if (spielLaeuft) {
      p.style.cursor = "not-allowed";
    } else {
      p.style.cursor = "pointer";
    }
  });

  p.addEventListener('mouseout', () => {
    p.style.cursor = "default";
  });
});


// Direkt beim Laden einmal ausführen
checkMode();

function drawArrowZone() {
  if (!showArrow) return; // ← neu: wenn deaktiviert, abbrechen

  const zoneX = 20;
  const zoneY = 100;
  const zoneWidth = 20;
  const zoneHeight = 300;

  // Oberer roter Bereich
  ctx.fillStyle = "red";
  ctx.fillRect(zoneX, zoneY, zoneWidth, 100);

  // Grüner Mittelbereich
  ctx.fillStyle = "green";
  ctx.fillRect(zoneX, zoneY + 100, zoneWidth, 100);

  // Unterer roter Bereich
  ctx.fillStyle = "red";
  ctx.fillRect(zoneX, zoneY + 200, zoneWidth, 100);

  // Pfeil
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(zoneX + zoneWidth + 10, zoneY + arrowY);
  ctx.lineTo(zoneX + zoneWidth + 20, zoneY + arrowY - 10);
  ctx.lineTo(zoneX + zoneWidth + 20, zoneY + arrowY + 10);
  ctx.closePath();
  ctx.fill();

  // Prüfen, ob Pfeil in der grünen Zone ist
  isInGreen = (arrowY >= 100 && arrowY <= 200);
}


function startArrowMovement() {
  arrowY = 0;
  arrowDir = 1;

  if (arrowInterval) clearInterval(arrowInterval); // alte löschen, sicherheitshalber

  arrowInterval = setInterval(() => {
    arrowY += arrowDir * 3;
    if (arrowY > 300) arrowDir = -1;
    if (arrowY < 0) arrowDir = 1;
    drawBoxes();
    drawArrowZone();
  }, arrowSpeed);
}


function stopArrowMovement() {
   clearInterval(arrowInterval);
  arrowInterval = null;
}





// Funktion zum Anzeigen des Overlays
function showOverlay(html) {
  const rect = canvas.getBoundingClientRect();

  Object.assign(overlay.style, {
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    display: "flex"
  });

  overlay.innerHTML = html;
}




function initBoxes() {
  boxes = boxDefinitions.map(def => ({
    ...def,
    width: boxSize,
    height: boxSize
  }));
}

// Zeichnet alle Boxen
function drawBoxes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const box of boxes) {
    // Box füllen
    ctx.fillStyle = box.color;
    ctx.fillRect(box.x, box.y, box.width, box.height);

    // Border zeichnen
    ctx.strokeStyle = box.border || "black";  // Default: schwarz
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }
}

// Klick-Logik
canvas.addEventListener("click", (e) => {
  if (selectedBox) return;
 if ((currentMode === "mode-2" || currentMode === "mode-3") && !isInGreen) {
    // Spieler hat bei ROT geklickt – Spiel vorbei
    modus1neustart(); // oder eigene GameOver-Funktion
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (const box of boxes) {
    if (
      mouseX >= box.x &&
      mouseX <= box.x + box.width &&
      mouseY >= box.y &&
      mouseY <= box.y + box.height
    ) {
      selectedBox = { ...box };
      animateToCenter(selectedBox);
      break;
    }
  }
});

// Animation zur Mitte
function animateToCenter(box) {
  showArrow = false; // ← NEU: Balken/Pfeil verstecken

  const targetX = canvas.width / 2 - box.width / 2;
  const targetY = canvas.height / 2 - box.height / 2;

  function animate() {
    const dx = (targetX - box.x) * 0.1;
    const dy = (targetY - box.y) * 0.1;

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      box.x = targetX;
      box.y = targetY;
      boxes = [box];
      drawBoxes();
      setTimeout(fillBackgroundRandomColor, 500);
      return;
    }

    box.x += dx;
    box.y += dy;
    boxes = [box];
    drawBoxes();
    requestAnimationFrame(animate);
  }

  animate();
}


  function animate() {
    const dx = (targetX - box.x) * 0.1;
    const dy = (targetY - box.y) * 0.1;

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      box.x = targetX;
      box.y = targetY;
      boxes = [box];
      drawBoxes();
      setTimeout(fillBackgroundRandomColor, 500);
      return;
    }

    box.x += dx;
    box.y += dy;
    boxes = [box];
    drawBoxes();
    requestAnimationFrame(animate);
  }


// Zufällige Hintergrundfarbe aus den 5
function fillBackgroundRandomColor() {
  const colors = ["yellow", "pink", "orange", "blue", "green"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Hintergrundfarbe zeichnen
  ctx.fillStyle = randomColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

   if (currentMode === "mode-2") {
    stopArrowMovement();
  }
   if (currentMode === "mode-3") {
    stopArrowMovement();
  }
  // Die ausgewählte Box erneut zeichnen – im Vordergrund
  if (selectedBox) {
    ctx.fillStyle = selectedBox.color;
    ctx.fillRect(selectedBox.x, selectedBox.y, selectedBox.width, selectedBox.height);

    // Border zeichnen
    ctx.strokeStyle = selectedBox.border || "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(selectedBox.x, selectedBox.y, selectedBox.width, selectedBox.height);
  }

  // Vergleich: Gewählte Farbe vs. Zufallsfarbe
   if (selectedBox && randomColor !== selectedBox.color) {
  // 🎉 richtige Wahl → Spiel geht weiter
  counter++;
  document.getElementById("counter").innerText = `überlebte Runden: ${counter}`;

  if (counter > rekord && currentMode === "mode-1") {
  rekord = counter;
  localStorage.setItem("rekord", rekord);
  document.getElementById("rekordZahl").innerText = rekord;
}

if (counter > rekord2 && currentMode === "mode-2") {
  rekord2 = counter;
  localStorage.setItem("rekord2", rekord2);
  document.getElementById("rekordZahl").innerText = rekord2;
}

if (counter > rekord3 && currentMode === "mode-3") {
  rekord3 = counter;
  localStorage.setItem("rekord3", rekord3);
  document.getElementById("rekordZahl").innerText = rekord3;
}


 setTimeout(() => {
  selectedBox = null;
  initBoxes();
  drawBoxes();
  if (currentMode === "mode-2" || currentMode === "mode-3") {
    showArrow = true;
    if (currentMode === "mode-3" && counter % 2 === 0 && arrowSpeed > 5) {
  arrowSpeed -= 5; // alle zwei Runden schneller
  console.log("Aktuelle Geschwindigkeit:", arrowSpeed);

  startArrowMovement(); // neu starten mit neuer Geschwindigkeit
}
    startArrowMovement();
  }
}, 1000);
}
else {
    // 💥 falsche Farbe → Spiel vorbei
    setTimeout(() => {
      modus1neustart();
     if (currentMode === "mode-2" || currentMode === "mode-3") {
  stopArrowMovement();
}
    }, 1000);
  }

}
function startscreen() {
  const content = `
    <div>
      <h1 style="margin-bottom: 1em;">🎨 Glücksfarbe 🎨</h1>
      <p>Wähle eine Farbe und hoffe auf dein Glück!</p>
      <button id="startBtn" style="
        margin-top: 1em;
        padding: 0.5em 1.5em;
        font-size: 1.5rem;
        background: #ff69b4;
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
      ">Start</button>
    </div>
  `;

  showOverlay(content);
  spielLaeuft = false; 

  // Warten, bis der Button existiert, dann Click-Handler
  setTimeout(() => {
    const btn = document.getElementById("startBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        counter= 0;
        stopArrowMovement(); // ← immer zuerst
        spielLaeuft = true; 
        overlay.style.display = "none";
         if( currentMode === "mode-1") {
          counter = 0;
        initBoxes(); // Boxen initialisieren
        drawBoxes(); // Boxen zeichnen
        selectedBox = null;
        spielLaeuft = true; 
      }
      
        if (currentMode === "mode-2") {
  counter = 0;
  document.getElementById("counter").innerText = `überlebte Runden: ${counter}`;
  initBoxes();
  drawBoxes();
  spielLaeuft = true; 
   showArrow = true; 
  startArrowMovement(); // ← NEU!
}
if (currentMode === "mode-3") {
  arrowSpeed = 30;
  counter = 0;
  spielLaeuft = true; 
    showArrow = true; 
  document.getElementById("counter").innerText = `überlebte Runden: ${counter}`;
  initBoxes();
  drawBoxes();
  startArrowMovement();
}

        
      });

    }
  }, 0);
}

function modus1neustart() {
  stopArrowMovement(); 
  spielLaeuft = false; // ← immer zuerst
  let rekordText = "";
if (currentMode === "mode-1") rekordText = `<p>Dein Rekord: <strong>${rekord}</strong> 🏆</p>`;
if (currentMode === "mode-2") rekordText = `<p>Dein Rekord: <strong>${rekord2}</strong> 🏆</p>`;
if (currentMode === "mode-3") rekordText = `<p>Dein Rekord: <strong>${rekord3}</strong> 🏆</p>`;

  const content = `
    <div>
      <h1 style="margin-bottom: 1em; font-size: 2.5rem;">🎨 Schade du bist leider raus! 😪</h1>
     <p>Dein Ergebnis: <strong>${counter}</strong>🎉</p>
    ${rekordText}
      <p>Wähle eine Farbe und hoffe auf dein Glück!</p>
      <button id="startBtn" style="
        margin-top: 0.2em;
        padding: 0.5em 1.5em;
        font-size: 1.5rem;
        background: #ff69b4;
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
      ">Start</button>
    </div>
  `;

  showOverlay(content);

  // Warten, bis der Button existiert, dann Click-Handler
   // Warten, bis der Button existiert, dann Click-Handler
 setTimeout(() => {
  const btn = document.getElementById("startBtn");
  if (btn) {
    btn.addEventListener("click", () => {
     counter = 0;
      overlay.style.display = "none";
   if( currentMode === "mode-1") {
     counter = 0;
  document.getElementById("counter").innerText = `überlebte Runden: ${counter}`;
    spielLaeuft = true; 
        initBoxes(); // Boxen initialisieren
        drawBoxes(); // Boxen zeichnen
        counter = 0;
        selectedBox = null;
      }
      
        if (currentMode === "mode-2") {
          spielLaeuft = true; 
  counter = 0;
  document.getElementById("counter").innerText = `überlebte Runden: ${counter}`;
  counter = 0;
  initBoxes();
  drawBoxes();
   showArrow = true; 
  startArrowMovement(); // ← NEU!
  selectedBox = null;
}
if (currentMode === "mode-3") {
  spielLaeuft = true; 
  arrowSpeed = 30;
  counter = 0;
    showArrow = true; 
  document.getElementById("counter").innerText = `überlebte Runden: ${counter}`;
  initBoxes();
  drawBoxes();
  startArrowMovement();
  selectedBox = null;
}


    });
  }
}, 0);
}
function zeigeRundeLaeuftPopup() {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.padding = "2em";
  popup.style.borderRadius = "20px";
  popup.style.boxShadow = "0 0 30px rgba(255, 255, 255, 0.5)";
  popup.style.zIndex = "2000";
  popup.style.textAlign = "center";
  popup.style.background = "linear-gradient(135deg, #1e1e1e, #333, #1e1e1e)";
  popup.style.color = "#fff";
  popup.style.border = "2px solid #00ffff";

  popup.innerHTML = `
    <p style="margin-bottom: 1.5em; font-size: 1.2em; text-shadow: 0 0 10px #fff;">⚠️ Die Runde läuft noch.<br>Möchtest du sie beenden?</p>
    <div style="display: flex; justify-content: center; gap: 1em;">
      <button id="rundeBeendenJa" style="
        background: linear-gradient(45deg, #00ff88, #00ffaa);
        color: black;
        padding: 0.7em 1.5em;
        border: none;
        border-radius: 12px;
        font-size: 1em;
        font-weight: bold;
        box-shadow: 0 0 10px #00ff88;
        cursor: pointer;
        transition: transform 0.2s;
      ">Ja</button>
      <button id="rundeBeendenNein" style="
        background: linear-gradient(45deg, #ff0044, #ff4466);
        color: black;
        padding: 0.7em 1.5em;
        border: none;
        border-radius: 12px;
        font-size: 1em;
        font-weight: bold;
        box-shadow: 0 0 10px #ff0044;
        cursor: pointer;
        transition: transform 0.2s;
      ">Nein</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Animation beim Hover
  document.querySelectorAll("#rundeBeendenJa, #rundeBeendenNein").forEach(btn => {
    btn.addEventListener("mouseover", () => {
      btn.style.transform = "scale(1.1)";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.transform = "scale(1)";
    });
  });

  // Button-Funktionen
  document.getElementById("rundeBeendenJa").addEventListener("click", () => {
    spielLaeuft = false;
    stopArrowMovement?.();
    popup.remove();
    startscreen();
  });

  document.getElementById("rundeBeendenNein").addEventListener("click", () => {
    popup.remove();
  });
}


// Beispiel: Startscreen anzeigen
startscreen();

