const express = require('express');

const help = require('../helpers/index');
const router = express.Router();




// router.post("/login" , async (req,res)=>{
//     try{
//          await wallet_credential.login_Customer(req,res);
//               //help.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
//        }catch(err) { help.error_Handler(req,res,err);   } 
// })



// router.post("/Reset_Account",async (req,res)=>{
//     try{
//          if(req.query && req.query._id)
//               await wallet_credential.reset_Wallet_credential(req,res)          //.catch(err=>{throw err});
//             else 
//               help.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
//        }catch(err) { help.error_Handler(req,res,err);   } 
// })  

router.post("/activate_credential", async (req,res)=>{
    try{
         if(req.query && req.query._id)
              await wallet_credential.Activate_Wallet(req,res)          //.catch(err=>{throw err});
            else 
              help.respond(req,res,{success: false , message: 'Id of the Customer does not exist'})       
       }catch(err) { help.error_Handler(req,res,err);   } 
})   
router.post("/deactivate_credential", async (req,res)=>{
    try{
         if(req.query && req.query._id)
              await wallet_credential.Deactivate_Wallet(req,res)          //.catch(err=>{throw err});
            else 
              help.respond(req,res,{success: false , message: 'Id of the Customer does not exist'})       
       }catch(err) { help.error_Handler(req,res,err);   } 
}) 
router.post("/suspend_credential", async (req,res)=>{
    try{
         if(req.query && req.query._id)
              await wallet_credential.Suspend_Wallet(req,res)          //.catch(err=>{throw err});
            else 
              help.respond(req,res,{success: false , message: 'Id of the Customer does not exist'})       
       }catch(err) { help.error_Handler(req,res,err);   } 
}) 
module.exports = router;