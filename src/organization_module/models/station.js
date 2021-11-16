const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');
const geoschema = require('../../helpers/GeoSchema');
const station_Schema = new mongoose.Schema({
       station_Id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: /^[a-zA-Z0-9\-]+$/
                   },
       station_Name: {
           type: String,
           required: true,
           unique: true,
           trim: true,
           match: /^[a-zA-Z0-9\s]+$/
                      },
       status:{
              type: String,
              enum: ['Activated','Deactivated'],
              required: true,
              },
       geometry:{
          type:{
              type: String,
              default: 'point',
              required: true
               },
       coordinate: {
              type: [Number],
              index: '2dsphere',
              required: true,
              },
          },
        station_Type: {
           type: String,
           enum:['main', 'sub'],
           required: true    
        }        
},
{timestamps: true}
)
// location: geoschema
station_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Station', station_Schema,collection="Station");