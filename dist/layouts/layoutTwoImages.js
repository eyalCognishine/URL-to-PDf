"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutTwoImages = layoutTwoImages;
/**
 * Returns positions for exactly 2 images per page, arranged side by side
 * in a single row with a small gap between them.
 *
 * @param pageWidth - The total width of the PDF page.
 * @param pageHeight - The total height of the PDF page.
 * @param margin - The margin to leave on all sides of the page.
 * @returns An array of slots (x, y, width, height) for 2 images in one row.
 */
function layoutTwoImages(pageWidth, pageHeight, margin) {
    // Gap (in points) between the two images
    const gapX = 20;
    // Calculate the usable width/height inside the margins
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    // Because we have 2 columns, we have 1 horizontal gap
    const totalHGap = gapX;
    const slotWidth = (contentWidth - totalHGap) / 2;
    // We’ll make each image fill the entire content height.
    // If you want them smaller, reduce slotHeight or preserve aspect ratio in doc.image.
    const slotHeight = contentHeight;
    return [
        {
            x: margin,
            y: margin,
            width: slotWidth,
            height: slotHeight,
        },
        {
            x: margin + slotWidth + gapX,
            y: margin,
            width: slotWidth,
            height: slotHeight,
        },
    ];
}
