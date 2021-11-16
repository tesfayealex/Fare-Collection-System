const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const machine_Schema = new mongoose.Schema({
    
    machine_Id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
    machine_Type: {
         type: String,
         required: true,
         //unique: true,
         enum: ['Ticket','Transaction'],
        // trim: true,
       //  match: /^[a-zA-Z]+$/
    },
    ip_Address: {
         type: String,
         required:true,
         unique: true,
         match: /^[0-9\.\/]+$/,
         trim: true
    },
    status:{
        type: String,
        enum: ['Activated','Deactivated'],
        required: true,
     }
},
 {timestamps: true}
);

machine_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Machine', machine_Schema, collection ='Machine');