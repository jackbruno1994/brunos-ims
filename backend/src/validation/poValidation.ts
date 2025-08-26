import Joi from 'joi';
import { POStatus } from '../models';

// Validation schemas for PO processing
export const poLineItemSchema = Joi.object({
  itemId: Joi.string().required(),
  itemName: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
  notes: Joi.string().optional()
});

export const createPOSchema = Joi.object({
  supplierId: Joi.string().required(),
  supplierName: Joi.string().required(),
  restaurantId: Joi.string().required(),
  lineItems: Joi.array().items(poLineItemSchema).min(1).required(),
  requestedDeliveryDate: Joi.date().optional(),
  notes: Joi.string().optional()
});

export const updatePOSchema = Joi.object({
  supplierId: Joi.string().optional(),
  supplierName: Joi.string().optional(),
  lineItems: Joi.array().items(poLineItemSchema).min(1).optional(),
  requestedDeliveryDate: Joi.date().optional(),
  notes: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(POStatus)).optional()
});

export const documentUploadSchema = Joi.object({
  fileName: Joi.string().required(),
  mimeType: Joi.string().required(),
  size: Joi.number().positive().required()
});