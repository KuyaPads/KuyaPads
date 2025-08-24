const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const authSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().trim().max(50).required(),
    lastName: Joi.string().trim().max(50).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

const userSchemas = {
  updateProfile: Joi.object({
    firstName: Joi.string().trim().max(50).optional(),
    lastName: Joi.string().trim().max(50).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.object({
      city: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional(),
    birthDate: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional()
  }),

  updateSettings: Joi.object({
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'friends', 'private').optional(),
      showOnlineStatus: Joi.boolean().optional(),
      allowFriendRequests: Joi.boolean().optional()
    }).optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      friendRequests: Joi.boolean().optional(),
      messages: Joi.boolean().optional()
    }).optional()
  })
};

const postSchemas = {
  createPost: Joi.object({
    content: Joi.object({
      text: Joi.string().max(5000).required(),
      images: Joi.array().items(
        Joi.object({
          url: Joi.string().required(),
          caption: Joi.string().optional()
        })
      ).optional(),
      videos: Joi.array().items(
        Joi.object({
          url: Joi.string().required(),
          caption: Joi.string().optional(),
          thumbnail: Joi.string().optional()
        })
      ).optional()
    }).required(),
    type: Joi.string().valid('text', 'image', 'video', 'link', 'poll').default('text'),
    privacy: Joi.string().valid('public', 'friends', 'private').default('public'),
    tags: Joi.array().items(Joi.string()).optional(),
    location: Joi.object({
      name: Joi.string().optional(),
      coordinates: Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional()
      }).optional()
    }).optional(),
    group: Joi.string().optional()
  }),

  updatePost: Joi.object({
    content: Joi.object({
      text: Joi.string().max(5000).optional(),
      images: Joi.array().items(
        Joi.object({
          url: Joi.string().required(),
          caption: Joi.string().optional()
        })
      ).optional(),
      videos: Joi.array().items(
        Joi.object({
          url: Joi.string().required(),
          caption: Joi.string().optional(),
          thumbnail: Joi.string().optional()
        })
      ).optional()
    }).optional(),
    privacy: Joi.string().valid('public', 'friends', 'private').optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  addComment: Joi.object({
    content: Joi.string().max(1000).required(),
    parentComment: Joi.string().optional()
  })
};

const groupSchemas = {
  createGroup: Joi.object({
    name: Joi.string().trim().max(100).required(),
    description: Joi.string().max(1000).optional(),
    privacy: Joi.string().valid('public', 'private', 'secret').default('public'),
    category: Joi.string().valid('general', 'business', 'education', 'entertainment', 'sports', 'technology', 'travel', 'food', 'arts', 'politics', 'other').default('general'),
    tags: Joi.array().items(Joi.string()).optional(),
    rules: Joi.array().items(
      Joi.object({
        title: Joi.string().max(100).required(),
        description: Joi.string().max(500).required()
      })
    ).optional()
  }),

  updateGroup: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    description: Joi.string().max(1000).optional(),
    privacy: Joi.string().valid('public', 'private', 'secret').optional(),
    category: Joi.string().valid('general', 'business', 'education', 'entertainment', 'sports', 'technology', 'travel', 'food', 'arts', 'politics', 'other').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    postingPermission: Joi.string().valid('all', 'admins_only', 'admins_and_moderators').optional(),
    rules: Joi.array().items(
      Joi.object({
        title: Joi.string().max(100).required(),
        description: Joi.string().max(500).required()
      })
    ).optional()
  }),

  joinRequest: Joi.object({
    message: Joi.string().max(500).optional()
  })
};

const messageSchemas = {
  sendMessage: Joi.object({
    recipient: Joi.string().optional(),
    group: Joi.string().optional(),
    content: Joi.object({
      text: Joi.string().max(2000).optional(),
      images: Joi.array().items(
        Joi.object({
          url: Joi.string().required(),
          caption: Joi.string().optional()
        })
      ).optional(),
      files: Joi.array().items(
        Joi.object({
          url: Joi.string().required(),
          name: Joi.string().required(),
          size: Joi.number().required(),
          type: Joi.string().required()
        })
      ).optional()
    }).required(),
    type: Joi.string().valid('text', 'image', 'file', 'sticker', 'gif').default('text'),
    replyTo: Joi.string().optional()
  }).xor('recipient', 'group'),

  updateMessage: Joi.object({
    content: Joi.object({
      text: Joi.string().max(2000).required()
    }).required()
  })
};

module.exports = {
  validateRequest,
  authSchemas,
  userSchemas,
  postSchemas,
  groupSchemas,
  messageSchemas
};