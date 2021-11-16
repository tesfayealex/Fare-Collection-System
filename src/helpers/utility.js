const multer = require('multer');
const path = require('path');
const config = require('../config');
const fs = require('fs')
const storage = multer.diskStorage({
    destination:
             function(req,file,callback){
         callback(null,'./public/uploads/' + file.fieldname);    
    },
    filename:    
         function(req,file,callback){
         //  console.log(file.filename);
         callback(null,file.fieldname + '-'+ Date.now() + path.extname(file.originalname));
    } 
})

const delete_file = async(directory)=>{
  const file = `${config.FILE_DIRECTORY}\\${directory}` 
  fs.unlinkSync(file)
};
module.exports = {
    // respond,
    // error_Handler,
    // logparams,
    //  CheckUser,
    // authenticate_User,
    // Property_Validator,
    // // authenticate_Access_To_Employee_Controller,
    // authenticate_Access,
      storage,
      delete_file
    // upload
 }