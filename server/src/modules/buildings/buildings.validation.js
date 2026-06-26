const Joi = require('joi');

const createBuildingSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Building name is required'
  }),
  number: Joi.string().trim().required().messages({
    'any.required': 'Building number is required'
  })
});

const updateBuildingSchema = Joi.object({
  name: Joi.string().trim().optional(),
  number: Joi.string().trim().optional()
});

module.exports = {
  createBuildingSchema,
  updateBuildingSchema
};
