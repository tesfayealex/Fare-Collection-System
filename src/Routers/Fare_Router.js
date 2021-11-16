
const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
const fare =require('../transaction_managment_module/controllers/fare_controller');
const Respond = require('../helpers/response');
//const multer = require('multer');
const router = express.Router();




  router.post("/register",async (req,res)=>{
    try{
      await fare.register_New_Fare(req,res)   //.catch(err=>{throw err});
    }catch(err){ await Respond.error_Handler(req,res,err) }   
  });
  router.get("/search", async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
      if(req.query && req.query.limit ) {
          var limit =  parseInt(req.query.limit)
          await fare.find_Fare(req, res , limit)
      }
          else 
          await Respond.respond(req,res,{success:false , message:'Request query could not be found'});    
    //  Respond.respond(req,res,b)
 }catch(err){    await Respond.error_Handler(req,res,err) }
 // }    
  });
  router.post("/update", async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await fare.update_Fare(req,res)     //.catch(err=>{throw err});
       else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Fare could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
  });
  router.post("/activate", async (req,res)=>{
    try{
        if(req.query && req.query.fare_Id)
              await fare.activate_Fare_Amount(req,res)     //.catch(err=>{throw err});
       else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Fare could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
  });
  router.delete("/", async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await fare.delete_Fare(req,res)     //.catch(err=>{throw err});
              route.
       else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Fare could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
  })
  module.exports = router;