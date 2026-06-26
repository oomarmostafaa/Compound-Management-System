const Joi = require('joi');

const createStaffSchema = Joi.object({
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
  jobTitle: Joi.string().trim().required().messages({
    'any.required': 'Job title is required'
  })
});

const updateStaffSchema = Joi.object({
  phone: Joi.string().trim().optional(),
  jobTitle: Joi.string().trim().optional()
});

module.exports = {
  createStaffSchema,
  updateStaffSchema
};
