const mongoose = require('mongoose');
const user = require('./users');
const unique_Validator = require('mongoose-unique-validator');

const employee = {
    name:{
        first_Name: user.name.first_Name,
        last_Name: user.name.last_Name,
        grand_Father_Name: user.name.grand_Father_Name},
    phone_Number: user.phone_Number,
    address: user.address,
   employee_Id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[0-9a-zA-Z\-]+$/
   },
   email:{
         type:String,
         required: true,
         unique: true,
         trim: true,
         match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
   },
   profile_Picture:{
         type:String,
         required: true,
         unique: true,
         trim: true,
      //   match: /^[a-zA-Z0-9\s\-]+$/
   },
   organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Organization',
          required: true,
          trim: true,
          match: /^[a-z0-9]{24}/ 
   },
   branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Branch',
          trim: true,
          match: /^[a-z0-9]{24}/
   },
//    role: {
//          type: mongoose.Schema.Types.ObjectId,
//          ref: 'Role',
//          //required: true,
//          trim: true,
//          match: /^[a-z0-9]{24}/
//    }
}

const employee_Schema = new mongoose.Schema(employee,{collection: 'Employee',timestamps: true});

employee_Schema.plugin(unique_Validator);

//const Employee = user.descriminator('Employee', employee_Schema);

module.exports = employee_Schema

//module.exports = mongoose.model('Employee',employee_Schema);

