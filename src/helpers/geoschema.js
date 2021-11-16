const mongoose = require('mongoose');
//const validator = require('mongoose-unique-validator');

const geoschema =new mongoose.Schema({
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
   properties: {}    
},
{timestamp:true}
)

module.exports = geoschema
