const express=require('express');
const{createQues,viewQues,viewAllques}=require('../controllers/questionnaire.controller');
const questionRoute=express.Router();
const jwtAuth = require('../middlewares/user.auth.jwt')
const AdminAuthMiddleware = require('../middlewares/admin.auth.middleware')

questionRoute.post('/createQues/:docId',jwtAuth, AdminAuthMiddleware, createQues);
questionRoute.get('/viewQues/:questionId',jwtAuth,viewQues);
questionRoute.get('/viewallQues/:docId',jwtAuth,viewAllques);

module.exports=questionRoute;