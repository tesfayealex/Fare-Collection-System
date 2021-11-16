
const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const refresh_schema = new mongoose.Schema({
       token: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            //match: /^[a-zA-Z0-9\-]+$/
       },
       machine:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required:true,
        trim: true,
        match: /^[a-z0-9]{24}$/
    },
    //    organization_Type: {
    //     type: String,
    //     required:true,
    //     enum: ["Platform_Provider", "Government","Service_Provider"]
    //       },
    //    role_Type:{
    //      type: String,
    //      required: true,
    //      trim: true  
    //    },   
    //    access:{},
    //    timestamp:{
    //     type: String,
    //     required: true
    //          }
    },
{timestamps: true}
)

refresh_schema.plugin(unique_Validator);

module.exports = mongoose.model('Machine Refresh Token', refresh_schema,collection="Machine Refresh Token");

