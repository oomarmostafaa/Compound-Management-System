const Joi = require('joi');

const createApartmentSchema = Joi.object({
  number: Joi.string().trim().required().messages({
    'any.required': 'Apartment number is required'
  }),
  floor: Joi.number().integer().required().messages({
    'any.required': 'Floor number is required'
  }),
  status: Joi.string().valid('OCCUPIED', 'EMPTY').default('EMPTY'),
  buildingId: Joi.string().required().messages({
    'any.required': 'Building ID is required'
  })
});

const updateApartmentSchema = Joi.object({
  number: Joi.string().trim().optional(),
  floor: Joi.number().integer().optional(),
  status: Joi.string().valid('OCCUPIED', 'EMPTY').optional(),
  buildingId: Joi.string().optional()
});

const assignResidentSchema = Joi.object({
  residentId: Joi.string().required().messages({
    'any.required': 'Resident ID is required'
  })
});

module.exports = {
  createApartmentSchema,
  updateApartmentSchema,
  assignResidentSchema
};
