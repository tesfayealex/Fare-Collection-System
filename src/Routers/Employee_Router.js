
const express = require('express');
const employee =require('../User Managment Module/controllers/Employee_controller');
const credentials = require('../User Managment Module/Controllers/Employee_credential_controller');
const Respond = require('../helpers/Response');
const storage = require('../helpers/utility')
const multer=require('multer');
const path = require('path');
const router = express.Router();
const util = require('util')


const upload_Employee = multer({
     storage: storage.storage,
     filefilter: 
           function(req,file,callback){
             const filetype = /jpg|jpeg|png|gif/ ;
             const extname = filetype.test(path.extname(file.originalname).toLowerCase());
             const mimetype = filetype.test(file.mimetype);
             if(extname && mimetype){
                  callback(null,true);
             }
             else {
                  callback('Image only are allowed', true);
             }
     }
     }).single('Employee_Profile');
 const upload  =  util.promisify(upload_Employee);
router.post("/register", async (req , res)=>{
        try{
              await upload(req,res) 
            //  console.log(req.body)
               //,(err)=>{
             //   if(err)     res.send({success: false , message: err});
              //  else  // { 
                 //  console.log(req.body);
                 //  console.log(req.body.['name.first_Name']);
              await employee.register_Employee(req,res)
               //.then(result=>{
                            
                    //       }).catch(err=>{throw err});
                    //    }   
                    //                    })    
                                    //    upload_Employee(req,res,(err)=>{
                                    //     if(err)     res.send({success: false , message: err});
                                    //     else   { 
                                    //               employee.register_Employee(req,res).then(result=>{
                                                    
                                    //               }).catch(err=>{throw err});
                                    //            }   
                                    //                            })                                
          }catch (err){ 
               Respond.error_Handler(req,res,err); }
    });
router.get("/search",  async (req,res)=>{
        try{
             if(req.query && req.query.limit) {
               limit = parseInt(req.query.limit) 
               await employee.find_Employee(req,res , limit ,type = 1 )    //.catch(err=>{ throw err });
                }
             else 
                   await Respond.respond(req,res,{success: false , message: 'Request query could not be found'});      
           }catch(err){ Respond.error_Handler(req,res,err) }
    });
router.post("/update", async (req,res)=>{
        try{  
        //  console.log('heeeeeer')   
          await upload(req,res)  //,(err)=>{
            //  if(err)        res.send({success: false , message: err});
             //  else{
               console.log(req.file)  
             if(req.query && req.query._id) {
                  // console.log('kkkkkk')
                   await  employee.update_Employee(req,res)     //.catch(err=>{throw err});
             }
             else {
                 //  console.log('wwwwwhahah')
                   await  Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})   //res.send({success: false , message: 'Id of the Employee does not exist'});    
                 }
            //         })
           }catch(err){  Respond.error_Handler(req,res,err) }
    });
router.delete("/", async (req,res)=>{
        try{
             if(req.query && req.query._id)
                  await employee.delete_Employee(req,res)          //.catch(err=>{throw err});
                else 
                  await Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
           }catch(err) { Respond.error_Handler(req,res,err);   }
    })

 router.post("/Reset_Account", async (req,res)=>{
     try{
           console.log('1')
          if(req.query && req.query._id)
               await credentials.reset_Employee_Credential(req,res)          //.catch(err=>{throw err});
             else 
              await  Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
        }catch(err) { Respond.error_Handler(req,res,err);   } 
 })  
 router.post("/login" , async (req,res)=>{
     try{
          await credentials.login_Employee(req,res);
               //Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
        }catch(err) { Respond.error_Handler(req,res,err);   } 
 }) 
 
 router.post("/Change_Credential",  async (req,res)=>{
     try{
        //  if(req.query && req.query._id)
            await credentials.change_Employee_Credential(req,res)          //.catch(err=>{throw err});
          //    else 
          //      Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
        }catch(err) { Respond.error_Handler(req,res,err);   } 
 }) 
 router.post("/activate_credential", async (req,res)=>{
     try{
          if(req.query && req.query._id)
               await credentials.activate_Employee_Credential(req,res)          //.catch(err=>{throw err});
             else 
              await Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
        }catch(err) { Respond.error_Handler(req,res,err);   } 
 })   
 router.post("/deactivate_credential", async (req,res)=>{
     try{
          if(req.query && req.query._id)
               await credentials.deactivate_Employee_Credential(req,res)          //.catch(err=>{throw err});
             else 
               Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
        }catch(err) { Respond.error_Handler(req,res,err);   } 
 }) 
 router.get("/analysis" , async (req,res)=>{
     try{
         
          await employee.aggregate_worker(req,res);  
          
        }catch(err) { Respond.error_Handler(req,res,err);   } 
   })  
 module.exports = router;
 

