const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const employee_Access_Schema = new mongoose.Schema({
       employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true ,
          trim: true,
          match: /^[a-z0-9]{24}/ 
       },
       username: {
           type: String,
           required: true,
           unique: true,
           trim: true,
        //   match: /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
       },
       password:{
          type:String,
          required: true,
        //  match: /^([a-zA-Z0-9@*#]{8,15})$/
       },
       role: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Role',
         required: true,
         trim: true,
         match: /^[a-z0-9]{24}/
   },
      status:{
         type: String,
         enum: ['Activated','Deactivated'],
         required: true,
      }
},
{timestamps: true}
)

employee_Access_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Employee_Access', employee_Access_Schema,collection = "Employee Access Information");