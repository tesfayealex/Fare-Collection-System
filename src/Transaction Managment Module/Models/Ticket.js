
const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const ticket_Schema = new mongoose.Schema({
    customer:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Customer',
         trim: true,
        match: /^[a-z0-9]{24}$/
    },
    machine:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Machine',
         trim: true,
        match: /^[a-z0-9]{24}$/
    },
    ticket: {
        type: String,
        required: true,
        unique: true,
        trim: true,
     //   match: /^[a-zA-Z0-9\-]+$/
    },
    ticket_type: {
        type: String,
        required: true,
        enum: ['Mobile','Temporary']
    },
    issued_Date:{
        type: Date,
        required: true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
    ticket_Amount:{
        type: Number,
        required: true,
        trim: true,
        match: /^[0-9\-]+$/
    },
    ticket_Length:{
        type: Number,
        required: true,
        trim: true,
        match: /^[0-9\-]+$/
    },
    entry_Station:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        trim: true,
        required: true,
        match: /^[0-9]{24}$/
    },
    exit_Station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        trim: true,
        required:true,
        match: /^[0-9]{24}$/
    },
    route:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        trim: true,
        required: true,
        match: /^[0-9]{24}$/
    },
    status: {
       type: String,
       enum: ['Expired', 'Used' , 'Suspended' , 'New']
    },
},
{timestamps: true}
)

ticket_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Ticket', ticket_Schema,collection="Ticket");