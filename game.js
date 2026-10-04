(function () {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const titleEl = document.querySelector("#level-title");
  const timerEl = document.querySelector("#timer");
  const statusEl = document.querySelector("#status");

  const STORAGE_KEY = "pocketPark.v1";
  const TILE = 36;
  const GRAVITY = 1700;
  const MOVE_SPEED = 230;
  const JUMP_SPEED = 610;
  const COYOTE_MS = 110;
  const PIP_SIZE = 28;
  const PUSH_BLOCK_SIZE = 32;
  const DOOR_HOLD_MS = 1850;

  const keys = new Set();
  const saved = loadSave();

  const pipDefs = [
    { id: "star", name: "Pip Star", color: "#ffce4f", ink: "#3f2a00", mark: "*" },
    { id: "moon", name: "Pip Moon", color: "#5fd3ff", ink: "#042b3c", mark: ")" },
    { id: "bolt", name: "Pip Bolt", color: "#9cff6e", ink: "#133500", mark: "Z" },
    { id: "heart", name: "Pip Heart", color: "#ff7aa8", ink: "#470018", mark: "+" }
  ];

  const controlSets = [
    { left: "KeyA", right: "KeyD", jump: "KeyW" },
    { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp" },
    { left: "KeyJ", right: "KeyL", jump: "KeyI" },
    { left: "Numpad4", right: "Numpad6", jump: "Numpad8" }
  ];

  const levels = [
    {
      id: "group-exit",
      title: "1. Everyone Out",
      hint: "Reach the glowing exit together.",
      start: starts([120, 360], [168, 360], [120, 318], [168, 318]),
      solids: commonSolids([rect(180, 408, 180, 24), rect(468, 336, 168, 24), rect(708, 420, 132, 24)]),
      exit: rect(780, 348, 72, 72)
    },
    {
      id: "body-stack",
      title: "2. Stack Up",
      hint: "Use a Body Stack to reach the high ledge.",
      start: starts([112, 420], [152, 420], [112, 378], [152, 378]),
      solids: commonSolids([rect(258, 420, 130, 24), rect(492, 352, 120, 24), rect(704, 280, 150, 24)]),
      exit: rect(770, 208, 72, 72)
    },
    {
      id: "shared-key",
      title: "3. Key Together",
      hint: "Collect the Shared Key, then leave together.",
      start: starts([112, 420], [152, 420], [112, 378], [152, 378]),
      solids: commonSolids([rect(210, 424, 160, 24), rect(430, 376, 140, 24), rect(676, 424, 190, 24)]),
      key: rect(482, 334, 28, 28),
      door: rect(640, 352, 34, 72),
      exit: rect(790, 352, 72, 72)
    },
    {
      id: "pressure-plate",
      title: "4. Hold The Plate",
      hint: "Use the Push Block or a Pip to hold the Pressure Plate.",
      start: starts([108, 420], [148, 420], [108, 378], [148, 378]),
      solids: commonSolids([rect(252, 424, 150, 24), rect(528, 424, 150, 24), rect(744, 424, 120, 24)]),
      plates: [rect(452, 488, 72, 16)],
      pushBlocks: [{ x: 326, y: 392 }],
      door: rect(698, 352, 34, 72),
      exit: rect(792, 352, 72, 72)
    },
    {
      id: "timed-door",
      title: "5. Beat The Door",
      hint: "Trigger the plate, then move through the Timed Door.",
      start: starts([104, 420], [144, 420], [104, 378], [144, 378]),
      solids: commonSolids([rect(240, 420, 120, 24), rect(438, 420, 120, 24), rect(650, 420, 210, 24)]),
      plates: [rect(280, 404, 70, 16)],
      timedDoor: rect(606, 348, 34, 72),
      exit: rect(786, 348, 72, 72)
    },
    {
      id: "mixed-finale",
      title: "6. After-Hours Exit",
      hint: "Stack, collect, hold, and time the final exit.",
      start: starts([96, 420], [136, 420], [96, 378], [136, 378]),
      solids: commonSolids([rect(216, 420, 126, 24), rect(414, 352, 116, 24), rect(594, 424, 104, 24), rect(756, 352, 108, 24)]),
      key: rect(456, 310, 28, 28),
      plates: [rect(606, 408, 72, 16)],
      pushBlocks: [{ x: 246, y: 388 }],
      door: rect(552, 352, 34, 72),
      timedDoor: rect(718, 280, 34, 72),
      exit: rect(792, 280, 72, 72)
    }
  ];

  const state = {
    levelIndex: clamp(saved.currentLevel || 0, 0, levels.length - 1),
    playerCount: clamp(saved.playerCount || 2, 2, 4),
    startedAt: performance.now(),
    elapsedMs: 0,
    complete: false,
    hasSharedKey: false,
    doorOpen: false,
    timedDoorOpenUntil: 0,
    pips: [],
    pushBlocks: [],
    plateActive: false
  };

  function rect(x, y, w, h) {
    return { x, y, w, h };
  }

  function starts(a, b, c, d) {
    return [a, b, c, d].map(([x, y]) => ({ x, y }));
  }

  function commonSolids(extra) {
    return [rect(0, 504, 960, 36), rect(0, 0, 36, 540), rect(924, 0, 36, 540), ...extra];
  }

  function loadSave() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_error) {
      return {};
    }
  }

  function savePatch(patch) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadSave(), ...patch }));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetLevel() {
    const level = levels[state.levelIndex];
    state.startedAt = performance.now();
    state.elapsedMs = 0;
    state.complete = false;
    state.hasSharedKey = false;
    state.doorOpen = !level.door;
    state.timedDoorOpenUntil = 0;
    state.plateActive = false;
    state.pushBlocks = (level.pushBlocks || []).map((block) => ({ x: block.x, y: block.y, vx: 0, vy: 0, grounded: false }));
    state.pips = level.start.slice(0, state.playerCount).map((start, index) => ({
      ...pipDefs[index],
      x: start.x,
      y: start.y,
      vx: 0,
      vy: 0,
      grounded: false,
      lastGroundedAt: 0,
      jumpHeld: false,
      inExit: false
    }));
    titleEl.textContent = level.title;
    statusEl.textContent = level.hint;
    savePatch({ currentLevel: state.levelIndex, playerCount: state.playerCount });
  }

  function pressed(code) {
    return keys.has(code);
  }

  function controlsFor(index) {
    const controls = controlSets[index];
    return {
      left: pressed(controls.left),
      right: pressed(controls.right),
      jump: pressed(controls.jump)
    };
  }

  function update(dt, now) {
    const level = levels[state.levelIndex];
    if (!state.complete) state.elapsedMs = now - state.startedAt;

    for (const block of state.pushBlocks) {
      block.vy += GRAVITY * dt;
      moveBody(block, PUSH_BLOCK_SIZE, 0, block.vy * dt, staticSolids(level), false);
    }

    if (state.complete) return;

    state.pips.forEach((pip, index) => updatePip(pip, index, dt, now, level));
    updateRuleObjects(level, now);
    if (state.pips.every((pip) => pip.inExit)) completeLevel();
  }

  function updatePip(pip, index, dt, now, level) {
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
    if (!input.jump) pip.jumpHeld = false;

    pip.vy += GRAVITY * dt;
    moveBody(pip, PIP_SIZE, pip.vx * dt, 0, staticSolids(level), true);
    moveBody(pip, PIP_SIZE, 0, pip.vy * dt, collisionSolids(level), true);
    pip.inExit = overlaps(bodyRect(pip, PIP_SIZE), level.exit);
  }

  function staticSolids(level) {
    const solids = [...level.solids];
    if (level.door && !state.doorOpen) solids.push(level.door);
    if (level.timedDoor && performance.now() > state.timedDoorOpenUntil) solids.push(level.timedDoor);
    return solids;
  }

  function collisionSolids(level) {
    return [...staticSolids(level), ...state.pushBlocks.map((block) => bodyRect(block, PUSH_BLOCK_SIZE))];
  }

  function moveBody(body, size, dx, dy, solids, canPush) {
    body.x += dx;
    body.y += dy;
    if (dy !== 0) body.grounded = false;

    for (const solid of solids) {
      if (!overlaps(bodyRect(body, size), solid)) continue;
      if (dx > 0) body.x = solid.x - size;
      if (dx < 0) body.x = solid.x + solid.w;
      if (dy > 0) {
        body.y = solid.y - size;
        body.vy = 0;
        body.grounded = true;
        body.lastGroundedAt = performance.now();
      }
      if (dy < 0) {
        body.y = solid.y + solid.h;
        body.vy = 0;
      }
    }

    if (canPush && dx !== 0) {
      for (const block of state.pushBlocks) {
        if (!overlaps(bodyRect(body, size), bodyRect(block, PUSH_BLOCK_SIZE))) continue;
        const oldX = block.x;
        block.x += dx;
        for (const solid of staticSolids(levels[state.levelIndex])) {
          if (!overlaps(bodyRect(block, PUSH_BLOCK_SIZE), solid)) continue;
          block.x = dx > 0 ? solid.x - PUSH_BLOCK_SIZE : solid.x + solid.w;
        }
        body.x = dx > 0 ? block.x - size : block.x + PUSH_BLOCK_SIZE;
        if (oldX === block.x) body.vx = 0;
      }
    }

    if (dy > 0) {
      for (const other of state.pips) {
        if (other === body) continue;
        const bodyBox = bodyRect(body, size);
        const otherBox = bodyRect(other, PIP_SIZE);
        if (overlaps(bodyBox, otherBox) && body.y + size - other.y < 18) {
          body.y = other.y - size;
          body.vy = 0;
          body.grounded = true;
          body.lastGroundedAt = performance.now();
        }
      }
    }
  }

  function updateRuleObjects(level, now) {
    if (level.key && !state.hasSharedKey && state.pips.some((pip) => overlaps(bodyRect(pip, PIP_SIZE), level.key))) {
      state.hasSharedKey = true;
    }

    state.plateActive = (level.plates || []).some((plate) => {
      const pressedByPip = state.pips.some((pip) => overlaps(bodyRect(pip, PIP_SIZE), plate));
      const pressedByBlock = state.pushBlocks.some((block) => overlaps(bodyRect(block, PUSH_BLOCK_SIZE), plate));
      return pressedByPip || pressedByBlock;
    });

    if (level.door) state.doorOpen = level.key ? state.hasSharedKey : state.plateActive;
    if (level.timedDoor && state.plateActive) state.timedDoorOpenUntil = now + DOOR_HOLD_MS;
  }

  function completeLevel() {
    state.complete = true;
    const nextText = state.levelIndex < levels.length - 1 ? "Press N for the next stage." : "Stage Set clear.";
    statusEl.textContent = `Stage clear. Press R to restart. ${nextText}`;
    const bestTimes = loadSave().bestTimes || {};
    const level = levels[state.levelIndex];
    const best = bestTimes[level.id];
    if (!best || state.elapsedMs < best) {
      bestTimes[level.id] = Math.round(state.elapsedMs);
      savePatch({ bestTimes });
    }
  }

  function bodyRect(body, size) {
    return rect(body.x, body.y, size, size);
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function draw() {
    const level = levels[state.levelIndex];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackdrop();
    drawExit(level.exit, state.complete);
    if (level.key && !state.hasSharedKey) drawKey(level.key);
    (level.plates || []).forEach((plate) => drawPlate(plate, state.plateActive));
    if (level.door && !state.doorOpen) drawDoor(level.door, "#ff7a7a");
    if (level.timedDoor && performance.now() > state.timedDoorOpenUntil) drawDoor(level.timedDoor, "#ffb84d");
    level.solids.forEach(drawSolid);
    state.pushBlocks.forEach(drawPushBlock);
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
    for (let x = 108; x < 860; x += TILE) ctx.fillRect(x, 92, 2, 350);
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

  function drawKey(key) {
    ctx.fillStyle = "#ffdc5f";
    ctx.beginPath();
    ctx.arc(key.x + 10, key.y + 14, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(key.x + 18, key.y + 11, 18, 6);
    ctx.fillRect(key.x + 30, key.y + 17, 5, 8);
  }

  function drawPlate(plate, active) {
    ctx.fillStyle = active ? "#8cffb4" : "#43506d";
    ctx.fillRect(plate.x, plate.y, plate.w, plate.h);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(plate.x + 6, plate.y + 3, plate.w - 12, 3);
  }

  function drawDoor(door, color) {
    ctx.fillStyle = color;
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(door.x + 8, door.y + 8, door.w - 16, door.h - 16);
  }

  function drawPushBlock(block) {
    ctx.fillStyle = "#c9a46a";
    ctx.fillRect(block.x, block.y, PUSH_BLOCK_SIZE, PUSH_BLOCK_SIZE);
    ctx.strokeStyle = "#6a4f2d";
    ctx.lineWidth = 3;
    ctx.strokeRect(block.x + 4, block.y + 4, PUSH_BLOCK_SIZE - 8, PUSH_BLOCK_SIZE - 8);
  }

  function drawPip(pip) {
    ctx.fillStyle = pip.color;
    roundRect(pip.x, pip.y, PIP_SIZE, PIP_SIZE, 6);
    ctx.fill();
    ctx.fillStyle = pip.ink;
    ctx.fillRect(pip.x + 7, pip.y + 10, 4, 4);
    ctx.fillRect(pip.x + 17, pip.y + 10, 4, 4);
    ctx.fillRect(pip.x + 9, pip.y + 20, 10, 3);
    ctx.font = "bold 14px system-ui";
    ctx.fillText(pip.mark, pip.x + 10, pip.y + 9);
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
      levelIndex: state.levelIndex,
      complete: state.complete,
      elapsedMs: Math.round(state.elapsedMs),
      playerCount: state.playerCount,
      hasSharedKey: state.hasSharedKey,
      doorOpen: state.doorOpen,
      timedDoorOpen: level.timedDoor ? performance.now() <= state.timedDoorOpenUntil : false,
      plateActive: state.plateActive,
      pips: state.pips.map((pip) => ({
        id: pip.id,
        x: Math.round(pip.x),
        y: Math.round(pip.y),
        grounded: pip.grounded,
        inExit: pip.inExit
      })),
      pushBlocks: state.pushBlocks.map((block) => ({ x: Math.round(block.x), y: Math.round(block.y) })),
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
    if (event.code === "KeyN") {
      nextLevel();
      return;
    }
    if (/^Digit[1-6]$/.test(event.code)) {
      state.levelIndex = Number(event.code.slice(5)) - 1;
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
    nextLevel,
    setLevel(index) {
      state.levelIndex = clamp(index, 0, levels.length - 1);
      resetLevel();
    },
    setPlayerCount(count) {
      state.playerCount = clamp(count, 2, 4);
      resetLevel();
    },
    setPipPosition(index, x, y) {
      const pip = state.pips[index];
      pip.x = x;
      pip.y = y;
      pip.vx = 0;
      pip.vy = 0;
    },
    setPushBlockPosition(index, x, y) {
      const block = state.pushBlocks[index];
      block.x = x;
      block.y = y;
      block.vx = 0;
      block.vy = 0;
    },
    tick(ms) {
      update(ms / 1000, performance.now() + ms);
      draw();
    }
  };

  resetLevel();
  requestAnimationFrame(frame);

  function nextLevel() {
    state.levelIndex = (state.levelIndex + 1) % levels.length;
    resetLevel();
  }
})();
