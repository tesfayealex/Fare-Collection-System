const express = require('express');
const ticket = require('../Transaction Managment Module/controllers/Ticket_Controller');
const Transaction = require('../Transaction Managment Module/controllers/Transaction_controller')
const Respond = require('../helpers/Response');
//const multer=require('multer');
//const path = require('path');
const router = express.Router();



router.post("/Buy",async (req,res)=>{
    try{
      await ticket.buy_Ticket(req,res)   //.catch(err=>{throw err});
    }catch(err){ await Respond.error_Handler(req,res,err) }   
  });
  router.get("/find", async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
      if(req.query && req.query.limit) {
          limit  = parseInt(req.query.limit)
          await ticket.find_Ticket(req , res , {customer: req.user.customer},limit)
       }
     else 
        await Respond.respond(req,res,{success:false , message:'Request query could not be found'});    
    //  Respond.respond(req,res,b)
 }catch(err){    await Respond.error_Handler(req,res,err) }
 // }    
  });
  router.post("/create_qr_code", async(req,res)=>{
    try{
       Respond.respond(req,res, await ticket.generate_Ticket(req.body.entry_Station , req.body.exit_Station , req.body.route , req.body.ticket) )
    }catch(err) {throw err}
  })
  router.get('/view_transaction' , async(req,res)=>{
    try{
       await Transaction.view_Transaction(req,res,20);
     // Respond.respond(req,res, await ticket.generate_Ticket(req.body.entry_Station , req.body.exit_Station , req.body.route , req.body.ticket) )
   }catch(err) {throw err}
  })
//   router.post("/authenticate", async (req,res)=>{
//     try{  
//        //  await upload_Employee(req,res)  //,(err)=>{
//         //  if(err)        res.send({success: false , message: err});
//          //  else{
//          if(req.query && req.query._id)
//               {
//                     await Respond.respond(req, res , await ticket.authenticate_Ticket(req,res) )   
//                 }    //.catch(err=>{throw err});
//          else 
//                 Respond.respond(req,res,{success: false , message: 'Id of the Ticket does not exist'})   //res.send({success: false , message: 'Id of the Employee does not exist'});    
//         //       }
//         //         })
//        }catch(err){  Respond.error_Handler(req,res,err) }
// });

module.exports = router;