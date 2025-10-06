import quotationService from './quotation.service.js';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../constants/table.constants.js';

export const getAllQuotations = async (req, res) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    keyword,
    status,
  } = req.query;

  try {
    const [quotations, total] = await quotationService.getAllQuotations(
      Number(page),
      Number(limit),
      keyword,
      status,
    );

    res.json({
      message: 'Quotations fetched successfully',
      quotations,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching the quotations.',
    });
  }
};

export const getQuotationById = async (req, res) => {
  const { id } = req.params;

  try {
    const quotation = await quotationService.getQuotationById(id);

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.status(200).json({
      message: 'Quotation fetched successfully',
      quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching the quotation.',
    });
  }
};

export const updateQuotationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, lastUpdatedById, rejectionReason } = req.body;

  try {
    if (!status || !lastUpdatedById) {
      return res.status(400).json({
        message: 'Both "status" and "lastUpdatedById" are required.',
      });
    }

    const { updatedQuotation, purchaseOrder } =
      await quotationService.updateQuotationStatus(
        id,
        status,
        lastUpdatedById,
        rejectionReason,
      );

    const response = {
      message: 'Quotation status updated successfully.',
      quotation: updatedQuotation,
    };

    if (purchaseOrder) {
      response.purchaseOrder = purchaseOrder;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message:
        'An unexpected error occurred while updating the purchase orders.',
    });
  }
};
