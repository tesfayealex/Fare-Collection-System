const mongoose = require('mongoose');
const unique_validator = require('mongoose-unique-validator');

help_desk = {
    session_Id: {
        type: String,
        required:true,
       // unique:true,
        trim: true,
        //match: /^[0-9]+$/  
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        trim: true
                 },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee_Access',
        trim: true
               },
   rate: {
       type: Number,
       required: true,
       match: /[0-5]/,
       trim: true,
        },
   sender: {
       type: String,
       required: true,
       trim: true,
       enum: ['customer','employee']
    //   match: /^[0-9\-]+$/
        },   
    message:{
            type:String,
            required: true,
        //    unique: true,
            trim: true,
         //   match: /^[a-zA-Z\s\-]+$/
      },
     status: {
         type: String,
         required: true,
         trim: true,
         enum: ['killed','open','closed']
     }  ,    
     assigned: {
        type: Boolean,
        required: true,
        trim: true,
     },
     reason: {
        type:String,
       // required: true,
    //    unique: true,
     //   trim: true,
        match: /^[a-zA-Z0-9\s\-]+$/
     },
     seen:{
        type: Boolean,
        required: true,
        trim: true,
          }
}

const help_Desk_Schema = new mongoose.Schema(help_desk, {collection: 'Help Desk',timestamps: true});

help_Desk_Schema.plugin(unique_validator);

module.exports = mongoose.model('Help Desk',help_Desk_Schema);

