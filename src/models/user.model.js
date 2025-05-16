const mongoose = require('mongoose');

const {roles}=require('../config/constant');
const { number } = require('joi');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index:true
    },
    password: {
        type:String,
        require:true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        default:"DOW",
        trim: true
    },
    imageUrl: {
        type: String
    },
    role: { 
        type: Number, 
        enum:[1,2], // 1 = Staff, 2 = Super Admin
        default: 1 // Default role is staff
    },
    isActive: {
        type: Boolean,
        default:true,
    },
    designation: {
        type: String,
        required: true,
        enum: ["Manager", "Engineer", "HR", "Admin", "Sales"],
        trim: true
    },

    token: {
        type:String
    }
},
{ 
    timestamps: true,  // Auto-creates `createdAt` & `updatedAt`
    collection: 'users' // Explicitly sets collection name
}
);

const user = mongoose.model('user', userSchema);
module.exports = user;