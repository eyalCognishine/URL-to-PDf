/**
 * Returns the position for exactly 1 image per page.
 *
 * @param pageWidth - The total width of the PDF page.
 * @param pageHeight - The total height of the PDF page.
 * @param margin - The margin to leave on all sides.
 * @returns An array of slots (x, y, width, height) for 1 image.
 */
export function layoutOneImage(
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): { x: number; y: number; width: number; height: number }[] {
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
  
    return [
      {
        x: margin,
        y: margin,
        width: availableWidth,
        height: availableHeight,
      },
    ];
  }
  