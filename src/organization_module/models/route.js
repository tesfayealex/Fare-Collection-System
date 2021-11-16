const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');
//const geoschema = require('../../helpers/GeoSchema');
//const Station = require('./Station')

const route_Schema = new mongoose.Schema({
       route_Id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: /^[a-zA-Z0-9\-]+$/
                   },
       route_Name:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9\s\-]+$/ 
       },           
       stations:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
                }],    
       route_File:{
        type:String,
        required: true,
        unique: true,
        trim: true,
     //   match: /^[a-zA-Z0-9\s\-]+$/
                },
       route_segments:[
      { sub_route: [
         {type:String,
         required: true,
        // unique: true,
         trim: true,
         match: /^[a-zA-Z0-9\s\-]+$/
                 }],
        sub_route_length: {
         type: Number,
         required: true,
        // unique: true,
         trim: true,
         match: /^[0-9\.]+$/
        }
      }  ],
        route_length:{
         type: Number,
         required: true,
        // unique: true,
         trim: true,
         match: /^[0-9\.]+$/
        },
        status:{
                    type: String,
                    enum: ['Activated','Deactivated'],
                    required: true,
                 }             
    //    starting_Station: {
    //        type: mongoose.Schema.Types.ObjectId,
    //        ref: 'Station',
    //        trim: true,
    //        match: /^[a-z0-9]{24}/   
    //    },
    //    ending_Station: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Station',
    //     trim: true,
    //     match: /^[a-z0-9]{24}/   
    // },
                   
},
{timestamps: true}
)

route_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Route', route_Schema,collection="Route");