const { user } = require('../models/index.model');
require('dotenv').config();
const { sendResponse } = require('../helper_functions/sendResponse');
const mongoose = require("mongoose");


const NO_PREVIEW_S3_IMAGE = process.env.NO_PREVIEW_S3_IMAGE;

// const { error, message } = require('../utils/validations/users.joi.validation');
const {s3DeleteFunction, s3SingleUploadFunction} = require('../helper_functions/helper');


const constantMessage = require("../config/constant");
const { editUserValidation } = require('../utils/validations/joi.validation');

//get all users from user db 

const getAllUsers = async (req, res) => {

    try {
        let { page = 1, limit = 10, sortData = -1, nameSearch ,role } = req.query;
        const skip = (page - 1) * limit;
        const filter = {};

       
        if (nameSearch) {
            filter.$or = [
                { firstName: { $regex: nameSearch, $options: "i" } },
                { lastName: { $regex: nameSearch, $options: "i" } }
            ];
        }

        if(role){
            filter.role = role;
        }
     
        const [allUser, totalCount] = await Promise.all([
            user.find(filter)
                .select("_id imageUrl firstName lastName email createdAt")
                .sort({ createdAt: sortData })
                .skip(skip)
                .limit(limit),
            user.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            allUser,
            totalCount,
            totalPages,
            currentPage: Number(page),
            limit: Number(limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getAllStaff = async (req, res) => {
    try {
        let { page = 1, limit = 10, sortData = -1, nameSearch } = req.query;

        page = Number(page);
        limit = Number(limit);
        sortData = Number(sortData);

        const skip = (page - 1) * limit;
        const filter = { role: 1 };

        if (nameSearch) {
            filter.$or = [
                { firstName: { $regex: nameSearch, $options: "i" } },
                { lastName: { $regex: nameSearch, $options: "i" } }
            ];
        }

        // Execute queries in parallel for better performance
        const [allUser, totalCount] = await Promise.all([
            user.find(filter)
                .select("_id imageUrl firstName lastName email createdAt")
                .sort({ createdAt: sortData })
                .skip(skip)
                .limit(limit),
            user.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            allUser,
            totalCount,
            totalPages,
            currentPage: page,
            limit
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




const getAllAdmin = async (req, res) => {
    try {
        let { page = 1, limit = 10, sortData = -1, nameSearch } = req.query;

      
        page = Number(page);
        limit = Number(limit);
        sortData = Number(sortData);

        const skip = (page - 1) * limit;
        const filter = { role: 2 };

        if (nameSearch) {
            filter.$or = [
                { firstName: { $regex: nameSearch, $options: "i" } },
                { lastName: { $regex: nameSearch, $options: "i" } }
            ];
        }



        const [allUser, totalCount] = await Promise.all([
            user.find(filter)
                .select("_id imageUrl firstName lastName email createdAt")
                .sort({ createdAt: sortData })
                .skip(skip)
                .limit(limit),
            user.countDocuments(filter)
        ]);
    


        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            allUser,
            totalCount,
            totalPages,
            currentPage: page,
            limit
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





// view a particular user 
const getUser = async (req, res) => {
    try {
        const { _id } = req.params;

    
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const gotUser = await user.findById(_id)
            .select("_id firstName lastName email createdAt imageUrl company designation isActive");

        if (!gotUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(gotUser);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//edit a particular user
const editUser = async (req, res) => {
    try {
    
        const { _id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const userFound = await user.findById(_id);
        if (!userFound) {
            return res.status(404).json({ error: "User not found" });
        }

       
        const { error, value } = editUserValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        let { firstName, lastName, email, company, designation, isActive } = value;
        let imageUrl = userFound.imageUrl; 

        if (req.file) {
            try {
                console.log("found the image");
                if (userFound.imageUrl) {
                    await s3DeleteFunction(userFound.imageUrl); 
                }
                let contentType = req.file.mimetype;
                let imageBuffer = req.file.buffer;
                imageUrl = await s3SingleUploadFunction(imageBuffer, "ProfilePhotos", contentType);
            } catch (err) {
                console.error("Error handling image upload:", err);
                return res.status(500).json({ error: "Image processing failed" });
            }
        }

       
        const updatedUser = await user.findByIdAndUpdate(
            _id,
            { $set: { firstName, lastName, imageUrl, designation, email, company, isActive } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            imageUrl: updatedUser.imageUrl,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            company: updatedUser.company,
            designation: updatedUser.designation,
            isActive: updatedUser.isActive
        });

    } catch (error) {
        console.log("Edit User Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};






//search user from firstname and lastname

const searchUser = async (req, res) => {
    try {
        const { nameSearch } = req.params;

        if (!nameSearch) {
            return res.status(400).json({
                success: false,
                message: 'Input is required'
            });
        }

        let fname = {
            firstName: { $regex: nameSearch, $options: "i" }
        };
        let flname = {
            lastName: { $regex: nameSearch, $options: "i" }
        };

        const gotUser = await user.find(
            {
                role: 1,

                $or: [
                    fname,
                    flname
                ]
            })
            .select("_id firstName lastName email createdAt imageUrl isActive");


        return res.status(200).json({
            success: true,
            message: gotUser.length ? 'Users retrieved successfully' : 'No users found',
            data: gotUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error searching users',
            error: error.message
        });
    }
};

const getUserRegistrations = async (req, res) => {
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

        const monthlyRegistrations = await user.aggregate([
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

        const totalRegistrations = await user.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const formattedRegistrations = Array(12).fill(0);

        monthlyRegistrations.forEach(item => {
            formattedRegistrations[item._id - 1] = item.count;
        });

        res.json({ 
            registrations: formattedRegistrations,
            totalRegistrations 
        });

    } catch (error) {
        console.error('Error fetching user registrations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getAllUsers, getUser, editUser, getAllStaff, getAllAdmin, searchUser, getUserRegistrations };