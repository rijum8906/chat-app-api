const Joi = require('joi');

// Signin Schema
module.exports.signinSchema = Joi.object({
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address'
  }),
  username: Joi.string().alphanum().min(3).max(15).messages({
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least {#limit} characters long',
    'string.max': 'Username cannot exceed {#limit} characters'
  }),
  password: Joi.string().min(8).max(40).required().messages({
    'string.alphanum': 'Password must only contain alphanumeric characters',
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password cannot exceed {#limit} characters',
    'any.required': 'Password is required'
  })
}).xor('email', 'username'); // Ensures either email or username is provided, but not both

// Signup Schema
module.exports.signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(20).required().messages({
    'string.min': 'First name must be at least {#limit} characters long',
    'string.max': 'First name cannot exceed {#limit} characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(20).required().messages({
    'string.min': 'Last name must be at least {#limit} characters long',
    'string.max': 'Last name cannot exceed {#limit} characters',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  username: Joi.string().alphanum().min(3).max(15).required().messages({
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least {#limit} characters long',
    'string.max': 'Username cannot exceed {#limit} characters',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(8).max(40).required().messages({
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password cannot exceed {#limit} characters',
    'any.required': 'Password is required'
  })
});

// Device Schema
module.exports.deviceSchema = Joi.object({
  ipAddress: Joi.string().required().messages({
    'string.required': 'ip address is not given.'
  }),
  userAgent: Joi.string().required().messages({
    'string.required': 'user agent is not given.'
  }),
  deviceId: Joi.string().required().messages({
    'string.required': 'device ID is not given.'
  }),
  os: Joi.string().optional(),
  browser: Joi.string().optional(),
  lastAccessed: Joi.date().default(Date.now)
});

// Account Connect
module.exports.accountLinkReqSchema = Joi.object({
  linkWith: Joi.string().valid('google', 'github').required(),
  token: Joi.string().required()
});

// Google Auth Schema
module.exports.googleAuthSchema = Joi.object({
  firstName: Joi.string().min(2).max(20).required(),
  lastName: Joi.string().min(2).max(20).required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(15).required(),
  avatarURL: Joi.string().required(),
  sub: Joi.required()
});

//
