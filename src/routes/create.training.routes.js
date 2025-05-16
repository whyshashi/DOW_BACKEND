const express=require('express');
const jwtAuth = require('../middlewares/user.auth.jwt')
const AdminAuthMiddleware = require('../middlewares/admin.auth.middleware')

const {saveTraining,getAllTrainingDoc,getTrainingDoc,deleteTrainingDoc,updateTrainingDoc,getTrainingByCategory,getTrainingStats}=require('../controllers/new.training.controller');
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'application/vnd.ms-excel', 'text/plain'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Allowed types: JPG, PNG, GIF, PDF, XLS, TXT"));
        }

        cb(null, true);
    }
});


const trainingRoute=express.Router();

trainingRoute.get('/getAllTrainingDoc',jwtAuth,getAllTrainingDoc);
trainingRoute.post('/saveTrainingdoc',jwtAuth,upload.fields([
    { name: 'imageUrl', maxCount: 1 }, 
    { name: 'file', maxCount: 1 }
]),saveTraining);
trainingRoute.get('/getTrainingDoc/:docId',jwtAuth,getTrainingDoc);
trainingRoute.get('/getTrainingByCategory/:categoryId',jwtAuth,getTrainingByCategory);
trainingRoute.patch('/updateTrainingDoc/:docId',jwtAuth,updateTrainingDoc);
trainingRoute.delete('/deleteTrainingDoc/:docId',deleteTrainingDoc);
trainingRoute.get('/getTrainingStats',jwtAuth,getTrainingStats);

module.exports=trainingRoute;