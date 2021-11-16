/*const mongoose = require('mongoose');*/

/*const user_Option = {
    discriminatorKey: 'user_type',
    collection: 'Users'
}*/

const user = {
    name:{
    first_Name: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z\-]+$/
    },
    last_Name: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z\s\-]+$/
    },
    grand_Father_Name: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z\-]+$/
    }},
    phone_Number: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    //    match: /^[0-9\-]+$/
     //   match: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/
      // match: /^[+][0-9]{3}[-][0-9]{9}$/g
    //  match: /^[09]*[0-9]{8}$/g
    },
    address: {
        type: String,
        trim: true,
        match:/^[#.0-9a-zA-Z\s,-]+$/
    }
    }

/* const user_Schema = new mongoose.Schema(
   {
       first_Name: {
           type: String,
           required: true,
       }
    /*   last_Name: {
           type: String,
           required: true,
       },
       grand_Father_Name: {
           type: String,
           required: true
       },
       phone_number: {
           type: String,
           required: true
       },
       address: {
           type: String,
       }
   },
    user_Option
   );*/
   //const user_Schema = new mongoose.Schema(user);
   

   //module.exports = mongoose.model('User', user_Schema);
module.exports = user;
   