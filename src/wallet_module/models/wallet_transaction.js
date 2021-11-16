const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const wallet_Transaction_Schema = new mongoose.Schema({
     transaction_Id: {
         type: String,
         required:true,
         unique: true,
         trim: true,
         match: /^[a-zA-Z0-9\-]+$/
     },
     wallet:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Wallet',
         required:true,
         trim: true,
         match: /^[a-z0-9]{24}$/
     },
     transaction_Type:{
        type:String,
        required:true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
     transaction_Amount:{
        type:  Number,
        required:true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
     },
  /*  transaction_To:{
        type:String,
    },
    transaction_From:{
        type:String,
    },*/
    reason: {
        type:String,
        required:true,
        trim: true,
        match: /^[a-zA-Z0-9\s\-]+$/
    },
    transaction_Made_By: {
        type: String,
        trim: true,
   //     match: /^[a-zA-Z0-9\-]+$/
       // require: true
    }
},
{timestamps: true}
)

wallet_Transaction_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Wallet_Transaction', wallet_Transaction_Schema,collection="Wallet Transaction");
