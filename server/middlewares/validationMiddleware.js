const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

// Validation schemas
const applicationSchemas = {
  createApplication: Joi.object({
    institutionId: Joi.string().required(),
    facultyId: Joi.string().required(),
    courseId: Joi.string().required(),
    documents: Joi.array().items(Joi.string()).optional()
  }),

  updateApplicationStatus: Joi.object({
    status: Joi.string().valid('pending', 'under-review', 'admitted', 'rejected', 'waiting').required(),
    notes: Joi.string().optional()
  })
};

module.exports = { validateRequest, applicationSchemas };