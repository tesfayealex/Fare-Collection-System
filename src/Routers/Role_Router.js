
const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
const role =require('../user_managment_module/controllers/role_controller');
const Response = require('../helpers/response');
const { role_chooser } = require('../user_managment_module/controllers/role_controller');
//const multer = require('multer');
const router = express.Router();





router.post("/register",async (req,res)=>{
    try{
      await role.register_new_Role( req,res)   //.catch(err=>{throw err});
    }
    catch(err){ await Response.error_Handler(req,res,err) }   
  });
  router.get("/search", async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
      if(req.query && req.query.limit ) {
                limit = parseInt(req.query.limit);  
               await role.find_Role(req,res, limit)
             }
      else 
          await Response.respond(req,res,{success:false , message:'Request query could not be found'});    
    //  Response.respond(req,res,b)
 }catch(err){    await Response.error_Handler(req,res,err) }
 // }    
  });
  router.post("/update", async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await role.update_Role(req,res)     //.catch(err=>{throw err});
       else 
            await Response.respond(req,res,{success: false , message: 'Id of the Role could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  });
  router.get("/access_list",async (req,res)=>{
    try{
           await Response.respond(req,res, {success: true , message: role.role_chooser()})     //.catch(err=>{throw err});
     
    //      await Response.respond(req,res,{success: false , message: 'Id of the Role could not be found'}) 
    //  .catch(err=>{throw err});
     }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.delete("/", async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await station.delete_Station(req,res)     //.catch(err=>{throw err});
       else 
            await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })

  module.exports = router;