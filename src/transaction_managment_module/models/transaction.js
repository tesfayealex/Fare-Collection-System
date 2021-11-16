
const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const transaction_Schema = new mongoose.Schema({
   transaction_Id: {
       type: String,
       required: true,
       unique: true,
       trim: true,
        match: /^[a-zA-Z0-9\-]+$/
   },
   ticket:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      trim: true,
      match: /^[a-z0-9]{24}$/
   },
   customer:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    trim: true,
    match: /^[a-z0-9]{24}$/
   },
   transaction_Amount:{
       type: Number,
       required: true,
       trim: true,
       match: /^[0-9\-]+$/
   },
   bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    trim: true,
    match: /^[a-z0-9]{24}$/
   },
   entry_Station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    trim: true,
    match: /^[a-z0-9]{24}$/
   },
   exit_Station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    trim: true,
    match: /^[a-z0-9]{24}$/
   },
   route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    trim: true,
  //  match: /^[a-zA-Z0-9]{24}$/
   },
   machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    trim: true,
    match: /^[a-z0-9]{24}$/
   }
},
{timestamps: true}
)

transaction_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Transaction', transaction_Schema,collection="Transaction");

