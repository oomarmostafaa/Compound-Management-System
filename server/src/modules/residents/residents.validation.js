const Joi = require('joi');

const createResidentSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  phone: Joi.string().trim().required().messages({
    'any.required': 'Phone number is required'
  }),
  nationalId: Joi.string().trim().required().messages({
    'any.required': 'National ID is required'
  }),
  apartmentId: Joi.string().optional()
});

const updateResidentSchema = Joi.object({
  phone: Joi.string().trim().optional(),
  nationalId: Joi.string().trim().optional(),
  apartmentId: Joi.string().optional().allow(null)
});

module.exports = {
  createResidentSchema,
  updateResidentSchema
};
