const logger = require('../config/logger');
var ValidationErrors = {
    REQUIRED: 'required',
    UNIQUE: 'unique',
    MATCH: 'regexp',
    TYPE: 'type',
    ENUM: 'enum'
  };

  const Property_Validator = async (err) => {
    try{
    const errMessage = {};
    //   console.log(err.errors);
       //console.log(err)
       for (var errName in err.errors)  {
         switch(err.errors[errName].kind) {       
           case ValidationErrors.REQUIRED:
           // console.log('here6');
             errMessage[errName] = 'Field is required';
             break;
           case ValidationErrors.UNIQUE:
           // console.log('here7');
             errMessage[errName] = 'Field is not unique';
             break;
             case ValidationErrors.MATCH:
             errMessage[errName] = 'Field contains invalid characters'
             break;
             case ValidationErrors.TYPE:
             errMessage[errName] = 'Field contains wrong input type'
             break;
             case ValidationErrors.ENUM:
              errMessage[errName] = 'Field contains wrong enumrators'
              break;
             default:
              throw err
           }
      }
      if(errMessage)       return {success: false , message: errMessage}; 
      else  throw err
  //   return {success: false};
    }catch(err) {throw err}
   } 


const logparams = async(req,res)=>{
    try{
   var user_id;
   var remote_user;   
  if(req.user)  {
  if(req.user.employee)  user_id = req.user.employee;
  else if (req.user.customer)  user_id = req.user.customer; 
  if(req.user.username)     remote_user = req.user.username
                 }
  else {
        user_id ='unidentified'
       remote_user = 'unidentified'
        }
     // console.log(req.user.username)   
     return { method: req.method , url: req.originalUrl , status : res.statusCode , result_length: res.get('Content-Length') , user_agent: req.header('user-agent') , remote_addr: req.ip, user_id: user_id , remote_user: remote_user} //user_id: req.user.employee || req.user.customer, remote_user: req.user.username || undefined}// success: res.success}
}
catch(err){throw err}
}

const error_Handler= async (req , res, err)=>{
   try{
   if(err.errors){
    //  console.log('here13');
   var valid = await Property_Validator(err)
   //    .then(message=>{ this.respond(req,res,{success: false , message: message}) })
  // console.log('here4');
            // console.log(valid.message)
     respond(req,res, valid)
         }
     else {
      // console.log(err)
       res.status(400).json({success: false , message: 'An error has occured'})
      // console.log('here14')
             var message = await logparams(req,res)
          //       .then(message=>{
          //  //  message.success = response_message.success
          //    message.message = err.stack
          //   // console.log(message);
          //    logger.error(message);  
          // } )
         // console.log('here')
          if(message) {
             if(err.stack)
                message.message = err.stack
             else 
                message.message = err;   
          //   console.log('here2')
         // console.log(message)
             logger.logger.error(message);   
          }
        }   
  //.catch(err=>{throw err})
     }catch(err){
       // if(!res.headersSent)  
            res.status(400).json({success: false , message: 'An error has occured'})
          //  console.log('here7')
        logger.logger.error('document Field validity check failed - ' + err);
     }
}



const respond = async (req,res,response_message)=>{
  try{
  res.status(200).json(response_message)
  var logs = await logparams(req,res)
     if(logs)
         {
          logs.success = response_message.success
          var message = response_message.message;
        //   {
          //    console.log(message);
           // console.log(typeof(message) == 'object')
        //   }
       if(typeof(message) != 'object')
                logs.message = response_message.message
       else
               logs.message = 'Object sent successfully'      
         logger.logger.info(logs);
          return 
         }
      else{
           throw new Error('Log parameters have shown an Error') 
        }
  // .then(message=>{
  //        message.success = response_message.success
  //        message.message = response_message.message
  //        logger.info(message);
  //                })
  // .catch(err=>{ throw err})
       
      }  catch(err) {throw err}  
}    

module.exports = {
    respond,
    error_Handler,
    logparams,
    Property_Validator,
    //authenticate_Access_To_Employee_Controller,
    // authenticate_Access,
    // storage,
   // upload
}