const Document=require('./doc.model');
const Category=require('./category.model');
const user=require('./user.model');
const questionDb=require('./questionaire.model');
const createNewTraining=require('./create.new.training.model');
const safetyCategory=require('./training.category.model');
const incidentReporting = require('./incidentReporting.model');
const documentViews = require('./document.views.model');
const userTrainingProgress = require('./user.training.progress.model');


module.exports={Document,Category,user,questionDb,createNewTraining,safetyCategory,incidentReporting,documentViews,userTrainingProgress};