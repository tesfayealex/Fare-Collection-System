const mongoose = require('mongoose');
const unique_validator = require('mongoose-unique-validator');

notification = {
    session_Id: {
        type: String,
        required:true,
      //  unique:true,
        trim: true,
    //    match: /^[0-9]+$/  
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        trim: true
                 },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        trim: true
               },
    context:{
        title: {
            type:String,
            required: true,
            trim: true
               },
        body: {
          message:{ 
                   type:String,
                    trim: true
                   },  
           file: {
               type: String,
               trim: true
                   }            
              }
            },
     type: {
         type: String,
         required: true,
         trim: true,
         enum: ['new','reply']
             } ,
    seen: {
        type: Boolean,
        required: true,
        trim: true,
    }
    // reason: {
    //     type:String,
    //     required: true,
    // //    unique: true,
    //  //   trim: true,
    //     match: /^[a-zA-Z0-9\s\-]+$/
    //  },         
   // }
}

const notification_Schema = new mongoose.Schema(notification, {collection: 'Notification',timestamps: true});

notification_Schema.plugin(unique_validator);

module.exports = mongoose.model('Notification',notification_Schema);

