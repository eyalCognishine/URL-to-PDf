import PDFDocument from 'pdfkit';

export function addBanner(
  doc: any,
  logoBuffer: Buffer,
  licenseText: string
): void {
  // 1. הגדרת מיקום הלוגו
  const pageWidth = doc.page.width;
  const topMargin = 5;         // 5px מהטופ
  const gapBetweenLogoAndText = 5;  // 5px בין הלוגו לטקסט

  // הגדר מימדי לוגו (התאם לפי הצורך)
  const logoWidth = 70;
  const logoHeight = 10;

  // מרכז אופקית את הלוגו
  const logoX = (pageWidth - logoWidth) / 2;
  const logoY = topMargin;

  // ציור הלוגו
  doc.image(logoBuffer, logoX, logoY, { width: logoWidth, height: logoHeight });

  // 2. הוספת הטקסט, 5px מתחת ללוגו
  const textX = 50;                       // אפשר לתת שוליים משמאל
  const textY = logoY + logoHeight + gapBetweenLogoAndText;
  const textWidth = pageWidth - textX * 2; // כך הטקסט יהיה "מוקטן" ב-50px מכל צד

  // נניח שהטקסט מגיע בדיוק בשתי שורות (שורה אחת + \n + שורה שניה).
  // אם הוא ארוך מדי, PDFKit יגלגל אותו לעוד שורות. כדי להבטיח *בדיוק* 2 שורות, יש לוודא ידנית שהטקסט קצר מספיק.
  doc.font('Helvetica')
     .fontSize(5)
     .fillColor('#808080')
     .text(licenseText, textX, textY, {
       width: textWidth,
       align: 'center'
     });

  // בסיום הוספת הטקסט, doc.y נמצא בסוף הטקסט.
  // לא נקנפג כאן מרווח נוסף – נעשה זאת בקובץ הראשי כדי לשלוט כמה רווח נרצה לפני התמונות.
}
