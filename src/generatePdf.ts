import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { addBanner } from './banner';
import { layoutOneImage } from './layouts/layoutOneImage';
import { layoutTwoImages } from './layouts/layoutTwoImages';
import { layoutFourImages } from './layouts/layoutFourImages';
import { layoutEightImages } from './layouts/layoutEightImages';

async function generatePdfFromImages(
  imageUrls: string[],
  imagesPerPage: 1 | 2 | 4 | 8,
  outputPath: string
): Promise<void> {
  // Use portrait for options 2 & 8, landscape for 1 & 4 (as an example).
  // Adjust logic as desired for your other page orientations.
  let doc;
  if (imagesPerPage === 2 || imagesPerPage === 8) {
    doc = new PDFDocument(); // Default = portrait
  } else {
    doc = new PDFDocument({ layout: 'landscape' });
  }

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Read the logo for the banner
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // The license text for the banner
  const licenseText = `The PDF may be used only for non-commercial purposes. They may not be used for any illegal or immoral purpose. 
Please refrain from violating any intellectual property rights in or in connection with the images. Failure to comply with this print license agreement may expose you to civil and/or criminal liability`;

  // Add the banner to the first page
  addBanner(doc, logoBuffer, licenseText);

  // Add the banner to subsequent pages
  doc.on('pageAdded', () => {
    addBanner(doc, logoBuffer, licenseText);
  });

  // Retrieve page dimensions
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Adjust margin so images start below banner
  const margin = 40;

  // Determine layout slots
  let slots: { x: number; y: number; width: number; height: number }[] = [];
  switch (imagesPerPage) {
    case 1:
      slots = layoutOneImage(pageWidth, pageHeight, margin);
      break;
    case 2:
      slots = layoutTwoImages(pageWidth, pageHeight, margin);
      break;
    case 4:
      slots = layoutFourImages(pageWidth, pageHeight, margin);
      break;
    case 8:
      slots = layoutEightImages(pageWidth, pageHeight, margin);
      break;
    default:
      throw new Error('Invalid imagesPerPage value. Allowed: 1, 2, 4, 8');
  }

  // Place images in batches
  for (let i = 0; i < imageUrls.length; i += imagesPerPage) {
    if (i !== 0) {
      doc.addPage();
    }
    const currentPageUrls = imageUrls.slice(i, i + imagesPerPage);

    for (let j = 0; j < currentPageUrls.length; j++) {
      try {
        const response = await axios.get(currentPageUrls[j], {
          responseType: 'arraybuffer',
        });
        const imageBuffer = Buffer.from(response.data, 'binary');

        const { x, y, width, height } = slots[j];
        doc.image(imageBuffer, x, y, { width, height });
      } catch (error) {
        console.error(`Failed to load image: ${currentPageUrls[j]}:`, error);
      }
    }
  }

  // Finalize the PDF
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`PDF generated at: ${outputPath}`);
      resolve();
    });
    writeStream.on('error', reject);
  });
}

export default generatePdfFromImages;
