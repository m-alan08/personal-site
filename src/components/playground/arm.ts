export interface Point {
  x: number;
  y: number;
}

export const armGeometry = {
  shoulder: { x: -520, y: -120 },
  upperArm: 480,
  forearm: 480,
  wrist: 110,
  stage: { left: -440, right: 500, top: -440, bottom: 300 },
};

export function toScene(origin: number[], position: ArrayLike<number>): Point {
  return {
    x: (position[0] - origin[0]) * 1000,
    y: -(position[2] - origin[2]) * 1000,
  };
}

export function fromScene(
  origin: number[],
  point: Point,
  depth: number,
): [number, number, number] {
  return [origin[0] + point.x / 1000, depth, origin[2] - point.y / 1000];
}

export function clampToStage(point: Point): Point {
  const { left, right, top, bottom } = armGeometry.stage;
  return {
    x: Math.min(right, Math.max(left, point.x)),
    y: Math.min(bottom, Math.max(top, point.y)),
  };
}

export function solveElbow(grip: Point): { elbow: Point; wrist: Point } {
  const { shoulder, upperArm, forearm, wrist: drop } = armGeometry;
  const wrist = { x: grip.x, y: grip.y - drop };
  const dx = wrist.x - shoulder.x;
  const dy = wrist.y - shoulder.y;
  const reach = Math.min(
    upperArm + forearm - 1,
    Math.max(Math.abs(upperArm - forearm) + 1, Math.hypot(dx, dy)),
  );
  const heading = Math.atan2(dy, dx);
  const bend = Math.acos(
    (upperArm ** 2 + reach ** 2 - forearm ** 2) / (2 * upperArm * reach),
  );
  const angle = heading - bend;
  return {
    elbow: {
      x: shoulder.x + upperArm * Math.cos(angle),
      y: shoulder.y + upperArm * Math.sin(angle),
    },
    wrist,
  };
}
