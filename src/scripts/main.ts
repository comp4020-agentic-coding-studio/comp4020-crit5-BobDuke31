import { LEVELS, BEAD_RADIUS, isAtStart, nextState, type GameState, type Level, type Point } from "./path";

const svg = document.querySelector<SVGSVGElement>("#board")!;
const track = document.querySelector<SVGPolylineElement>("#track")!;
const bead = document.querySelector<SVGCircleElement>("#bead")!;
const endDot = document.querySelector<SVGCircleElement>("#end-dot")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;
const levelLabel = document.querySelector<HTMLSpanElement>("#level-label")!;
const hud = document.querySelector<HTMLDivElement>("#hud")!;
const timerLabel = document.querySelector<HTMLSpanElement>("#timer")!;

bead.setAttribute("r", String(BEAD_RADIUS));

let levelIndex = 0;
let state: GameState = "idle";
let dragging = false;
let levelStartedAt = 0;
let cumulativeTime = 0;
let rafId: number | null = null;

function currentLevel(): Level {
  return LEVELS[levelIndex];
}

function setBead(point: Point): void {
  bead.setAttribute("cx", String(point.x));
  bead.setAttribute("cy", String(point.y));
}

function drawLevel(): void {
  const level = currentLevel();
  track.setAttribute("points", level.path.map((p) => `${p.x},${p.y}`).join(" "));
  track.setAttribute("stroke-width", String(level.width));
  const end = level.path[level.path.length - 1];
  endDot.setAttribute("cx", String(end.x));
  endDot.setAttribute("cy", String(end.y));
  setBead(level.path[0]);
  levelLabel.textContent = `Level ${levelIndex + 1} of ${LEVELS.length}`;
  hud.dataset.level = String(levelIndex);
}

function toBoardPoint(clientX: number, clientY: number): Point {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformed = point.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function stopTimerLoop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function tickTimer(): void {
  timerLabel.textContent = formatTime(performance.now() - levelStartedAt);
  rafId = requestAnimationFrame(tickTimer);
}

function render(): void {
  svg.dataset.state = state;
}

function handleWin(): void {
  dragging = false;
  stopTimerLoop();
  const elapsed = performance.now() - levelStartedAt;
  cumulativeTime += elapsed;
  state = "won";
  render();

  const isFinalLevel = levelIndex === LEVELS.length - 1;
  status.textContent = isFinalLevel
    ? `Finished all levels in ${formatTime(cumulativeTime)}.`
    : `Level ${levelIndex + 1} finished in ${formatTime(elapsed)}.`;
  timerLabel.textContent = isFinalLevel ? formatTime(cumulativeTime) : formatTime(elapsed);

  setTimeout(
    () => {
      if (isFinalLevel) {
        levelIndex = 0;
        cumulativeTime = 0;
      } else {
        levelIndex += 1;
      }
      state = "idle";
      timerLabel.textContent = "0.0s";
      drawLevel();
      render();
    },
    isFinalLevel ? 2000 : 900,
  );
}

function handleLoss(): void {
  dragging = false;
  stopTimerLoop();
  state = "lost";
  render();
  status.textContent = "Left the path.";

  setTimeout(() => {
    state = "idle";
    timerLabel.textContent = "0.0s";
    setBead(currentLevel().path[0]);
    render();
  }, 700);
}

svg.addEventListener("pointerdown", (event) => {
  if (state !== "idle") return;
  const point = toBoardPoint(event.clientX, event.clientY);
  if (!isAtStart(point, currentLevel().path[0])) return;
  svg.setPointerCapture(event.pointerId);
  dragging = true;
  state = "running";
  status.textContent = "";
  levelStartedAt = performance.now();
  stopTimerLoop();
  tickTimer();
  setBead(point);
  render();
});

svg.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const point = toBoardPoint(event.clientX, event.clientY);
  setBead(point);
  const next = nextState(state, point, currentLevel());
  if (next !== state) {
    if (next === "won") handleWin();
    else if (next === "lost") handleLoss();
    else {
      state = next;
      render();
    }
  }
});

function onRelease(event: PointerEvent): void {
  if (!dragging) return;
  svg.releasePointerCapture(event.pointerId);
  if (state === "running") handleLoss();
}

svg.addEventListener("pointerup", onRelease);
svg.addEventListener("pointercancel", onRelease);

drawLevel();
render();
