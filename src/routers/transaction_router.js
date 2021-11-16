const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
const transaction =require('../transaction_managment_module/controllers/transaction_controller');
const Respond = require('../helpers/response');
//const multer = require('multer');
const router = express.Router();




// router.post("/register",async (req,res)=>{
//     try{
//       await transaction.register_travel_transaction( req,res)   //.catch(err=>{throw err});
//     }catch(err){ await Respond.error_Handler(req,res,err) }   
//   });
  router.get("/find", async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
      if(req.query && req.query.limit ) {
          var limit = parseInt(req.query.limit)
          await transaction.find_Transaction(req,res, limit)
      }
      else 
          await Respond.respond(req,res,{success:false , message:'Request query could not be found'});    
    //  Respond.respond(req,res,b)
 }catch(err){    await Respond.error_Handler(req,res,err) }
 // }    
  });
  router.get("/analysis" , async (req,res)=>{
    try{
         await transaction.aggregate_worker(req,res);

       }catch(err) { Respond.error_Handler(req,res,err);   } 
  }) 
  module.exports = router;