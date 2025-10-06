import * as recurrenceService from './recurrencePattern.service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

export const getRecurrencePatterns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const {data,meta} = await recurrenceService.getAll(Number(page), Number(limit));
  res.json({ success: true, data ,meta });
});

export const createRecurrencePattern = asyncHandler(async (req, res) => {
  const created = await recurrenceService.create(req.body);
  res.status(201).json({ success: true, data: created });
});

export const updateRecurrencePattern = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await recurrenceService.update(Number(id), req.body);
  res.json({ success: true, data: updated });
});

export const toggleRecurrencePatternStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const toggled = await recurrenceService.toggleStatus(
    Number(id),
    req.body.isActive ?? true,
  );
  res.json({ success: true, data: toggled });
});

export const deleteRecurrencePattern = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await recurrenceService.deletePattern(
    Number(id)
  );
  res.json({ success: true, data: result });
});
