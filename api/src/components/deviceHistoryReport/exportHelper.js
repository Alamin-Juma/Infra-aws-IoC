import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    csv += headers.map(header => `"${row[header]}"`).join(',') + '\n';
  });
  
  return csv;
};

export const generatePDF = async (req, res) => {
    try {
      const { data, options } = req.body;
  
      if (!data) {
        return res.status(400).json({ error: 'Data is required' });
      }
  
      const pdfBuffer = await assignmentService.generatePdf(data, {
        logo: options?.logo || 'https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png',
        themeColor: options?.themeColor || '#77B634',
        title: options?.title || 'Custom Report',
        table: options?.format === 'table',
        landscape: options?.landscape,
        headers: options?.headers,
        footer: options?.footer,
        size: options?.size
      });
  
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${options?.filename || 'report'}.pdf`,
        'Content-Length': pdfBuffer.length
      });
  
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  };


  export const downloadCsv = async (req, res) => {
    try {
        await assignmentService.generateCsv(req.body, res);
    } catch (error) {
        res.status(500).json({ message: "Error generating CSV", error });
    }
};

export default {
    generateCSV,
    generatePDF,
}

