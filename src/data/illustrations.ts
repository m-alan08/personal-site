export const policySketch = {
  nodes: [
    { x: 38, y: 54 },
    { x: 38, y: 114 },
    { x: 38, y: 174 },
    { x: 160, y: 34 },
    { x: 160, y: 94 },
    { x: 160, y: 154 },
    { x: 160, y: 214 },
    { x: 282, y: 84 },
    { x: 282, y: 164 },
  ],
  edges: [0, 1, 2]
    .flatMap((from) =>
      [3, 4, 5, 6].map((to) => ({
        from,
        to,
        weight: ((from * 7 + to * 3) % 13) / 13,
      })),
    )
    .concat(
      [3, 4, 5, 6].flatMap((from) =>
        [7, 8].map((to) => ({
          from,
          to,
          weight: ((from * 7 + to * 3) % 13) / 13,
        })),
      ),
    ),
};
export const connectionSample = {
  nodes: [
    { id: "A", topic: "Robotics", x: 66, y: 54 },
    { id: "B", topic: "Machine learning", x: 218, y: 52 },
    { id: "C", topic: "Robotics", x: 124, y: 125 },
    { id: "D", topic: "Design", x: 260, y: 153 },
    { id: "E", topic: "Design", x: 44, y: 177 },
    { id: "F", topic: "Machine learning", x: 84, y: 255 },
    { id: "G", topic: "Robotics", x: 190, y: 244 },
    { id: "H", topic: "Design", x: 274, y: 260 },
  ],
  edges: [
    [0, 2],
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 6],
    [4, 5],
    [5, 6],
    [6, 7],
    [3, 7],
  ],
};
