const express = require('express');
const ticket = require('../Transaction Managment Module/controllers/Ticket_Controller');
const transaction =require('../Transaction Managment Module/controllers/Transaction_controller');
const route = require('../Organization Module/Controllers/Route_controller');
const Respond = require('../helpers/Response');
//const multer=require('multer');
//const path = require('path');
const router = express.Router();

router.post("/Ticket/buy",async (req,res)=>{
    try{
      await ticket.buy_Ticket(req,res)   //.catch(err=>{throw err});
    }catch(err){ await Respond.error_Handler(req,res,err) }   
  });
  router.post("/Ticket/authenticate", async (req,res)=>{
    try{  
       //  await upload_Employee(req,res)  //,(err)=>{
        //  if(err)        res.send({success: false , message: err});
         //  else{
     //    if(req.query && req.query._id)
       //       {
                    await Respond.respond(req, res , await ticket.authenticate_Ticket(req,res) )   
         //       }    //.catch(err=>{throw err});
        // else 
        //        Respond.respond(req,res,{success: false , message: 'Id of the Ticket does not exist'})   //res.send({success: false , message: 'Id of the Employee does not exist'});    
        //       }
        //         })
       }catch(err){  Respond.error_Handler(req,res,err) }
});



router.post("/Transaction/register",async (req,res)=>{
    try{
      await transaction.register_travel_transaction( req,res)   //.catch(err=>{throw err});
    }catch(err){ await Respond.error_Handler(req,res,err) }   
  });
  router.get("/find_Route", async (req,res)=>{
    try{
         // await  ticket.authenticate_Ticket(req,res);
        //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
       if(req.query && req.query.limit ) {
         var limit = parseInt(req.query.limit);
          await route.find_Route(req,res,limit)
       }
       else 
           await Respond.respond(req,res,{success:false , message:'Request query could not be found'});    
     //  Respond.respond(req,res,b)
  }catch(err){    await Respond.error_Handler(req,res,err) }
}) 
module.exports = router;