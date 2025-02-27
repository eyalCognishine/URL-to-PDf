import express, { Request, Response } from 'express';
import cors from 'cors';
import generatePdfFromImages from './runPdfGenerator';

const app = express();

// Allow Cross-Origin requests (useful when the front-end is on a different port)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// POST endpoint to generate a PDF
app.post('/generate-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    // Expecting { imageUrls: string[], layoutOption: number } from the client
    const { imageUrls, layoutOption } = req.body;

    // Basic validation checks
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      res.status(400).json({ error: 'No images provided' });
      return;
    }

    if (![1, 2, 4, 8, 12, 16, 20].includes(layoutOption)) {
      res.status(400).json({ error: 'Invalid layoutOption (choose 1,2,4,8,12,16,20)' });
      return;
    }    

    // Generate the PDF in memory
    const pdfBuffer = await generatePdfFromImages(imageUrls, layoutOption);

    // Send the PDF as a downloadable file to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
