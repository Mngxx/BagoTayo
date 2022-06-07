const Joi = require('joi');
module.exports.contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    pnum: Joi.string().required(),
    msg: Joi.string().required(),
});