const Joi = require('joi');

const uploadDocumentSchema = Joi.object({
  type: Joi.string().valid('NATIONAL_ID', 'OWNERSHIP_CONTRACT', 'RENTAL_CONTRACT').required().messages({
    'any.only': 'Document type must be NATIONAL_ID, OWNERSHIP_CONTRACT, or RENTAL_CONTRACT',
    'any.required': 'Document type is required'
  })
});

module.exports = {
  uploadDocumentSchema
};
