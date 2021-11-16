const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
//const notification =require('../Notification And Help Module/Controller/Notification Controller');
const help = require('../notification_and_help_module/controller/help_desk_controller')
const Response = require('../helpers/response');
//const multer = require('multer');
const router = express.Router();


router.post("/register", async (req,res)=>{
    try{
      //  if(req.query && req.query._id)
              await help.register_New_Help_Desk(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.post("/continue", async (req,res)=>{
    try{
        if(req.query && req.query.session_Id)
              await help.Continue_Help_Desk(req,res)     //.catch(err=>{throw err});
       else 
           await Response.respond(req,res,{success: false , message: 'Id of the Help Session could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.get("/View", async (req,res)=>{
    try{
      //  if(req.query && req.query._id)
              await help.view_Self_Help_Desk(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
 
  router.post("/mark", async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await help.mark_Session_As_Seen(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })

  module.exports = router;