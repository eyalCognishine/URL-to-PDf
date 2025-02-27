/**
 * Returns positions for exactly 8 images per page, arranged in
 * 2 columns x 4 rows, with configurable spacing between images.
 *
 * @param pageWidth - The total width of the PDF page.
 * @param pageHeight - The total height of the PDF page.
 * @param margin - The margin to leave on all sides of the page.
 * @returns An array of slots (x, y, width, height) for 8 images.
 */
export function layoutEightImages(
  pageWidth: number,
  pageHeight: number,
  margin: number
): { x: number; y: number; width: number; height: number }[] {
  // Number of columns and rows for 8 images
  const columns = 2;
  const rows = 4;

  // Gaps between images (in points). Adjust as desired.
  const gapX = 20; // horizontal gap
  const gapY = 20; // vertical gap

  // Calculate total available space inside the margins
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // How many gaps do we have in total horizontally and vertically?
  // For 2 columns, there's (columns - 1) = 1 gap horizontally.
  // For 4 rows, there's (rows - 1) = 3 gaps vertically.
  const totalHGap = gapX * (columns - 1);
  const totalVGap = gapY * (rows - 1);

  // Calculate the slot size for each image
  const slotWidth = (contentWidth - totalHGap) / columns;
  const slotHeight = (contentHeight - totalVGap) / rows;

  // Build an array of positions for 8 images
  const positions: { x: number; y: number; width: number; height: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = margin + col * (slotWidth + gapX);
      const y = margin + row * (slotHeight + gapY);
      positions.push({ x, y, width: slotWidth, height: slotHeight });
    }
  }

  return positions;
}
