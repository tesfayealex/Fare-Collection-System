const mongoose = require('mongoose');
const unique_Validator = require('mongoose-unique-validator');

const bus_Schema = new mongoose.Schema({
      bus_Id : {
          type: String,
          required: true,
          unique: true,
          trim: true,
          match: /^[a-zA-Z0-9\-]+$/
      },
      organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Organization',
          trim: true,
          match: /^[a-z0-9]{24}/ 
      /*    type: String,
          required: true,
          trim: true,
          match: /^[a-zA-Z0-9\-]+$/*/
      },
      bus_Driver: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Employee',
         trim: true,
       //  match: /^[a-z0-9]{24}/ 
        /*  type: String,
          required: true,
          unique: true,
          trim: true,
          match: /^[a-zA-Z0-9\-]+$/*/
      },
      ticket_Machine:{
          type: mongoose.Schema.Types.ObjectId,
         // required: true,
          ref: 'Machine',
          unique: true,
          trim: true,
        //  match: /^[a-zA-Z0-9\-]+$/
      },
      transaction_Machine:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true,
        unique: true,
        trim: true,
      //  match: /^[a-zA-Z0-9\-]+$/
    },
      status:{
        type: String,
        enum: ['Activated','Deactivated'],
        required: true,
     }
},
{timestamps: true}
)

bus_Schema.plugin(unique_Validator);

module.exports = mongoose.model('Bus', bus_Schema,collection="Bus");