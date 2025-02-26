import PDFDocument from 'pdfkit';

export function addBanner(
  doc: any,
  logoBuffer: Buffer,
  // License text includes exactly ONE forced line break (\n).
  licenseText: string
): void {
  const bannerX = 50;
  const bannerY = 5;

  const logoWidth = 69.84; 
  const logoHeight = 9.36;

  // Draw logo
  doc.image(logoBuffer, bannerX, bannerY, { width: logoWidth, height: logoHeight });

  doc.font('Helvetica-Bold').fontSize(5).fillColor('#808080');

  // Updated gap between logo and text: 10px
  const textX = bannerX + logoWidth + 10; 
  const textY = bannerY;
  // Make sure textWidth is big enough so each line doesn't wrap again.
  const textWidth = 400;

  // If `licenseText` has one \n, you get exactly two lines:
  // e.g. "Line 1 of text.\nLine 2 of text."
  doc.text(licenseText, textX, textY, {
    width: textWidth,
    align: 'left',
  });
}
