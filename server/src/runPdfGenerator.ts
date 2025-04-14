// runPdfGenerator.ts

import PDFDocument from 'pdfkit';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { WritableStreamBuffer } from 'stream-buffers';
import sharp from 'sharp';

import { addBanner } from './banner';
import { layoutOneImage } from './layouts/layoutOneImage';
import { layoutTwoImages } from './layouts/layoutTwoImages';
import { layoutFourImages } from './layouts/layoutFourImages';
import { layoutEightImages } from './layouts/layoutEightImages';
import { layoutTwelveImages } from './layouts/layoutTwelveImages';
import { layoutSixteenImages } from './layouts/layoutSixteenImages';
import { layoutTwentyImages } from './layouts/layoutTwentyImages';

// Define a slot type
type Slot =
  | { x: number; y: number; width: number; height: number }
  | { x: number; y: number; fit: [number, number] };

/**
 * Generates a PDF with three content types:
 *  - only images
 *  - only text
 *  - imagesAndText (image with text below it)
 *
 * 1) Fixed font size (14) for all text.
 * 2) Images keep their original ratio and only adjust to fit the slot.
 * 3) If the text is too long, it will be clipped (not shown beyond the given height).
 */
export default async function generatePdf(
  contentType: 'images' | 'text' | 'imagesAndText',
  imageUrls: string[],
  words: string[],
  imagesPerPage: 1 | 2 | 4 | 8 | 12 | 16 | 20
): Promise<Buffer> {
  // Set page orientation
  let doc;
  if ([2, 8].includes(imagesPerPage)) {
    doc = new PDFDocument(); // portrait
  } else {
    doc = new PDFDocument({ layout: 'landscape' });
  }

  const streamBuffer = new WritableStreamBuffer();
  doc.pipe(streamBuffer);

  // Add banner
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const licenseText = `The PDF may be used only for non-commercial purposes. They may not be used for any illegal or immoral purpose.
Please refrain from violating any intellectual property rights in or in connection with the images. Failure to comply with this print license agreement may expose you to civil and/or criminal liability`;

  addBanner(doc, logoBuffer, licenseText);

  // Add small margin after banner
  doc.y += 15;
  let margin = doc.y;

  // Add banner to every new page
  doc.on('pageAdded', () => {
    addBanner(doc, logoBuffer, licenseText);
    doc.y += 15;
    margin = doc.y;
  });

  // Choose layout based on imagesPerPage
  let slots: Slot[] = [];
  switch (imagesPerPage) {
    case 1:
      slots = layoutOneImage(doc.page.width, doc.page.height, margin);
      break;
    case 2:
      slots = layoutTwoImages(doc.page.width, doc.page.height, margin);
      break;
    case 4:
      slots = layoutFourImages(doc.page.width, doc.page.height, margin);
      break;
    case 8:
      slots = layoutEightImages(doc.page.width, doc.page.height, margin);
      break;
    case 12:
      slots = layoutTwelveImages(doc.page.width, doc.page.height, margin);
      break;
    case 16:
      slots = layoutSixteenImages(doc.page.width, doc.page.height, margin);
      break;
    case 20:
      slots = layoutTwentyImages(doc.page.width, doc.page.height, margin);
      break;
    default:
      throw new Error('Invalid imagesPerPage value.');
  }

  // Total number of content items
  let totalItems = 0;
  if (contentType === 'images') {
    totalItems = imageUrls.length;
  } else if (contentType === 'text') {
    totalItems = words.length;
  } else {
    totalItems = Math.min(imageUrls.length, words.length);
  }

  // Set global font settings
  const GLOBAL_FONT_SIZE = 14;
  doc.font('Helvetica').fontSize(GLOBAL_FONT_SIZE).fillColor('black');

  // Loop through pages
  for (let i = 0; i < totalItems; i += imagesPerPage) {
    if (i !== 0) {
      doc.addPage();
    }

    const currentCount = Math.min(imagesPerPage, totalItems - i);

    for (let j = 0; j < currentCount; j++) {
      const slot = slots[j];
      const itemIndex = i + j;

      if (contentType === 'images') {
        await placeImageInSlot(doc, imageUrls[itemIndex], slot);
      } else if (contentType === 'text') {
        placeTextInSlot(doc, words[itemIndex], slot, GLOBAL_FONT_SIZE);
      } else {
        await placeImageAndTextInSlot(doc, imageUrls[itemIndex], words[itemIndex], slot, GLOBAL_FONT_SIZE);
      }
    }
  }

  doc.end();
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

/** placeImageInSlot:
 *  Fit the image to the slot (one-time aspect-ratio fitting),
 *  then center it in the box. Text underneath is not affected.
 */
async function placeImageInSlot(doc: PDFKit.PDFDocument, imageUrl: string, slot: Slot) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    const metadata = await sharp(imageBuffer).metadata();
    const originalWidth = metadata.width || 1;
    const originalHeight = metadata.height || 1;

    const { boxWidth, boxHeight } = getSlotDimensions(slot);
    const { finalWidth, finalHeight } = computeFittedImageSize(
      originalWidth,
      originalHeight,
      boxWidth,
      boxHeight
    );

    const offsetX = slot.x + (boxWidth - finalWidth) / 2;
    const offsetY = slot.y + (boxHeight - finalHeight) / 2;

    doc.image(imageBuffer, offsetX, offsetY, {
      width: finalWidth,
      height: finalHeight
    });
  } catch (error) {
    console.error(`Failed to load or process image: ${imageUrl}`, error);
  }
}

/** placeTextInSlot:
 *  Places plain text inside a slot with uniform font size;
 *  if the text is too long it will be clipped.
 */
function placeTextInSlot(
  doc: PDFKit.PDFDocument,
  text: string,
  slot: Slot,
  fontSize: number
) {
  doc.font('Helvetica').fontSize(fontSize).fillColor('black');

  const { boxWidth, boxHeight } = getSlotDimensions(slot);
  const offsetX = slot.x + 5;
  const offsetY = slot.y + 5;
  const usableWidth = boxWidth - 10;
  const usableHeight = boxHeight - 10;

  doc.text(text, offsetX, offsetY, {
    width: usableWidth,
    height: usableHeight,
    align: 'center'
  });
}

/** placeImageAndTextInSlot:
 *  Places the image centered in the slot, then adds text below it.
 *  If there's not enough room, the text is clipped.
 */
async function placeImageAndTextInSlot(
  doc: PDFKit.PDFDocument,
  imageUrl: string,
  text: string,
  slot: Slot,
  fontSize: number
) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    const metadata = await sharp(imageBuffer).metadata();
    const originalWidth = metadata.width || 1;
    const originalHeight = metadata.height || 1;

    const { boxWidth, boxHeight } = getSlotDimensions(slot);
    const { finalWidth, finalHeight } = computeFittedImageSize(
      originalWidth,
      originalHeight,
      boxWidth,
      boxHeight
    );

    const offsetX = slot.x + (boxWidth - finalWidth) / 2;
    const offsetY = slot.y + (boxHeight - finalHeight) / 2;
    doc.image(imageBuffer, offsetX, offsetY, {
      width: finalWidth,
      height: finalHeight
    });

    doc.fontSize(fontSize).font('Helvetica').fillColor('black');

    const gapUnderImage = 5;
    const bottomOfImage = offsetY + finalHeight;
    const textTop = bottomOfImage + gapUnderImage;

    const usableWidth = boxWidth - 10;
    const availableHeight = slot.y + boxHeight - textTop - 5;

    doc.text(text, slot.x + 5, textTop, {
      width: usableWidth,
      height: availableHeight,
      align: 'center'
    });
  } catch (error) {
    console.error(`Failed to load or process image: ${imageUrl}`, error);
  }
}

/** getSlotDimensions:
 *  Extracts {boxWidth, boxHeight} from slot definition.
 */
function getSlotDimensions(slot: Slot): { boxWidth: number; boxHeight: number } {
  if ('fit' in slot) {
    const [w, h] = slot.fit;
    return { boxWidth: w, boxHeight: h };
  } else {
    return { boxWidth: slot.width, boxHeight: slot.height };
  }
}

/** computeFittedImageSize:
 *  Fits the image once to the bounding box, maintaining aspect ratio.
 */
function computeFittedImageSize(
  originalWidth: number,
  originalHeight: number,
  boxWidth: number,
  boxHeight: number
): { finalWidth: number; finalHeight: number } {
  const aspectRatio = originalWidth / originalHeight;
  let finalWidth = boxWidth;
  let finalHeight = boxHeight;

  if (aspectRatio > 1) {
    finalHeight = finalWidth / aspectRatio;
    if (finalHeight > boxHeight) {
      finalHeight = boxHeight;
      finalWidth = finalHeight * aspectRatio;
    }
  } else {
    finalWidth = finalHeight * aspectRatio;
    if (finalWidth > boxWidth) {
      finalWidth = boxWidth;
      finalHeight = finalWidth / aspectRatio;
    }
  }

  return { finalWidth, finalHeight };
}
