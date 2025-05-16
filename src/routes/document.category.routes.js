const express = require('express');
const categoryRouter = express.Router();
const jwtAuth = require('../middlewares/user.auth.jwt')
const AdminAuthMiddleware = require('../middlewares/admin.auth.middleware')

const {createCategory,getAllCategories,getCategoryByName,deleteCategory} =require('../controllers/category.controller');

categoryRouter.post('/createCategory',jwtAuth,AdminAuthMiddleware, createCategory);            // Create a new category
categoryRouter.get('/getAllCategories',jwtAuth, getAllCategories);          // Get all categories
categoryRouter.get('/getCategoryByName/:name',jwtAuth, getCategoryByName);   // Get a category by name
categoryRouter.delete('/deleteCategory/:categoryId',jwtAuth,AdminAuthMiddleware, deleteCategory);   // Delete a category by name

module.exports = categoryRouter;
