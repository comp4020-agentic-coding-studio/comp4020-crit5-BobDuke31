// Contract test for this week's crit (05-game, "A game"): "it can be lost: a
// wrong move is possible, and play ends somewhere — a win, a loss or a
// finish." Tested against the pure rules in src/scripts/path.ts, not the DOM,
// so it holds regardless of how the game is drawn.
import { describe, expect, it } from "vitest";
import { BEAD_RADIUS, isWithinPath, LEVELS, nextState } from "../src/scripts/path";

const level = LEVELS[0];
const start = level.path[0];
const end = level.path[level.path.length - 1];

describe("Steady Hand: the one rule", () => {
  it("starts idle and stays idle away from the start", () => {
    expect(nextState("idle", { x: 0, y: 0 }, level)).toBe("idle");
  });

  it("moving onto the start begins a run", () => {
    expect(nextState("idle", start, level)).toBe("running");
  });

  it("staying on the path keeps the run going", () => {
    const onPath = level.path[2]; // an interior waypoint, dead on the centerline
    expect(nextState("running", onPath, level)).toBe("running");
  });

  it("a wrong move — straying off the path — ends the run in a loss", () => {
    const farOff = { x: level.path[2].x, y: level.path[2].y + 30 };
    expect(isWithinPath(farOff, level.path, level.width)).toBe(false);
    expect(nextState("running", farOff, level)).toBe("lost");
  });

  it("reaching the end finishes the run as a win", () => {
    expect(nextState("running", end, level)).toBe("won");
  });

  it("won and lost are terminal until something resets them", () => {
    expect(nextState("won", start, level)).toBe("won");
    expect(nextState("lost", end, level)).toBe("lost");
  });

  it("the whole bead, not just its centre, must stay inside the track", () => {
    // Just past the centerline, still inside the track's half-width, but not
    // with room for the bead's own radius — this used to pass as "on the
    // path" when only the centre point was checked.
    const halfWidth = level.width / 2;
    const grazing = { x: level.path[2].x, y: level.path[2].y + (halfWidth - BEAD_RADIUS / 2) };
    expect(isWithinPath(grazing, level.path, level.width)).toBe(false);
    expect(nextState("running", grazing, level)).toBe("lost");
  });

  it("later levels narrow the effective tolerance, so difficulty actually increases", () => {
    const tolerances = LEVELS.map((lvl) => lvl.width / 2 - BEAD_RADIUS);
    for (let i = 1; i < tolerances.length; i++) {
      expect(tolerances[i]).toBeLessThan(tolerances[i - 1]);
    }
  });
});
