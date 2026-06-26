const Joi = require('joi');

const createRequestSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required'
  }),
  description: Joi.string().trim().required().messages({
    'any.required': 'Description is required'
  }),
  type: Joi.string().valid('COMPLAINT', 'MAINTENANCE').required().messages({
    'any.only': 'Type must be COMPLAINT or MAINTENANCE',
    'any.required': 'Type is required'
  })
});

const assignStaffSchema = Joi.object({
  assignedStaffId: Joi.string().required().messages({
    'any.required': 'Staff ID is required'
  })
});

const changeStatusSchema = Joi.object({
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED').required().messages({
    'any.only': 'Status must be OPEN, IN_PROGRESS, COMPLETED, or CLOSED',
    'any.required': 'Status is required'
  })
});

module.exports = {
  createRequestSchema,
  assignStaffSchema,
  changeStatusSchema
};
