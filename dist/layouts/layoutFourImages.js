"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutFourImages = layoutFourImages;
/**
 * Returns positions for exactly 4 images per page, arranged in
 * a 2 columns x 2 rows grid, with configurable spacing between them.
 *
 * @param pageWidth - The total width of the PDF page.
 * @param pageHeight - The total height of the PDF page.
 * @param margin - The margin to leave on all sides of the page.
 * @returns An array of slots (x, y, width, height) for 4 images in a 2×2 grid.
 */
function layoutFourImages(pageWidth, pageHeight, margin) {
    // Number of columns and rows for 4 images
    const columns = 2;
    const rows = 2;
    // Gaps between images (in points). Adjust as desired.
    const gapX = 20; // horizontal gap
    const gapY = 20; // vertical gap
    // Calculate total usable area inside the margins
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    // How many gaps do we have horizontally/vertically?
    // For 2 columns, there's (columns - 1) = 1 gap horizontally.
    // For 2 rows, there's (rows - 1) = 1 gap vertically.
    const totalHGap = gapX * (columns - 1);
    const totalVGap = gapY * (rows - 1);
    // Calculate the slot size for each image
    const slotWidth = (contentWidth - totalHGap) / columns;
    const slotHeight = (contentHeight - totalVGap) / rows;
    // Build an array of positions for 4 images
    const positions = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = margin + col * (slotWidth + gapX);
            const y = margin + row * (slotHeight + gapY);
            positions.push({ x, y, width: slotWidth, height: slotHeight });
        }
    }
    return positions;
}
