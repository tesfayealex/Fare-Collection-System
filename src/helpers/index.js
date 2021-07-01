//const Employee = require('../User Managment Module/Models/Employee');
//const Employee_credential = require('../User Managment Module/Models/Employee_credential');

const Employee_credential = require('../User Managment Module/Controllers/Employee_credential_controller');
//const Role = require('../User Managment Module/Controllers/Role_Controller');
//const {Role} = require('./internal');
//const emp = require('../User Managment Module/Models/Employee_credential')
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const logger = require('../config/logger');
var ValidationErrors = {
    REQUIRED: 'required',
    UNIQUE: 'unique',
    MATCH: 'regexp',
    TYPE: 'type',
    ENUM: 'enum'
  };
    
const CheckUser =  roles => async (req,res,next)=> {
     try{
     const employee =  await Employee_credential.Search_For_Employee_Credential_IV({employee: req.user.employee}, 1 , 'role')
       //.then(employee=>{
      if(employee){
      if(roles.includes(employee.role.role_Id)){
                      next();
                               }  
      else {
               return  respond(req , res , {Success: false, message: 'Unautherized user'});
           }
                  }
         else {
               return respond(req , res , {Success: false, message: 'User data not found'});
              }
           // })
    // .catch(err=>{ throw err })
          // console.log(employee) ;
          // console.log(roles);
         // console.log(employee);
         
  }catch(err){  throw err }
}
const authenticate_User = passport.authenticate('jwt' , {session: false});

const Property_Validator = async (err) => {
    try{
    const errMessage = {};
    //   console.log(err.errors);
       for (var errName in err.errors)  {
         switch(err.errors[errName].kind) {       
           case ValidationErrors.REQUIRED:
             errMessage[errName] = 'Field is required';
             break;
           case ValidationErrors.UNIQUE:
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
             console.log('unidentified error has occured' + err.errors[errName].kind);
         }
      }
      if(errMessage)       return {success: false , message: errMessage}; 
      else  throw err
  //   return {success: false};
    }catch(err) {throw err}
   }
const authenticate_Access = async (access_For,employee_id)=>{
      try{    
      const  employee = await Employee_credential.search_For_Employee_Credential_IV({employee: employee_id},1,'role') //.populate('role')
      //  .catch(err=>{
      //          throw err
      //    })   
      if(employee.success){    
      access_name = Object.keys(access_For)[0];
      if(!Object.keys(access_For)[1])
            access_type = Object.keys(access_For[access_name])[0];
      else 
            access_type =  Object.keys(access_For)[1];     
     // console.log(access_name);
      //console.log(Object.keys(access_For)[1]);
      //console.log(access_type);
      
       result =  await require('../User Managment Module/Models/Role').find({_id: employee.message.role._id})
        //   .catch(err=>{
        // throw err
        //            })
       // console.log(result);           
        result = JSON.stringify(result);
        result = JSON.parse(result);  
       // console.log(access_For);
       // console.log(result);
       var role = result.message;
      if(result.success && role){
        for(var values in role.access){      
                // console.log(Object.keys(access_For)[0]);  
                if(values== Object.keys(access_For)[0] ){ 
               //    console.log(result.access[values]);
                   if(Object.keys(access_For)[1]){
                    for(var type in role.access[values]){
                     // console.log(type + '  ' +access_For[access_name])
                      if(type == access_For[access_name])
                             for(var inner in role.access[values][type]){
                                   // console.log(result.access[values]);  
                                    if(inner == access_type){
                                          return role.access[values][type][inner]
                                                             }
                           //return access_For[access_name][access_type]
                                                             }                     
                              }
                       return false
                     }
                   else{
                       for(var type in role.access[values]){
                             if(type == access_type)
                                 {
                                  return role.access[values][type]
                       }}
                     //  return result.access[values];
                   }      
                   //     console.log(key);
                   //else console.log(access_For);   
                  // Object.keys(values).forEach(item=>{
                  //   console.log(values[item]);
                  // })
                 //  for(var keys in result[values]){
                 //     console.log(keys);
                 //  }
            //  }
               /* for(values in result.access){
                     console.log(values)
              /*   if(values == Object.keys(access_For) ){
                            if(Object(result.access[values]) === result.access[values]){
                           for(var inner in result.access[values]){  
                             if(inner == access_For[access_name]){
                                return true;
                              }
                            }}else{
                                 return result.access[values]
                            }       
                      return false;
                  }
              }
              return false*/
                          }    
                        }
                    return false    
           }else{
                return false
           }
          }else{
                return false
          }
      }catch(err){
        //  console.log(err);
          throw err
      }                                  
}
/*const authenticate_Access_To_Employee_Controller = async (employee_Id,new_Employee_Id) =>{
    switch (employee_Id){
       case "1":
         if(new_Employee_Id == "2" || new_Employee_Id == "3"|| new_Employee_Id == "4") 
            return true
         break;
       case "2":
         if(new_Employee_Id == "5")  return true
         break;
       case "3":
         if(new_Employee_Id =="6")  return true
         break;
         default:
           return false;
       }
    return false
   } */   
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
/*const Check_Service_Provider= (data , employee_organization)=>{
    if()
}*/
// const upload = multer({
//   storage: storage
// }).any();

const logparams = async(req,res)=>{
    try{
   var user_id;
   var remote_user;   
  if(req.user)  {
  if(req.user.employee)  user_id = req.user.employee;
  else if (req.user.customer)   user_id = req.user.customer;
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
   var valid = await Property_Validator(err)
   //    .then(message=>{ this.respond(req,res,{success: false , message: message}) })
      if(valid)
         {
             respond(req,res,{success: false , message: valid})
         }
           }
     else {      
     res.status(400).json({success: false , message: 'An error has occured'})
           //  console.log(res.statusCode);
             var message = await logparams(req,res)
          //       .then(message=>{
          //  //  message.success = response_message.success
          //    message.message = err.stack
          //   // console.log(message);
          //    logger.error(message);  
          // } )
          if(message) {
             message.message = err.stack
             logger.error(message);   
          }
        }   
  //.catch(err=>{throw err})
     }catch(err){
    //  res.status(400).json({success: false , message: 'An error has occured'})
      logger.error(err);
     }
}

const respond = async (req,res,response_message)=>{
  try{
  res.status(200).json(response_message)
  var message = await logparams(req,res)
     if(message)
         {
          message.success = response_message.success
          message.message = response_message.message
        //  console.log(response_message);
          logger.info(message);
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
    CheckUser,
   authenticate_User,
   Property_Validator,
   // authenticate_Access_To_Employee_Controller,
   authenticate_Access,
    storage,
   // upload
}