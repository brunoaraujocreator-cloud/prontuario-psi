import express from 'express';
import puppeteer from 'puppeteer';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', async (req, res) => {
  let browser = null;
  
  try {
    const { html, options } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdfOptions = {
      format: options?.format || 'A4',
      margin: {
        top: options?.marginTop || '20mm',
        right: options?.marginRight || '20mm',
        bottom: options?.marginBottom || '20mm',
        left: options?.marginLeft || '20mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    };

    const pdf = await page.pdf(pdfOptions);

    // Set response headers
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="relatorio.pdf"');
    
    // Send PDF
    res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF: ' + error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export default router;



