

const express=require('express');
const incidentRoute=express.Router();
const jwtAuth = require('../middlewares/user.auth.jwt')
const AdminAuthMiddleware = require('../middlewares/admin.auth.middleware')

const {createIncident,updateIncident,getIncidentStats,
    getMonthlyIncidentReport,getIncidentApi,getIncidents,getIncidentsbyYear}=require('../controllers/incident.controller');


incidentRoute.get('/getIncidentApi',jwtAuth,getIncidentApi);
incidentRoute.get('/getIncidents',jwtAuth,getIncidents);
incidentRoute.post('/createIncident',jwtAuth,createIncident);
incidentRoute.patch('/updateIncident/:_id',jwtAuth,AdminAuthMiddleware, updateIncident);  //only admin can access this
incidentRoute.get('/getIncidentStats',jwtAuth,AdminAuthMiddleware, getIncidentStats);  //only admin can access this
incidentRoute.get('/getMonthlyIncidentReport',jwtAuth,AdminAuthMiddleware, getMonthlyIncidentReport);//only admin can access this
incidentRoute.get('/getIncidentsbyYear/:year',jwtAuth,AdminAuthMiddleware, getIncidentsbyYear);

module.exports=incidentRoute;

