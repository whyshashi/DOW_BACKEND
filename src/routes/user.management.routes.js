const express=require('express');
const {getAllUsers,getUser,editUser,getAllStaff,getAllAdmin,searchUser,getUserRegistrations} =require('../controllers/user.management.controller');
const userRoutes=express.Router();
const jwtAuth = require('../middlewares/user.auth.jwt')
const AdminAuthMiddleware = require('../middlewares/admin.auth.middleware')
const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

userRoutes.get('/getAllUsers',jwtAuth,AdminAuthMiddleware, getAllUsers);
userRoutes.get('/getAllStaff',jwtAuth,AdminAuthMiddleware,getAllStaff);
userRoutes.get('/getAllAdmin',jwtAuth,AdminAuthMiddleware,getAllAdmin);
userRoutes.get('/getUser/:_id',jwtAuth,getUser);
userRoutes.patch('/editUser/:_id',jwtAuth,upload.single('imageUrl'),editUser);
userRoutes.get('/searchUser/:nameSearch',jwtAuth,searchUser);
userRoutes.get('/getUserRegistrations/:year',jwtAuth,AdminAuthMiddleware, getUserRegistrations);

module.exports=userRoutes;