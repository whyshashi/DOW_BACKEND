const Joi = require('joi');

const newUserValidation=Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(6).max(50).required()
});
const userValidationJoiSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).trim().required(),
    lastName: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(6).max(50).required(),
    phoneNumber: Joi.string().trim().pattern(/^[0-9]+$/).min(10).max(15).allow(''), // Allow empty but must be numeric
    company: Joi.string().trim().default('DOW'),
    imageUrl: Joi.string().uri().allow(''), 
    designation : Joi.string()
});

const categoryValidationSchema=Joi.object({
    names:Joi.array().items(Joi.string().trim()).min(1).required(),
});

const docValidationSchema=Joi.object({
    title:Joi.string().min(2).max(50).trim().required(),
    documentNo:Joi.string().min(2).max(50).trim().required(),
    category:Joi.string().hex().length(24).required(),
    body:Joi.string().min(2).required(),
})

const docUpdateValidation=Joi.object({
    title:Joi.string().min(2).max(50).trim(),
    documentNo:Joi.string().min(2).max(50).trim(),
    category:Joi.string().hex().length(24),
    body:Joi.string().min(2),
    
})

const incidentValidation=Joi.object({
// incidentId: Joi.number().required(),
reportedBy:Joi.string().hex().length(24).required(),
description:Joi.string().required(),
riskLevel: Joi.string().valid("Moderate", "High", "Severe").default("Moderate").required(),
incidentLocation: Joi.string().valid("locationA", "locationB", "locationC").required(),
attachments:Joi.array().items(Joi.string()),
});

const editUserValidation=Joi.object({
        firstName: Joi.string().min(2).max(50).trim(),
        lastName: Joi.string().min(2).max(50).trim(),
        email: Joi.string().email().trim().lowercase(),
        company: Joi.string().min(2).max(100).trim(),
        designation: Joi.string().valid("Manager", "Engineer", "HR", "Admin", "Sales"),
        isActive: Joi.boolean(),
})


const incidentUpdateValidation=Joi.object({
    actionTaken:Joi.string().default("NA"),
    incidentStatus: Joi.string().valid("Pending", "In-Progress", "Closed").default("Pending").required(),
});

const createTrainingValidation=Joi.object({
category:Joi.string().hex().length(24).required(),
// businessEntity:Joi.string().trim().required(),
title:Joi.string().trim(),
body:Joi.string().trim(),
// imageUrl:Joi.string(),
questionID:Joi.array().items(Joi.string().hex().length(24)),
});

const questionnaireValidation=Joi.object({
    questionType:Joi.number().valid(1,2,3).required(),
    question:Joi.string().required(),
    answer: Joi.array().items(Joi.string()).required(),
    options:Joi.array().items(Joi.string()),
    createdBy:Joi.number().valid(1,2,3).default(3).required(),
});

const resultValidation = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    trainingId: Joi.string().hex().length(24).required(),
    responses: Joi.array().items(
        Joi.object({
            questionId: Joi.string().hex().length(24),
            userAnswer: Joi.array().items(Joi.string()),
        })
    ),
    score: Joi.number().allow(null), // Allows null for default value
    status: Joi.string().valid('Viewed', 'Attempted').default('Viewed'),
    completedAt: Joi.date().allow(null) //allows null because it can be null.
});
module.exports = {userValidationJoiSchema,
categoryValidationSchema,docValidationSchema,
editUserValidation, incidentValidation,incidentUpdateValidation,
createTrainingValidation,questionnaireValidation,resultValidation,docUpdateValidation,newUserValidation};
