const express = require('express');
const trainingCategory=express.Router();
const jwtAuth = require('../middlewares/user.auth.jwt')
const AdminAuthMiddleware = require('../middlewares/admin.auth.middleware')
const {createCategory,getAllCategories,getCategoryByName,deleteCategory} =require('../controllers/new.training.category.controller');

trainingCategory.post('/createTrainingCategory',jwtAuth, AdminAuthMiddleware, createCategory);            
trainingCategory.get('/getAllTrainingCategories',jwtAuth, getAllCategories);          
trainingCategory.get('/getTrainingCategoryByName/:name',jwtAuth, getCategoryByName);  
trainingCategory.delete('/deleteTrainingCategory/:categoryId',jwtAuth,AdminAuthMiddleware, deleteCategory); 

module.exports = trainingCategory;
