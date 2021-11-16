const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const branch_Schema = new mongoose.Schema({
    branch_Id:{
        type: String,
        required:true,
        unique:true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
    branch_Name:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9\s]+$/
    },
    address: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9\s\-]+$/
    },
    phone_Number: {
        type: String,
        required: true,
        unique: true,
        trim: true,
       // match: /^[0-9\-]+$/
    },
    status:{
        type: String,
        enum: ['Activated','Deactivated'],
        required: true,
     }
},
{timestamps: true}
)

branch_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Branch', branch_Schema, collection="Branch");