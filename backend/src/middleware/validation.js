const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateUserSchema = Joi.object({
  first_name: Joi.string().min(1).max(50),
  last_name: Joi.string().min(1).max(50),
  avatar_url: Joi.string().uri()
});

const createPadSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().default(''),
  is_public: Joi.boolean().default(false),
  password: Joi.string().min(6).optional()
});

const updatePadSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  content: Joi.string(),
  is_public: Joi.boolean(),
  password: Joi.string().min(6).optional().allow(null, '')
});

const addCollaboratorSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  permission: Joi.string().valid('read', 'write', 'admin').default('write')
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  createPadSchema,
  updatePadSchema,
  addCollaboratorSchema
};