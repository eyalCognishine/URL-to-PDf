/**
 * Returns positions for exactly 20 images per page, arranged in
 * 5 columns x 4 rows, with configurable spacing between images.
 *
 * @param pageWidth - The total width of the PDF page.
 * @param pageHeight - The total height of the PDF page.
 * @param margin - The margin to leave on all sides of the page.
 * @returns An array of slots (x, y, width, height) for 20 images.
 */
export function layoutTwentyImages(
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): { x: number; y: number; width: number; height: number }[] {
    const columns = 5;
    const rows = 4;
    const gapX = 20; // horizontal gap
    const gapY = 20; // vertical gap
  
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
  
    const totalHGap = gapX * (columns - 1);
    const totalVGap = gapY * (rows - 1);
  
    const slotWidth = (contentWidth - totalHGap) / columns;
    const slotHeight = (contentHeight - totalVGap) / rows;
  
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
  