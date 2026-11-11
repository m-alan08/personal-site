export const chartFrame = {
  width: 360,
  height: 196,
  left: 44,
  right: 16,
  top: 12,
  bottom: 164,
  labelY: 186,
};

export const chartTicks = [0, 50, 100];

export function chartX(index: number, count: number): number {
  const span = chartFrame.width - chartFrame.left - chartFrame.right;
  return chartFrame.left + (span * index) / (count - 1);
}

export function chartY(percent: number): number {
  return (
    chartFrame.bottom - ((chartFrame.bottom - chartFrame.top) * percent) / 100
  );
}
