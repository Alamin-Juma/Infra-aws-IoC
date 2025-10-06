import { PrismaClient, VendorStatus } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

export const createContract = async ({
  vendorId,
  uploadedBy,
  startDate,
  endDate,
  fileName,
  filePath,
}) => {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.ACTIVE },
  });

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
    throw new Error('Start date or end date is invalid');
  }

  if (!uploadedBy) {
    throw new Error('uploadedBy is required');
  }

  return prisma.contract.create({
    data: {
      vendorId,
      uploadedBy,
      uploadedById: Number(uploadedBy),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      fileName,
      filePath,
    },
  });
};

export const getContractById = async (contractId) => {
  if (!contractId || isNaN(contractId)) {
    throw new Error('Invalid contract ID');
  }

  const id = parseInt(contractId, 10);

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      contractUploadedBy: true,
    },
  });

  return contract;
};

export const getContracts = (vendorId) => {
  return prisma.contract.findMany({
    where: { vendorId: parseInt(vendorId) },
    include: {
      vendor: true,
      contractUploadedBy: true,
    },
  });
};

const getDownloadPath = async (id) => {
  const contract = await prisma.contract.findUnique({
    where: { id: parseInt(id) },
  });

  if (!contract) throw new Error('Contract not found');

  return path.resolve(contract.filePath);
};

export const archiveContractService = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('Invalid contract ID');
    }
    const contract = await prisma.contract.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date(), status: 'INACTIVE' } 
    });
    return { message: 'Contract archived successfully', contract };
} catch (error) {

    throw new Error(`Failed to archive contract: ${error.message}`);
}
};

// Bulk archive contracts
export const archiveContractsBulkService = async (ids) => {

  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No valid vendor IDs provided." });
    }

    for (const id of ids) {
      try {
        await vendorIdParamSchema.validate({ id });
      } catch (validationError) {
        return res.status(400).json({ error: `Invalid ID: ${id}` });
      }
    }

    const archivedCount = await archiveVendorsByIds(ids);

    res.status(200).json({
      message: `${archivedCount} vendor(s) archived successfully.`,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error while archiving vendors." });
  }
};



export default {
  createContract,
  getContracts,
  getDownloadPath,
  getContractById,
  archiveContractService
  
};
