const express=require('express');
const documentRoute=express.Router();
const jwtAuth = require('../middlewares/user.auth.jwt')
const multer = require('multer');
const AdminAuthMiddleware = require('../middlewares/admin.auth.middleware')

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



const {saveDocument,getDocumentsByCategory,updateDocument,
    deleteDocument,searchDocument,logDocumentView,
    getDocumentViews,getUserDocumentViewCount,
    getDocumentUniqueViewCount,getDocumentStats,getDocumentApi}=require('../controllers/document.controller');

documentRoute.get('/getDocumentsByCategory/:categoryId',getDocumentsByCategory);

documentRoute.post('/createDocument',jwtAuth,AdminAuthMiddleware, upload.fields([
    { name: 'imageUrl', maxCount: 1 }, 
    { name: 'file', maxCount: 1 }
]), saveDocument);

documentRoute.patch('/updateDocument/:documentId',jwtAuth,AdminAuthMiddleware,upload.single('imageUrl'),updateDocument);
documentRoute.delete('/deleteDocument/:documentId',jwtAuth, AdminAuthMiddleware, deleteDocument);
documentRoute.get('/searchDocument',jwtAuth,searchDocument);
documentRoute.post('/logDocView/:userId/:documentId',jwtAuth,logDocumentView);
documentRoute.get('/getDocViews/:documentId',jwtAuth,getDocumentViews);
documentRoute.get('/getUserDocViewCount/:userId',jwtAuth,getUserDocumentViewCount);
documentRoute.get('/getDocViewsCount/:documentId',jwtAuth,getDocumentUniqueViewCount);
documentRoute.get('/getDocumentStats',jwtAuth,getDocumentStats);
documentRoute.get('/getDocumentApi',jwtAuth,getDocumentApi);


module.exports=documentRoute;

