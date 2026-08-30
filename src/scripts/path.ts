// Pure geometry and state for Steady Hand. No DOM here: this module only
// knows about points and numbers, so it can be tested without a canvas and
// stays correct if the rendering approach changes later.

export interface Point {
  x: number;
  y: number;
}

export type GameState = "idle" | "running" | "won" | "lost";

export interface Level {
  path: Point[];
  width: number;
}

// The loop is a fixed size across levels, the same as a physical buzz-wire's
// wand — only the wire (path shape and width) gets harder between levels.
export const BEAD_RADIUS = 2.5;
export const CAPTURE_RADIUS = 4;

// Waypoints in a 100x60 viewBox, left to right with no self-crossing, so the
// path is unambiguous to look at. Straight segments between them are both
// the visual track and the hit-test geometry.
export const LEVELS: Level[] = [
  {
    width: 14,
    path: [
      { x: 8, y: 30 },
      { x: 30, y: 8 },
      { x: 50, y: 52 },
      { x: 70, y: 8 },
      { x: 92, y: 30 },
    ],
  },
  {
    width: 10,
    path: [
      { x: 8, y: 30 },
      { x: 22, y: 10 },
      { x: 36, y: 50 },
      { x: 50, y: 10 },
      { x: 64, y: 50 },
      { x: 78, y: 10 },
      { x: 92, y: 30 },
    ],
  },
  {
    width: 7,
    path: [
      { x: 8, y: 30 },
      { x: 18, y: 8 },
      { x: 28, y: 52 },
      { x: 38, y: 8 },
      { x: 50, y: 52 },
      { x: 62, y: 8 },
      { x: 72, y: 52 },
      { x: 82, y: 8 },
      { x: 92, y: 30 },
    ],
  },
];

function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared),
  );
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(point.x - projX, point.y - projY);
}

export function distanceToPath(point: Point, path: Point[]): number {
  let min = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    min = Math.min(min, distanceToSegment(point, path[i], path[i + 1]));
  }
  return min;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** True only if the whole bead — not just its center — stays inside the
 *  track: the centerline distance has to leave room for the bead's radius. */
export function isWithinPath(
  point: Point,
  path: Point[],
  width: number,
  beadRadius: number = BEAD_RADIUS,
): boolean {
  return distanceToPath(point, path) <= width / 2 - beadRadius;
}

export function isAtStart(point: Point, start: Point, radius: number = CAPTURE_RADIUS): boolean {
  return distance(point, start) <= radius;
}

export function isAtEnd(point: Point, end: Point, radius: number = CAPTURE_RADIUS): boolean {
  return distance(point, end) <= radius;
}

/** One step of the game's rules: given where things stand, this level's
 *  track, and where the pointer is now, what state comes next. `won`/`lost`
 *  are terminal here — returning to `idle` is a deliberate reset the caller
 *  drives, whether that's a retry or moving on to the next level. */
export function nextState(state: GameState, point: Point, level: Level): GameState {
  if (state === "won" || state === "lost") return state;
  const start = level.path[0];
  const end = level.path[level.path.length - 1];
  if (state === "idle") return isAtStart(point, start) ? "running" : "idle";
  if (isAtEnd(point, end)) return "won";
  if (!isWithinPath(point, level.path, level.width)) return "lost";
  return "running";
}
