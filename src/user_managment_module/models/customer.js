const mongoose = require('mongoose');
const user = require('./users') ;
const unique_validator = require('mongoose-unique-validator');

customer = {
    name:{
     first_Name: user.name.first_Name,
     last_Name: user.name.last_Name,
     grand_Father_Name: user.name.grand_Father_Name
          },
    phone_Number: user.phone_Number,
    address: user.address,
    customer_Id: {
        type: String,
        required: [true, 'customer_Id can not be blank'],
        unique: [true, 'customer Id should be unique'],
        trim: true,
        match: /^[0-9a-zA-Z\-]+$/
                 },
    identification_Number: {
       type: String,
       unique:true,
       trim: true,
       match: /^[0-9a-zA-Z\-\/]+$/
                           },
   gender: {
       type: String,
       trim: true,
       enum: ["Male","Female"]
        },
   age: {
       type: Number,
       trim: true,
    //   match: /^[0-9\-]+$/
        },   
  profile_Picture:{
            type:String,
        //    unique: true,
            trim: true,
         //   match: /^[a-zA-Z\s\-]+$/
      },     
}

const customer_Schema = new mongoose.Schema(customer, {collection: 'Customer',timestamps: true});

customer_Schema.plugin(unique_validator);

module.exports = mongoose.model('Customer',customer_Schema);

