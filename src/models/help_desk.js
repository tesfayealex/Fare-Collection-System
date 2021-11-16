const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');
const helpdesk_Schema = new mongoose.Schema({
    customer_Id: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
    help_Agent_Id: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
    session_ID: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    },
    session: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z0-9\-]+$/
    }
},
{timestamps: true}
)

helpdesk_Schema.plugin(unique_Validator);
module.exports = mongoose.model('Help_Desk', helpdesk_Schema,collection="Help Sessions");