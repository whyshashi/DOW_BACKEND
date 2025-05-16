const {incidentReporting,user}=require('../models/index.model');
const {sendResponse} = require('../helper_functions/sendResponse');
const mongoose = require("mongoose");

const constantMessage = require("../config/constant");

const {incidentValidation,incidentUpdateValidation}=require('../utils/validations/joi.validation');



//get all incidents - pagination included

const getIncidents = async (req, res) => {
    try {
        let { page = 1, limit = 10, riskLevel, sortData = -1, searchDescription, _id, incidentStatus, today = 0 } = req.query;
        const skip = (page - 1) * Number(limit);
        
        let filter = {};
        sortData = Number(sortData);
        today = Number(today);

        if (riskLevel) {
            filter.riskLevel = riskLevel;
        }

        if (searchDescription) {
            filter.$or = [
                { riskLevel: { $regex: searchDescription, $options: "i" } }, 
                { incidentLocation: { $regex: searchDescription, $options: "i" } },  
                { incidentStatus: { $regex: searchDescription, $options: "i" } },     
                { actionTaken: { $regex: searchDescription, $options: "i" } }, 
                { description: { $regex: searchDescription, $options: "i" } }, 
            ];
        }
        
        if (_id) {
            filter._id = _id; 
        }

        if (incidentStatus) {
            filter.incidentStatus = incidentStatus; 
        }
        
      
        if (today === 1) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const allIncidents = await incidentReporting
            .find(filter)
            .sort({ incidentId: sortData })
            .skip(skip)
            .limit(Number(limit))
            .populate('reportedBy', 'firstName lastName')
            
            
        const totalCount = await incidentReporting.countDocuments(filter);
  
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            allIncidents,
            totalCount,
            totalPages,
            currentPage: Number(page),
            limit: Number(limit),
        });
  
    } catch (error) {
        console.error("Error fetching incidents :", error);
        res.status(500).json({ error: "Unable to fetch incidents" });
    }
};



//get incident by options 
const getIncidentApi = async (req, res) => {
    try {
        let { page = 1, limit = 10, riskLevel, sortData = -1, searchDescription, _id, incidentStatus, today = 0 } = req.query;
        const skip = (page - 1) * Number(limit);
        
        let filter = {};
        sortData = Number(sortData);
        today = Number(today);

        if (riskLevel) {
            filter.riskLevel = riskLevel;
        }

        if (searchDescription) {
            filter.$or = [
                { riskLevel: { $regex: searchDescription, $options: "i" } }, 
                { incidentLocation: { $regex: searchDescription, $options: "i" } },  
                { incidentStatus: { $regex: searchDescription, $options: "i" } },     
                { actionTaken: { $regex: searchDescription, $options: "i" } }, 
                { description: { $regex: searchDescription, $options: "i" } }, 
            ];
        }
        
        if (_id) {
            filter._id = _id; 
        }

        if (incidentStatus) {
            filter.incidentStatus = incidentStatus; 
        }
        
      
        if (today === 1) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const allIncidents = await incidentReporting
            .find(filter)
            .sort({ incidentId: sortData })
            .skip(skip)
            .limit(Number(limit))
            .populate('reportedBy', 'firstName lastName')
            
            let Incidents={};
            if(_id){
                 Incidents = allIncidents.map(incident => ({
                    riskLevel: incident.riskLevel,
                    incidentId: incident.incidentId,
                    incidentLocation: incident.incidentLocation,
                    description: incident.description,
                    attachments: incident.attachments,
                    reportedBy: incident.reportedBy,
                    createdAt: incident.createdAt,
                    _id: incident._id,
                    incidentStatus: incident.incidentStatus,
                    actionTaken: incident.actionTaken,
                    
                }));

            }
            else{
                Incidents = allIncidents.map(incident => ({
                    _id: incident._id,
                    incidentId: incident.incidentId,
                    riskLevel: incident.riskLevel,
                    description: incident.description,
                    createdAt: incident.createdAt,
                    incidentLocation: incident.incidentLocation,
                    reportedBy: incident.reportedBy,
                    incidentStatus: incident.incidentStatus,
                    actionTaken: incident.actionTaken
                }));
            }
            
        const totalCount = await incidentReporting.countDocuments(filter);
  
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            Incidents,
            totalCount,
            totalPages,
            currentPage: Number(page),
            limit: Number(limit),
        });
  
    } catch (error) {
        console.error("Error fetching incidents :", error);
        res.status(500).json({ error: "Unable to fetch incidents" });
    }
  };
    


//create new incident by client

const createIncident = async (req, res) => {
    try {
        let{error,value}=incidentValidation.validate(req.body);

        if(error){
            return res.status(400).json({message:error.details[0].message});
        }

        let {reportedBy, description, riskLevel, incidentLocation, attachments } = value;

        if (!description || !incidentLocation) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        let totalIncidents = await incidentReporting.countDocuments();
        totalIncidents = totalIncidents+1;

        const newIncident = new incidentReporting({
            // reportedBy: req.user._id, // taking this from req , and storing this in token auth middleware
            incidentId :totalIncidents,
            reportedBy,
            description,
            riskLevel,
            incidentLocation,
            attachments
        });

        await newIncident.save();

        res.status(201).json({ message: "Incident reported successfully", incident: newIncident });
    } catch (error) {
        console.error("Error creating incident:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//update status and actionTaken on the incident by admin 

const updateIncident = async (req, res) => {
    try {
        const { _id } = req.params;
        const {error,value}=incidentUpdateValidation.validate(req.query);

        if(error){
            return res.status(400).json({error:error.details[0].message});
        }

        let { incidentStatus, actionTaken } = value;

       
        if (!incidentStatus && !actionTaken) {
            return res.status(400).json({ 
                message: "At least one field (incidentStatus or actionTaken) is required" 
            });
        }


        const updatedIncident = await incidentReporting.findOneAndUpdate(
            { _id }, 
            { $set: { incidentStatus, actionTaken } }, 
            { new: true, runValidators: true } 
        );

        if (!updatedIncident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        res.status(200).json({ message: "Incident updated successfully", incident: updatedIncident });

    } catch (error) {
        console.error("Error updating incident:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


//get data of incidents

const getIncidentStats = async (req, res) => {
    try {
        const { year } = req.query;

       if(year){
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const filterByYear = { createdAt: { $gte: startDate, $lte: endDate } };

        const totalIncidents = await incidentReporting.countDocuments(filterByYear);
        const pendingIncidents = await incidentReporting.countDocuments({ ...filterByYear, incidentStatus: "Pending" });
        const inProgressIncidents = await incidentReporting.countDocuments({ ...filterByYear, incidentStatus: "In-Progress" });
        const closedIncidents = await incidentReporting.countDocuments({ ...filterByYear, incidentStatus: "Closed" });

        let incObj = {
            'totalDocument': totalIncidents,
            'documentStats': [
                {
                    "_id": "pendingIncidents",
                    count: pendingIncidents,
                },
                {
                    "_id": "inProgressIncidents",
                    count: inProgressIncidents
                },
                {
                    "_id": "closedIncidents",
                    count: closedIncidents
                }
            ]
        }

        return res.status(200).json(incObj);
       }

       
       const totalIncidents = await incidentReporting.countDocuments();
       const pendingIncidents = await incidentReporting.countDocuments({ incidentStatus: "Pending" });
       const inProgressIncidents = await incidentReporting.countDocuments({ incidentStatus: "In-Progress" });
       const closedIncidents = await incidentReporting.countDocuments({ incidentStatus: "Closed" });

       let incObj = {
           'totalDocument': totalIncidents,
           'documentStats':[
               {
                   "_id": "pendingIncidents",
                   count :pendingIncidents,
               },
               {
                   "_id": "inProgressIncidents",
                   count :inProgressIncidents
               },
               {
                   "_id": "closedIncidents",
                   count : closedIncidents
               }
           ]
       }

       return res.status(200).json(incObj);

        

    } catch (error) {
        console.error("Error fetching incident statistics:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



//incident stats

const getMonthlyIncidentReport = async (req, res) => {
    try {
        const report = await incidentReporting.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        return res.status(200).json(report);
    } catch (error) {
        console.error("Error fetching monthly incidents:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getIncidentsbyYear = async (req, res) => {
    try {
        const { year } = req.params;

        if (!year) {
            return res.status(400).json({ error: 'Year is required' });
        }

        const yearNumber = parseInt(year);
        if (isNaN(yearNumber)) {
            return res.status(400).json({ error: 'Invalid year format' });
        }

        const startDate = new Date(yearNumber, 0, 1);
        const endDate = new Date(yearNumber + 1, 0, 1);

        const monthlyIncidents = await incidentReporting.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const totalIncidents = await incidentReporting.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const formattedIncidents = Array(12).fill(0);

        monthlyIncidents.forEach(item => {
            formattedIncidents[item._id - 1] = item.count;
        });

        res.json({ 
            incidents: formattedIncidents,
            totalIncidents 
        });

    } catch (error) {
        console.error('Error fetching incident data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports={createIncident,updateIncident,getIncidentStats
    ,getMonthlyIncidentReport,getIncidentApi,getIncidents, getIncidentsbyYear};



