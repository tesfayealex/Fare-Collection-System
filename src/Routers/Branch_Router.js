
const express = require('express');
//const employee =require('../User Managment Module/controllers/Employee_controller');
//const organization =require('../Organization Module/controllers/Organization_controller');
const branch =require('../organization_module/controllers/branch_controller');
//const help = require('../helpers/index');
const Respond = require('../helpers/response');
//const multer=require('multer');
//const path = require('path');
const router = express.Router();



router.post("/register",async (req,res)=>{
    try{
         await branch.register_Branch(req,res)     //.catch(err=>{throw err});
      }catch (err){    await  Respond.error_Handler(req,res,err) }
});
router.get("/search",async (req,res)=>{
     try{
          // await  ticket.authenticate_Ticket(req,res);
         //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
       // console.log(req.user)
        if(req.query && req.query.limit ) 
           {
            limit = parseInt(req.query.limit);
            await branch.find_Branch(req,res, limit)
           }
        else 
            await Respond.respond(req,res,{success:false , message:'Request query could not be found'});    
      //  Respond.respond(req,res,b)
   }catch(err){   await  Respond.error_Handler(req,res,err) }
});
router.post("/update",async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await branch.update_Branch(req,res)     //.catch(err=>{throw err});
       else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Bus could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
});
router.post("/deactivate", async (req,res)=>{
    try{
        if(req.query._id)    
           await branch.deactivate_Branch(req,res);
        else 
           await Respond.respond(req,res,{success: false, message: "Id of the Branch could not be found"})
           
    }catch(err){Respond.error_Handler(req,res,err)}
});
router.post("/activate", async (req,res)=>{
  try{
      if(req.query._id)    
         await branch.activate_Branch(req,res);
      else 
         await Respond.respond(req,res,{success: false, message: "Id of the Branch could not be found"})
         
  }catch(err){Respond.error_Handler(req,res,err)}
});
router.delete("/", async (req,res)=>{
    try{
           await branch.delete_Branch(req,res)   //.catch(err=>{throw err});
       }catch(err) { Respond.error_Handler(req,res,err)}
})
module.exports = router;