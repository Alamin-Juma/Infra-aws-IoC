import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';
import { vendorEvaluationSchema } from './vendorEvaluationValidation.js'; 
import { ValidationError } from 'yup'; 

const prisma = new PrismaClient();

const fetchVendorEvaluations = async () => {
  try {
    return await prisma.vendorEvaluation.findMany({
      include: {
        vendor: true,
        evaluator: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    throw new AppError(500, `Error fetching vendor evaluations: ${error.message}`);
  }
};

const fetchVendorEvaluationById = async (id) => {
  try {
    return await prisma.vendorEvaluation.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        vendor: true,
        evaluator: true,
      },
    });
  } catch (error) {
    throw new AppError(500, `Error fetching vendor evaluation by ID: ${error.message}`);
  }
};

const createVendorEvaluation = async (data) => {
  try {    
    await vendorEvaluationSchema.validate(data, { abortEarly: false });    
    return await prisma.vendorEvaluation.create({
      data: {
        vendorId: data.vendorId,
        evaluatorId: data.evaluatorId,
        deliveryTimeliness: data.deliveryTimeliness,
        productQuality: data.productQuality,
        pricingCompetitiveness: data.pricingCompetitiveness,
        customerService: data.customerService,
        complianceAndSecurity: data.complianceAndSecurity,
        innovation: data.innovation,
        comments: data.comments || null,
      },
    });
  } catch (error) {    
    if (error instanceof ValidationError) {
      throw new AppError(400, `Validation error: ${error.errors.join(', ')}`);
    }
    throw new AppError(500, `Error creating vendor evaluation: ${error.message}`);
  }
};

export default {
  fetchVendorEvaluations,
  fetchVendorEvaluationById,
  createVendorEvaluation,
};



