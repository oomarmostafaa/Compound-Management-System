const Joi = require('joi');

const createVisitorSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Visitor name is required'
  }),
  phone: Joi.string().trim().required().messages({
    'any.required': 'Visitor phone number is required'
  }),
  visitDate: Joi.date().iso().required().messages({
    'any.required': 'Visit date is required'
  })
});

const updateVisitorStatusSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED').required().messages({
    'any.only': 'Status must be APPROVED or REJECTED',
    'any.required': 'Status is required'
  })
});

module.exports = {
  createVisitorSchema,
  updateVisitorStatusSchema
};
