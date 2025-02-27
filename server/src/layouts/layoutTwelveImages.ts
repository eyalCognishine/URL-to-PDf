/**
 * Returns positions for exactly 12 images per page arranged in a grid.
 * For a landscape page, 12 images are arranged in 4 columns × 3 rows.
 *
 * Each slot’s "fit" property represents the maximum available dimensions
 * for that cell. When used with PDFKit's `fit` option (with center alignment),
 * each image is scaled as large as possible while preserving its original aspect ratio.
 *
 * The grid is centered within the available area (page dimensions minus margins).
 *
 * @param pageWidth - The total width of the PDF page.
 * @param pageHeight - The total height of the PDF page.
 * @param margin - The margin to leave on all sides of the page.
 * @returns An array of slot objects with x, y, and fit values.
 */
export function layoutTwelveImages(
  pageWidth: number,
  pageHeight: number,
  margin: number
): { x: number; y: number; fit: [number, number] }[] {
  // For landscape, we arrange 12 images in 4 columns and 3 rows.
  const columns = 4;
  const rows = 3;
  const gapX = 15; // Horizontal gap between cells.
  const gapY = 15; // Vertical gap between cells.

  // Compute available area inside margins.
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  // Divide the available area equally into cells.
  const cellWidth = (availableWidth - gapX * (columns - 1)) / columns;
  const cellHeight = (availableHeight - gapY * (rows - 1)) / rows;

  // Compute total grid dimensions.
  const totalGridWidth = columns * cellWidth + gapX * (columns - 1);
  const totalGridHeight = rows * cellHeight + gapY * (rows - 1);

  // Center the grid within the available area.
  const offsetX = margin + (availableWidth - totalGridWidth) / 2;
  const offsetY = margin + (availableHeight - totalGridHeight) / 2;

  const slots: { x: number; y: number; fit: [number, number] }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = offsetX + col * (cellWidth + gapX);
      const y = offsetY + row * (cellHeight + gapY);
      // Return the maximum available dimensions for each cell.
      slots.push({ x, y, fit: [cellWidth, cellHeight] });
    }
  }
  return slots;
}
