const express = require('express');
const router = express.Router();
const authRouter = require("./user.auth.routes");
const trainingRoute=require('./create.training.routes');
const documentRoute=require('./document.route');
const questionRoute=require('./questionnaire.routes');
const categoryRoute=require('./document.category.routes');
const manageUser=require('../routes/user.management.routes');
const trainingCategory=require('../routes/training.category.routes');
const incidentRoute=require('../routes/incident.report.routes');
const trainingResultRoute=require('../routes/training.result.route');

router.use("/",authRouter);
router.use("/",trainingRoute);
router.use("/",questionRoute);
router.use("/",documentRoute);
router.use("/",categoryRoute);
router.use("/",manageUser);
router.use("/",trainingCategory);
router.use("/",incidentRoute);
router.use("/",trainingResultRoute);



module.exports = router;