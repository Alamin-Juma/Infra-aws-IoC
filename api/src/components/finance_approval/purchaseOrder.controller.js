import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../constants/table.constants.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import purchaseOrderService from './purchaseOrder.service.js';

export const getAllPurchaseOrders = async (req, res) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    keyword,
    status,
  } = req.query;

  try {
    const [purchaseOrders, total] =
      await purchaseOrderService.getAllPurchaseOrders(
        Number(page),
        Number(limit),
        keyword,
        status,
      );

    res.json({
      message: 'Purchase orders fetched successfully',
      purchaseOrders,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message:
        'An unexpected error occurred while fetching the purchase orders.',
    });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(id);

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.status(200).json({
      message: 'Purchase order fetched successfully',
      purchaseOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message:
        'An unexpected error occurred while fetching the purchase order.',
    });
  }
};

export const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, lastUpdatedById } = req.body;
  const updatedPurchaseOrder =
    await purchaseOrderService.updatePurchaseOrderStatus(
      id,
      status,
      lastUpdatedById,
    );

  if (!updatedPurchaseOrder) {
    return res.status(404).json({ error: 'Purchase order not found' });
  }

  res.status(200).json({
    message: 'Purchase order status updated successfully',
    purchaseOrder: updatedPurchaseOrder,
  });
});
