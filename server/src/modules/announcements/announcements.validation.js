const Joi = require('joi');

const createAnnouncementSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Announcement title is required'
  }),
  content: Joi.string().trim().required().messages({
    'any.required': 'Announcement content is required'
  })
});

const updateAnnouncementSchema = Joi.object({
  title: Joi.string().trim().optional(),
  content: Joi.string().trim().optional()
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema
};
