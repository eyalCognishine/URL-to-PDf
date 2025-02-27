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

async function generatePdfFromImages(
  imageUrls: string[],
  imagesPerPage: 1 | 2 | 4 | 8
): Promise<Buffer> {
  // 1. הגדרת פורמט העמוד
  let doc;
  if (imagesPerPage === 2 || imagesPerPage === 8) {
    doc = new PDFDocument(); // פורטרט
  } else {
    doc = new PDFDocument({ layout: 'landscape' }); // לנדסקייפ
  }

  // 2. הגדרת סטרים בזיכרון במקום קובץ
  const streamBuffer = new WritableStreamBuffer();
  doc.pipe(streamBuffer);

  // 3. קריאת הלוגו לטובת הבאנר
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // 4. טקסט הרישיון בשתי שורות בדיוק
  const licenseText = `The PDF may be used only for non-commercial purposes. They may not be used for any illegal or immoral purpose.
Please refrain from violating any intellectual property rights in or in connection with the images. Failure to comply with this print license agreement may expose you to civil and/or criminal liability`;

  // 5. הוספת באנר לעמוד הראשון
  addBanner(doc, logoBuffer, licenseText);

  // 6. נזיז את doc.y בעוד 15px כדי ליצור רווח בין הבאנר לתמונות
  doc.y += 15;

  // נגדיר margin דינמי לפי הנקודה שאליה הגענו
  let margin = doc.y;

  // נשמור את ממדי העמוד
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // 7. פונקציה שמוסיפה באנר בכל פעם שנוסף עמוד חדש
  doc.on('pageAdded', () => {
    addBanner(doc, logoBuffer, licenseText);
    doc.y += 15;           // שוב 15px רווח אחרי הבאנר
    margin = doc.y;        // עדכן את ה-margin
  });

  // 8. בהתאם לכמות התמונות בעמוד, נקבל את מערך הסלוטים (מיקומים)
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

  // 9. עבור כל קבוצת תמונות, נייצר עמוד (פרט לראשון שכבר קיים) ונמקם אותן
  for (let i = 0; i < imageUrls.length; i += imagesPerPage) {
    // בעמוד הראשון כבר נוספו באנר ו-margin, לכן רק בעמודים הבאים:
    if (i !== 0) {
      doc.addPage();
      // אחרי הוספת עמוד חדש, יופעל pageAdded => יתווסף באנר אוטומטית
      // ויתעדכן margin
      // אבל שים לב שהלייאאוט (slots) מחושב רק פעם אחת. אם תרצה לחשב אותו מחדש בכל עמוד - צריך לקרוא שוב לפונקציות הלייאאוט.
    }

    const currentUrls = imageUrls.slice(i, i + imagesPerPage);
    for (let j = 0; j < currentUrls.length; j++) {
      try {
        const response = await axios.get(currentUrls[j], { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        // המיקומים מחושבים לפי slots[j]
        const { x, y, width, height } = slots[j];
        doc.image(imageBuffer, x, y, { width, height });
      } catch (error) {
        console.error(`Failed to load image: ${currentUrls[j]}`, error);
      }
    }
  }

  // 10. סיום יצירת ה-PDF
  doc.end();

  // 11. החזרת ה-Buffer של ה-PDF
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
