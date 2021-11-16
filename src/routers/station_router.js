
const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
const station =require('../organization_module/controllers/station_controller');
const Respond = require('../helpers/response');
//const multer = require('multer');
const router = express.Router();
const ors = require('../config/openrouteservice');
//const { parse } = require('dotenv/types');




router.post("/register",async (req,res)=>{
    try{
      await station.register_Station( req,res)   //.catch(err=>{throw err});
    }catch(err){ await Respond.error_Handler(req,res,err) }   
  });
  router.get("/search", async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
      if(req.query && req.query.limit ) 
       {  
           limit = parseInt(req.query.limit);
          await station.find_Station(req,res, limit) 
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
              await station.update_Station(req,res)     //.catch(err=>{throw err});
       else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
  });
  router.post("/deactivate", async (req,res)=>{
    try{
        if(req.query._id)    
           await station.deactivate_Station(req,res);
        else 
           await Respond.respond(req,res,{success: false, message: "Id of the Station does not exist"})
           
    }catch(err){Respond.error_Handler(req,res,err)}
});
router.post("/activate", async (req,res)=>{
  try{
      if(req.query._id)    
         await station.activate_Station(req,res);
      else 
         await Respond.respond(req,res,{success: false, message: "Id of the Station could not be found"})
         
  }catch(err){Respond.error_Handler(req,res,err)}
});
  router.delete("/", async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await station.delete_Station(req,res)     //.catch(err=>{throw err});
       else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
  })
  router.get("/geo-locate", async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
      // if(req.query && req.query.address ) 
      //     await station.get_Geocode(req,res)
      // else 
      //     await Respond.respond(req,res,{success:false , message:'Request query could not be found'});    
    //  Respond.respond(req,res,b)
      await station.get_Geocode(req,res);
    //  await station.get_geo_with_locationiq(req,res)
    //  await station.get_geo_with_ors(req,res)
 }catch(err){    await Respond.error_Handler(req,res,err) }
 // }    
  });

  module.exports = router;