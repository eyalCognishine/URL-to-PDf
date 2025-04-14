// index.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import generatePdf from './runPdfGenerator';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { contentType, imageUrls, words, layoutOption } = req.body;

    if (!['images', 'text', 'imagesAndText'].includes(contentType)) {
      res.status(400).json({ error: 'Invalid contentType' });
      return;
    }

    switch (contentType) {
      case 'images':
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
          res.status(400).json({ error: 'No images provided' });
          return;
        }
        break;
      case 'text':
        if (!Array.isArray(words) || words.length === 0) {
          res.status(400).json({ error: 'No text items provided' });
          return;
        }
        break;
      case 'imagesAndText':
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
          res.status(400).json({ error: 'No images provided for imagesAndText' });
          return;
        }
        if (!Array.isArray(words) || words.length === 0) {
          res.status(400).json({ error: 'No text items provided for imagesAndText' });
          return;
        }
        break;
    }

    if (![1, 2, 4, 8, 12, 16, 20].includes(layoutOption)) {
      res.status(400).json({ error: 'Invalid layoutOption (choose 1,2,4,8,12,16,20)' });
      return;
    }

    const pdfBuffer = await generatePdf(contentType, imageUrls, words, layoutOption);

    // שולחים את ה־PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer);
    return; // לא מחזירים את אובייקט ה־Response (מחזירים void)
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
