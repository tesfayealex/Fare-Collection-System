const mongoose = require('mongoose');

const notification_Schema = new mongoose.Schema({
     issued_By: {
         type: String,
         required: true,
         trim: true,
         match: /^[a-zA-Z0-9\-]+$/
     },
     issued_For: {
         type: String,
         required: true,
         trim: true,
        match: /^[a-zA-Z0-9\-]+$/
     },
     detail: {
         type: String,
         required: true,
         trim: true,
        match: /^[a-zA-Z0-9\-]+$/
     },
     notification_Type: {
         type: String ,
         trim: true,
        match: /^[a-zA-Z0-9\-]+$/
     },
     issued_Date: {
         type: String,
         required: true,
         trim: true,
        match: /^[a-zA-Z0-9\-]+$/
     }
},
{timestamps: true}
)

module.exports = mongoose.model('Notification', notification_Schema,collection="Notification");

