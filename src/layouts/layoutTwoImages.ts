export function layoutTwoImages(
  pageWidth: number,
  pageHeight: number,
  margin: number
): { x: number; y: number; width: number; height: number }[] {
  // Vertical gap (in points) between the two images
  const gapY = 20;

  // Usable width/height inside the margins
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // For 2 images stacked, we have 1 column, 2 rows, and 1 gap in between.
  const totalVGap = gapY;
  // Each image occupies half of the remaining vertical space (minus the single gap).
  const slotHeight = (contentHeight - totalVGap) / 2;
  // Each image spans the full content width (since only one column).
  const slotWidth = contentWidth;

  return [
    {
      x: margin,
      y: margin,
      width: slotWidth,
      height: slotHeight,
    },
    {
      x: margin,
      y: margin + slotHeight + gapY,
      width: slotWidth,
      height: slotHeight,
    },
  ];
}
