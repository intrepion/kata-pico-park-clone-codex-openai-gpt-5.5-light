(function () {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const titleEl = document.querySelector("#level-title");
  const timerEl = document.querySelector("#timer");
  const statusEl = document.querySelector("#status");

  const TILE = 36;
  const GRAVITY = 1700;
  const MOVE_SPEED = 230;
  const JUMP_SPEED = 610;
  const COYOTE_MS = 110;
  const PIP_SIZE = 28;

  const keys = new Set();
  const levels = [
    {
      id: "group-exit",
      title: "1. Everyone Out",
      hint: "Reach the glowing exit together.",
      start: [
        { x: 120, y: 360 },
        { x: 168, y: 360 }
      ],
      solids: [
        rect(0, 504, 960, 36),
        rect(0, 0, 36, 540),
        rect(924, 0, 36, 540),
        rect(180, 408, 180, 24),
        rect(468, 336, 168, 24),
        rect(708, 420, 132, 24)
      ],
      exit: rect(780, 348, 72, 72)
    }
  ];

  const pipDefs = [
    { id: "star", name: "Pip Star", color: "#ffce4f", ink: "#3f2a00", mark: "star" },
    { id: "moon", name: "Pip Moon", color: "#5fd3ff", ink: "#042b3c", mark: "moon" }
  ];

  const state = {
    levelIndex: 0,
    startedAt: performance.now(),
    elapsedMs: 0,
    complete: false,
    pips: []
  };

  function rect(x, y, w, h) {
    return { x, y, w, h };
  }

  function resetLevel() {
    const level = levels[state.levelIndex];
    state.startedAt = performance.now();
    state.elapsedMs = 0;
    state.complete = false;
    state.pips = level.start.map((start, index) => ({
      ...pipDefs[index],
      x: start.x,
      y: start.y,
      vx: 0,
      vy: 0,
      grounded: false,
      lastGroundedAt: 0,
      inExit: false
    }));
    titleEl.textContent = level.title;
    statusEl.textContent = level.hint;
  }

  function pressed(...codes) {
    return codes.some((code) => keys.has(code));
  }

  function controlsFor(index) {
    if (index === 0) {
      return {
        left: pressed("KeyA"),
        right: pressed("KeyD"),
        jump: pressed("KeyW")
      };
    }
    return {
      left: pressed("ArrowLeft"),
      right: pressed("ArrowRight"),
      jump: pressed("ArrowUp")
    };
  }

  function update(dt, now) {
    if (state.complete) {
      return;
    }
    const level = levels[state.levelIndex];
    state.elapsedMs = now - state.startedAt;

    state.pips.forEach((pip, index) => {
      const input = controlsFor(index);
      pip.vx = 0;
      if (input.left) pip.vx -= MOVE_SPEED;
      if (input.right) pip.vx += MOVE_SPEED;

      const canCoyote = now - pip.lastGroundedAt <= COYOTE_MS;
      if (input.jump && (pip.grounded || canCoyote) && !pip.jumpHeld) {
        pip.vy = -JUMP_SPEED;
        pip.grounded = false;
        pip.jumpHeld = true;
      }
      if (!input.jump) {
        pip.jumpHeld = false;
      }

      pip.vy += GRAVITY * dt;
      movePip(pip, pip.vx * dt, 0, level.solids);
      movePip(pip, 0, pip.vy * dt, level.solids);
      pip.inExit = overlaps(pipRect(pip), level.exit);
    });

    if (state.pips.every((pip) => pip.inExit)) {
      state.complete = true;
      statusEl.textContent = "Stage clear. Press R to restart.";
    }
  }

  function movePip(pip, dx, dy, solids) {
    pip.x += dx;
    pip.y += dy;
    pip.grounded = false;

    for (const solid of solids) {
      if (!overlaps(pipRect(pip), solid)) continue;
      if (dx > 0) pip.x = solid.x - PIP_SIZE;
      if (dx < 0) pip.x = solid.x + solid.w;
      if (dy > 0) {
        pip.y = solid.y - PIP_SIZE;
        pip.vy = 0;
        pip.grounded = true;
        pip.lastGroundedAt = performance.now();
      }
      if (dy < 0) {
        pip.y = solid.y + solid.h;
        pip.vy = 0;
      }
    }
  }

  function pipRect(pip) {
    return rect(pip.x, pip.y, PIP_SIZE, PIP_SIZE);
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function draw() {
    const level = levels[state.levelIndex];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackdrop();
    drawExit(level.exit, state.complete);
    level.solids.forEach(drawSolid);
    state.pips.forEach(drawPip);
    drawCurtain();

    timerEl.textContent = formatTime(state.elapsedMs);
  }

  function drawBackdrop() {
    ctx.fillStyle = "#151926";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#252c3e";
    ctx.fillRect(72, 68, 816, 398);
    ctx.strokeStyle = "#ffce4f";
    ctx.lineWidth = 4;
    ctx.strokeRect(72, 68, 816, 398);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = 108; x < 860; x += TILE) {
      ctx.fillRect(x, 92, 2, 350);
    }
  }

  function drawCurtain() {
    ctx.fillStyle = "#30192e";
    ctx.fillRect(0, 0, 64, canvas.height);
    ctx.fillRect(canvas.width - 64, 0, 64, canvas.height);
  }

  function drawSolid(solid) {
    ctx.fillStyle = "#6b5b95";
    ctx.fillRect(solid.x, solid.y, solid.w, solid.h);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(solid.x, solid.y, solid.w, 5);
  }

  function drawExit(exit, complete) {
    ctx.fillStyle = complete ? "#8cffb4" : "#4ce0a8";
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(exit.x + 10, exit.y + 10, exit.w - 20, exit.h - 20);
  }

  function drawPip(pip) {
    ctx.fillStyle = pip.color;
    roundRect(pip.x, pip.y, PIP_SIZE, PIP_SIZE, 6);
    ctx.fill();
    ctx.fillStyle = pip.ink;
    ctx.fillRect(pip.x + 7, pip.y + 10, 4, 4);
    ctx.fillRect(pip.x + 17, pip.y + 10, 4, 4);
    ctx.fillRect(pip.x + 9, pip.y + 20, 10, 3);
    drawMark(pip);
  }

  function drawMark(pip) {
    ctx.fillStyle = pip.ink;
    if (pip.mark === "star") {
      ctx.beginPath();
      ctx.moveTo(pip.x + 14, pip.y + 4);
      ctx.lineTo(pip.x + 17, pip.y + 9);
      ctx.lineTo(pip.x + 23, pip.y + 9);
      ctx.lineTo(pip.x + 18, pip.y + 13);
      ctx.lineTo(pip.x + 20, pip.y + 19);
      ctx.lineTo(pip.x + 14, pip.y + 15);
      ctx.lineTo(pip.x + 8, pip.y + 19);
      ctx.lineTo(pip.x + 10, pip.y + 13);
      ctx.lineTo(pip.x + 5, pip.y + 9);
      ctx.lineTo(pip.x + 11, pip.y + 9);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(pip.x + 14, pip.y + 12, 7, 0.35 * Math.PI, 1.65 * Math.PI);
      ctx.arc(pip.x + 18, pip.y + 12, 7, 1.65 * Math.PI, 0.35 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  }

  function snapshot() {
    const level = levels[state.levelIndex];
    return {
      levelId: level.id,
      complete: state.complete,
      elapsedMs: Math.round(state.elapsedMs),
      pips: state.pips.map((pip) => ({
        id: pip.id,
        x: Math.round(pip.x),
        y: Math.round(pip.y),
        grounded: pip.grounded,
        inExit: pip.inExit
      })),
      exit: level.exit
    };
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    update(dt, now);
    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyR") {
      resetLevel();
      return;
    }
    keys.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  window.pocketParkTest = {
    snapshot,
    reset: resetLevel,
    setPipPosition(index, x, y) {
      const pip = state.pips[index];
      pip.x = x;
      pip.y = y;
      pip.vx = 0;
      pip.vy = 0;
    }
  };

  resetLevel();
  requestAnimationFrame(frame);
})();
