import express from 'express';
import multer from 'multer';
import ReportsController from './manufactureControllerReport.js';

const router = express.Router();
const upload = multer();


router.get('/manufacturer-inventory', ReportsController.getManufacturerInventory);
router.post('/generate-pdf', upload.none(), ReportsController.generatePdf);
router.post("/download-csv", ReportsController.downloadCsv);

export default router;
