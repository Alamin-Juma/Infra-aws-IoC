import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadContract, getContracts, downloadContract, getContractsById, archiveContract } from './contractManagementController.js';
import { validateId } from '../procurement_requests/procurementRequests.validations.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/contracts', 
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  },
});


const logFileInfo = (req, res, next) => {
 
  next();
};


const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum allowed size is 10MB.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
  }
  next(err);
};


router.post('/:vendorId/contracts/upload', upload.single('contract'), logFileInfo, uploadContract);

router.use(multerErrorHandler);


router.get('/:vendorId/contracts', getContracts);
router.get('/:vendorId/contracts/:id', getContractsById);
router.get('/:vendorId/contracts/download/:id', downloadContract);
router.delete('/:vendorId/contracts/archive/:id',validateId, archiveContract);

export default router;
