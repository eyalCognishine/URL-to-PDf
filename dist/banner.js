"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBanner = addBanner;
/**
 * Draws the top banner on the current page:
 *  - A logo image on the left
 *  - A license text on the right (or below the logo, depending on coordinates)
 *
 * @param doc - The PDFDocument instance.
 * @param logoBuffer - A Buffer containing the logo image data.
 * @param text - The license text to be displayed.
 */
function addBanner(doc, logoBuffer, text) {
    // Example coordinates and sizes; adjust as needed
    const logoX = 50;
    const logoY = 10;
    const logoWidth = 120;
    // Place the logo
    doc.image(logoBuffer, logoX, logoY, { width: logoWidth });
    // Place the text to the right of the logo
    // Adjust x, y, and width so it doesn't overlap the logo
    const textX = logoX + logoWidth + 20; // 20pt gap after the logo
    const textY = logoY;
    const textWidth = 400;
    doc
        .fontSize(10)
        .text(text, textX, textY, {
        width: textWidth,
        // If you want the text to wrap, set 'align' to 'justify' or 'left'
        align: 'left',
    });
}
