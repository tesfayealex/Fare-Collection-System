const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');
const fare_Schema = new mongoose.Schema({
     fare_Id:{
         type: String,
         required: true,
         unique: true,
         trim: true,
         match: /^[a-zA-Z0-9\-]+$/ 
        },
     fare_Amount:{
         type: Number,
         required: true,
         trim: true,
         match: /^[0-9\-]+$/
     },
     issued_By:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Employee',
         required: true,
         trim: true,
         match: /^[a-zA-Z0-9]*$/
     },
     status:{
        type: String,
        enum: ['Active' , 'New'],
        required: true,
        trim: true 
     }
},
{timestamps: true}
)

fare_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Fare', fare_Schema,collection="Fare");

