import express from 'express';
import multer from 'multer';
import {getDeviceAssignments,generatePdf,downloadCsv } from './deviceAssignment.controller.js';

const router = express.Router();
const upload = multer();

router.get('/device-assignments', getDeviceAssignments);
router.post('/generate-pdf', upload.none(), generatePdf);
router.post("/download-csv", downloadCsv);

export default router;
