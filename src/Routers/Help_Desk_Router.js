const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
//const notification =require('../Notification And Help Module/Controller/Notification Controller');
const help = require('../Notification And Help Module/Controller/Help Desk Controller')
const Response = require('../helpers/Response');
//const multer = require('multer');
const router = express.Router();






router.post("/continue", async (req,res)=>{
    try{
      //  if(req.query && req.query._id)
              await help.Continue_Help_Desk(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.get("/View/Self", async (req,res)=>{
    try{
      //  if(req.query && req.query._id)
              await help.view_Self_Help_Desk(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.get("/View/NonAssigned", async (req,res)=>{
    try{
      //  if(req.query && req.query._id)
              await help.view_Non_Assigned_Help_Desk(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.post("/assign", async (req,res)=>{
    try{
       if(req.query && req.query.session_Id)
              await help.mark_Session_As_Assigned(req,res)     //.catch(err=>{throw err});
      else 
           await Response.respond(req,res,{success: false , message: 'Id of the Help Session could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.post("/mark", async (req,res)=>{
    try{
          if(req.query && req.query._id)
              await help.mark_Session_As_Seen(req,res)     //.catch(err=>{throw err});
      else 
           await Response.respond(req,res,{success: false , message: 'Id of the Session could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.post("/update_status", async (req,res)=>{
    try{
      //  if(req.query && req.query._id)
              await help.update_status(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  // router.post("/kill", async (req,res)=>{
  //   try{
  //     //  if(req.query && req.query._id)
  //             await help.Kill_Help_Desk(req,res)     //.catch(err=>{throw err});
  //    //  else 
  //    //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
  //     //  .catch(err=>{throw err});
  //      }catch(err){ Response.error_Handler(req,res,err) }
  // })
  module.exports = router;