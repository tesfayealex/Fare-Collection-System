const mongoose = require('mongoose');
//const user = require('./Users');
const org = require('../../Organization Module/Models/Organization');
const unique_Validator = require('mongoose-unique-validator');

    const report = {
        total_Transaction:{
            type: Number,
            trim: true,
            default: 0
        },
        mobile_Transaction:{
            type: Number,
            trim: true,
            default: 0
        },
        ticket_Transaction:{
            type: Number,
            trim: true,
            default: 0 
        },
        card_Transaction:{
            type: Number,
            trim: true,
            default:0
        },
    }
    
  /*  org.find({})
    .then(organization=>{
        organization.forEach(element => {
              if(element.organization_Type == 'Service_Provider') 
             report[element.organization_Id] = { type: Number , trim: true};
    })
    const report_Schema = new mongoose.Schema(report,{collection: 'Transaction Report',timestamps: true});
    report_Schema.plugin(unique_Validator);
    console.log(report)
   return mongoose.model('Transaction_Report', report_Schema);
    })*/
    const report_Schema = new mongoose.Schema(report,{collection: 'Transaction Report',timestamps: true , strict: false});
    report_Schema.plugin(unique_Validator);
 module.exports =  mongoose.model('Transaction_Report', report_Schema);  


    
  


