const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const wallet_Schema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        trim: true,
        match: /^[a-z0-9]{24}$/
              },
    balance:{
        type: Number,
        required: true,
        trim: true,
        match: /^[0-9\.]+$/
    },
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
     //   match: /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
    },
    password:{
        type: String,
        required: true,
        trim: true,
    //    match: /^([a-zA-Z0-9@*#]{8,15})$/
    },
    customer_type:{
        type: String,
        enum: ['free','normal'],
        required: true,
        trim: true,
    },
    user_access_type:{
        type: [String],
        enum: ['Card' , 'Mobile'] ,
        required: true,
        trim: true
    },
    status:{
        type: String,
        enum: ['Activated','Suspended','Deactivated'],
        required: true,
    }
},
{timestamps: true}
)

wallet_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Wallet',wallet_Schema, collection = "Wallet");
