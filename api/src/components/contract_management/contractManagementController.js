import contractService from './contractServiceManagement.js';
import path from 'path';
import { existsSync, createReadStream, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { archiveContractService } from './contractServiceManagement.js';



export const uploadContract = async (req, res) => {
  const { uploadedBy, startDate, endDate } = req.body;
  const vendorId = parseInt(req.params.vendorId, 10); 
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  if (isNaN(vendorId)) {
    return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }


  try {
    const contractData = {
      vendorId,
      uploadedBy,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      fileName: req.file.originalname,
      filePath: req.file.path, 
    };

   

    const contract = await contractService.createContract(contractData);
    res.status(201).json({ success: true, contract });
  } catch (error) {
    console.error('[UPLOAD] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getContracts = async (req, res) => {
  try {
    const contracts = await contractService.getContracts(req.params.vendorId);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContractsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid contract ID' });
    }

    const contract = await contractService.getContractById(id);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.status(200).json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const downloadContract = async (req, res) => {
  try {
    const { id: contractId } = req.params;

    const contract = await contractService.getContractById(contractId);

    if (!contract || !contract.filePath) {
      console.warn('[DOWNLOAD] Contract or file path missing.');
      return res.status(404).json({ message: 'Contract not found.' });
    }

    const filePath = path.resolve(contract.filePath);

    if (!existsSync(filePath)) {
      console.error('[DOWNLOAD] File does not exist at path:', filePath);
      return res.status(404).json({ message: 'File not found on server.' });
    }

    const stats = statSync(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${contract.fileName || 'contract'}.pdf"`
    );

    const fileStream = createReadStream(filePath);
    fileStream.on('error', (streamErr) => {
      console.error('[DOWNLOAD] Stream error:', streamErr);
      res.status(500).json({ message: 'Error streaming PDF.' });
    });

    fileStream.pipe(res);
  } catch (err) {
    console.error('[DOWNLOAD] Unexpected error:', err);
    res.status(500).json({ message: 'Error downloading contract PDF.' });
  }
};

export const archiveContract = async (req, res) => {
  const { id } = req.params;


  try {

    await contractService.archiveContractService(id);

    return res.status(204).send('Deleted successfully');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to archive contract' });
  }
};

export const bulkArchiveContracts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No valid contract IDs provided.' });
    }

    for (const id of ids) {
      try {
        await contractIdParamSchema.validate({ id });
      } catch (validationError) {
        return res.status(400).json({ error: `Invalid ID: ${id}` });
      }
    }

    const result = await Promise.all(ids.map((id) => archiveContractService(id)));

    return res.status(200).json({
      message: 'Contracts archived successfully.',
      archivedCount: result.length,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to archive contracts. Please try again later.',
      error: error.message,
    });
  }
};
