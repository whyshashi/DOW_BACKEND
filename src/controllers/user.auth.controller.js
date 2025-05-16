const user = require('../models/user.model');
const bcrypt=require('bcryptjs');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {userValidationJoiSchema,newUserValidation} = require('../utils/validations/joi.validation');
const JWT_SECRET = process.env.JWT_SECRET ;
const {TOKEN_OPTIONS} = require('../config/constant');
const {sendResponse} = require('../helper_functions/sendResponse');

const constantMessage = require("../config/constant");


const signup = async (req, res) => {
    try {
        
        const { error, value } = userValidationJoiSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        let {firstName, lastName, email, password, imageUrl, designation } = value; 
        let role = 1;  //only user can be created from this api not admin
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new user({firstName, lastName, email, password: hashedPassword, imageUrl, role ,designation });
        await newUser.save();

        const payload = { _id: newUser._id, role };
        const token = jwt.sign(payload, JWT_SECRET, TOKEN_OPTIONS);

        
        
        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(201).json({ message: "User registered successfully",  user: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            imageUrl: newUser.imageUrl,
        },});

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const login = async (req, res) => {

    try {
        const {error,value}=newUserValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        let { email, password } =value;

        const checkUser = await user.findOne({ email });
        if (!checkUser) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, checkUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { _id:checkUser._id, role: checkUser.role };
        const token = jwt.sign(payload, JWT_SECRET , TOKEN_OPTIONS);
        
        checkUser.token = token;
        await checkUser.save();
        
        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(200).json({ 
            message: "Logged in successfully", 
            token:token,
            user: {
            firstName: checkUser.firstName,
            lastName: checkUser.lastName,
            imageUrl: checkUser.imageUrl,
        }
    });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports={login,signup};