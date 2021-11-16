
const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const role_Schema = new mongoose.Schema({
       role_Id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: /^[a-zA-Z0-9\-]+$/
       },
       role_Name: {
           type: String,
           required: true,
           trim: true,
           match: /^[a-zA-Z0-9\s]+$/
       },
       organization_Type: {
        type: String,
        required:true,
        enum: ["Platform_Provider", "Government","Service_Provider"]
          },
       role_Type:{
         type: String,
         required: true,
         trim: true  
       },   
       access:{},
       status:{
        type: String,
        enum: ['Activated','Deactivated'],
        required: true,
             }
    },
{timestamps: true}
)

role_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Role', role_Schema,collection="Role");

