import PDFDocument from 'pdfkit';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { WritableStreamBuffer } from 'stream-buffers';

import { addBanner } from './banner';
import { layoutOneImage } from './layouts/layoutOneImage';
import { layoutTwoImages } from './layouts/layoutTwoImages';
import { layoutFourImages } from './layouts/layoutFourImages';
import { layoutEightImages } from './layouts/layoutEightImages';
import { layoutTwelveImages } from './layouts/layoutTwelveImages';
import { layoutSixteenImages } from './layouts/layoutSixteenImages';
import { layoutTwentyImages } from './layouts/layoutTwentyImages';

// Define a union type for layout slots.
type Slot =
  | { x: number; y: number; width: number; height: number }
  | { x: number; y: number; fit: [number, number] };

async function generatePdfFromImages(
  imageUrls: string[],
  imagesPerPage: 1 | 2 | 4 | 8 | 12 | 16 | 20
): Promise<Buffer> {
  // For imagesPerPage 2 and 8, use portrait; for 1, 4, 12, 16, and 20, force landscape.
  let doc;
  if ([2, 8].includes(imagesPerPage)) {
    doc = new PDFDocument(); // portrait
  } else {
    doc = new PDFDocument({ layout: 'landscape' });
  }

  // Create an in‑memory writable stream.
  const streamBuffer = new WritableStreamBuffer();
  doc.pipe(streamBuffer);

  // Read the logo for the banner.
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // License text (exactly 2 lines with one \n).
  const licenseText = `The PDF may be used only for non-commercial purposes. They may not be used for any illegal or immoral purpose.\nPlease refrain from violating any intellectual property rights in or in connection with the images. Failure to comply with this print license agreement may expose you to civil and/or criminal liability`;

  // Add banner to the first page.
  addBanner(doc, logoBuffer, licenseText);

  // Create a 15px gap after the banner.
  doc.y += 15;
  let margin = doc.y;

  // Get page dimensions.
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Add banner to every new page.
  doc.on('pageAdded', () => {
    addBanner(doc, logoBuffer, licenseText);
    doc.y += 15; // 15px gap after banner
    margin = doc.y;
  });

  // Calculate layout slots based on the imagesPerPage option.
  let slots: Slot[] = [];
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
    case 12:
      slots = layoutTwelveImages(pageWidth, pageHeight, margin);
      break;
    case 16:
      slots = layoutSixteenImages(pageWidth, pageHeight, margin);
      break;
    case 20:
      slots = layoutTwentyImages(pageWidth, pageHeight, margin);
      break;
    default:
      throw new Error('Invalid imagesPerPage value.');
  }

  // For each group of images, create a new page (except the first) and position them.
  for (let i = 0; i < imageUrls.length; i += imagesPerPage) {
    if (i !== 0) {
      doc.addPage();
    }
    const currentUrls = imageUrls.slice(i, i + imagesPerPage);
    for (let j = 0; j < currentUrls.length; j++) {
      try {
        const response = await axios.get(currentUrls[j], { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const slot = slots[j];
        // Use the 'fit' option so that the image is scaled as large as possible
        // within the cell without changing its original aspect ratio.
        if ('fit' in slot) {
          doc.image(imageBuffer, slot.x, slot.y, { fit: slot.fit, align: 'center', valign: 'center' });
        } else {
          doc.image(imageBuffer, slot.x, slot.y, { width: slot.width, height: slot.height });
        }
      } catch (error) {
        console.error(`Failed to load image: ${currentUrls[j]}`, error);
      }
    }
  }

  // Finalize the PDF.
  doc.end();

  // Return a Promise that resolves with the PDF Buffer.
  return new Promise((resolve, reject) => {
    streamBuffer.on('finish', () => {
      const pdfBuffer = streamBuffer.getContents();
      if (pdfBuffer) {
        resolve(pdfBuffer);
      } else {
        reject(new Error('Could not retrieve PDF buffer'));
      }
    });
    streamBuffer.on('error', reject);
  });
}

export default generatePdfFromImages;
