const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const organization_Schema = new mongoose.Schema({
    
    organization_Id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
    organization_Name: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         match: /^[a-zA-Z\s]+$/
    },
    organization_Type: {
         type: String,
         required:true,
         enum: ["Platform_Provider", "Government","Service_Provider"]
    },
    profile_Picture:{
        type:String,
        required: true,
        unique: true,
        trim: true,
     //   match: /^[a-zA-Z0-9\s\-]+$/
  },
    main_Office: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z0-9\s\,\-]+$/
    },
    about_Organization: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z\s\-]+$/
    },
    phone_Number:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[0-9\-]+$/
    },
    status:{
        type: String,
        enum: ['Activated','Deactivated'],
        required: true,
     }
},
 {timestamps: true}
);

organization_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Organization', organization_Schema, collection ='Organization');