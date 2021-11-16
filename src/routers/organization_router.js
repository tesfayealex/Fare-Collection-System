const express = require('express');
//const employee =require('../User Managment Module/controllers/Employee_controller');
const organization =require('../organization_module/controllers/organization_controller');
//const Branch =require('../Organization Module/controllers/Branch_controller');
const Respond = require('../helpers/response');
const storage = require('../helpers/utility.js')
const multer=require('multer');
const path = require('path');
const router = express.Router();
const util = require('util')
const upload_Organization = multer({
    storage: storage.storage,
    fileFilter: 
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
    }).single('Organization_Profile');
const upload  =  util.promisify(upload_Organization);
router.post("/register", async (req,res)=>{
    try{
          await upload (req,res)          
          await organization.register_Organization(req,res)     
       }catch (err){ Respond.error_Handler(req,res,err)}
  });
  router.get("/search", async (req,res)=>{
      try{
           if(req.query && req.query.limit) {
              limit = parseInt(req.query.limit);   
             await organization.find_Organization(req,res,limit)
           }
        //    .then(result=>{
        //         if(result)
        //                  res.json({success: true , message: result})
          else 
                await Respond.respond(req,res,{success: false , message: 'Request query could not be found'});            
         //  })
         //  .catch(err=>{throw err});
         }catch(err){ Respond.error_Handler(req,res,err)     }
  });
  router.post("/update", async (req,res)=>{
    try{
                await upload(req,res)   //,(err)=>{
         //  if(err)   res.send({success: false , message: err});
         //   else{
                if(req.query && req.query._id)
                       await organization.update_Organization(req,res)  //.catch(err=>{throw err});
                else 
                      await Respond.respond(req,res,{success: false , message: 'Id of the Organization does not exist'})    
               // }
               // })
        }catch(err){ await Respond.error_Handler(req,res,err) }
  });
  router.post("/deactivate", async (req,res)=>{
       try{
           if(req.query._id)    
              await organization.deactivate_Organization(req,res);
           else 
              await Respond.respond(req,res,{success: false, message: "Id of the Organization does not exist"})
              
       }catch(err){Respond.error_Handler(req,res,err)}
  });
  router.post("/activate", async (req,res)=>{
     try{
         if(req.query._id)    
            await organization.activate_Organization(req,res);
         else 
            await Respond.respond(req,res,{success: false, message: "Id of the Organization could not be found"})
            
     }catch(err){Respond.error_Handler(req,res,err)}
});
//   router.delete("/", async (req,res)=>{
//     try{
//       if(req.query._id)
//            await organization.delete_Organization(req,res)  //.catch(err=>{throw err});
//       else
//            await Respond.respond(req,res,{success: false , message: 'Id of the Organization does not exist'})       
//     }catch(err) { Respond.error_Handler(req,res,err)}
//   })
  module.exports = router;