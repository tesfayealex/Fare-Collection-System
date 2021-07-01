const express = require('express');
const customer =require('../User Managment Module/controllers/Customer_controller');
const wallet = require('../Wallet Module/Controllers/Wallet_controller');
const wallet_Transaction = require('../Wallet Module/Controllers/Wallet_Transaction_Controller');
const wallet_credential = require('../Wallet Module/Controllers/Wallet_credential_controller');
//const help = require('../helpers/index');
const Respond = require('../helpers/Response');
const storage = require('../helpers/utility');
const multer=require('multer');
const path = require('path');
const util = require('util')
const router = express.Router();



const upload_Customer = multer({
    storage: storage.storage,
    filefilter: 
          function(req,file,callback){
            const filetype = /jpg|jpeg|png|gif/ ;
            const extname = filetype.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetype.test(file.mimetype);
            if(extname && mimetype){
                 callback(null,true);
            }
            else {
                 callback('Image only are allowed', true);
            }
    }
    }).single('Customer_Profile');

const upload  =  util.promisify(upload_Customer);    
    

router.post("/register", async (req,res)=>{
        try{
              await upload(req,res)
               //,(err)=>{
             //   if(err)     res.send({success: false , message: err});
              //  else  // { 
              await customer.register_Customer(req,res)
               //.then(result=>{
                            
                    //       }).catch(err=>{throw err});
                    //    }   
                    //                    })    
                                    //    upload_Employee(req,res,(err)=>{
                                    //     if(err)     res.send({success: false , message: err});
                                    //     else   { 
                                    //               employee.register_Employee(req,res).then(result=>{
                                                    
                                    //               }).catch(err=>{throw err});
                                    //            }   
                                    //                            })                                
          }catch (err){ Respond.error_Handler(req,res,err); }
    });
router.get("/search", async (req,res)=>{
        try{
             if(req.query && req.query.limit) {
                   var limit = parseInt(req.query.limit);
                   await customer.find_Customer(req,res, limit)
                 }    //.catch(err=>{ throw err });
             else 
                   await Respond.respond(req,res,{success: false , message: 'Request query could not be found'});      
           }catch(err){ Respond.error_Handler(req,res,err) }
    });
router.post("/update",async (req,res)=>{
        try{  
             await upload(req,res)  //,(err)=>{
            //  if(err)        res.send({success: false , message: err});
             //  else{
             if(req.query && req.query._id)
                   await  customer.update_Customer(req,res)     //.catch(err=>{throw err});
             else 
                   await  Respond.respond(req,res,{success: false , message: 'Id of the Customer does not exist'})   //res.send({success: false , message: 'Id of the Employee does not exist'});    
            //       }
            //         })
           }catch(err){  Respond.error_Handler(req,res,err) }
    });
router.get("/find_Wallet", async (req,res)=>{
        try{
            if(req.query && req.query.limit) {
                 var limit = parseInt(req.query.limit)
                  await wallet.find_Wallet(req,res , limit)        //.catch(err=>{ throw err });
            }
             else 
                   await Respond.respond(req,res,{success: false , message: 'Request query could not be found'});   
             
           }catch(err) { Respond.error_Handler(req,res,err);   }
    })

 router.post("/Refill_Balance", async (req,res)=>{
     try{
          if(req.query && req.query._id)
               await wallet.refill_Balance(req,res)          //.catch(err=>{throw err});
             else 
               Respond.respond(req,res,{success: false , message: 'Request query could not be found'})       
        }catch(err) { Respond.error_Handler(req,res,err);   } 
 })  
 router.get("/view_Wallet_Transaction" , async (req,res)=>{
     try{
          if(req.query && req.query._id)
                await wallet_Transaction.view_Wallet_Transaction(req,res);
          else
                Respond.respond(req,res,{success: false , message: 'Request query could not be found'})
               //Respond.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
        }catch(err) { Respond.error_Handler(req,res,err);   } 
 })   
 router.post("/Reset_Account",async (req,res)=>{
      try{
           if(req.query && req.query._id)
                await wallet_credential.reset_Wallet_credential(req,res)          //.catch(err=>{throw err});
              else 
              Respond.respond(req,res,{success: false , message: 'Request query could not be found'})       
         }catch(err) { Respond.error_Handler(req,res,err);   } 
  })  
  router.post("/activate_credential", async (req,res)=>{
      try{
           if(req.query && req.query._id)
                await wallet_credential.Activate_Wallet(req,res)          //.catch(err=>{throw err});
              else 
                 await Respond.respond(req,res,{success: false , message: 'Request query could not be found'})       
         }catch(err) { Respond.error_Handler(req,res,err);    } 
  })   
  router.post("/deactivate_credential", async (req,res)=>{
      try{
           if(req.query && req.query._id)
                await wallet_credential.Deactivate_Wallet(req,res)          //.catch(err=>{throw err});
              else 
                await Respond.respond(req,res,{success: false , message: 'Id of the Customer does not exist'})       
         }catch(err) {Respond.error_Handler(req,res,err);   } 
  })
  router.get("/analysis", async (req,res)=>{
     try{
           
           await Respond.respond(req,res,{success: false , message:  await customer.Registered_customer_aggregate(req.body)});   
           
        }catch(err) { Respond.error_Handler(req,res,err);   }
 }) 
 router.get("/analysis" , async (req,res)=>{
     try{
        await customer.aggregate_worker(req,res);        
        }catch(err) { Respond.error_Handler(req,res,err);   } 
   })    
  
//   router.post("/suspend_credential", async (req,res)=>{
//       try{
//            if(req.query && req.query._id)
//                 await wallet_credential.Suspend_Wallet(req,res)          //.catch(err=>{throw err});
//               else 
//                 await Respond.respond(req,res,{success: false , message: 'Id of the Customer does not exist'})       
//          }catch(err) { Respond.error_Handler(req,res,err);    } 
//   }) 
 
//  router.get("/check_Balance" , async (req,res)=>{
//      try{
//         if(req.body.amount)
//           {
//               await Respond.respond(req, res , await wallet.check_Balance(req.body.amount,req) )   
//           }    //.catch(err=>{throw err});
//    else 
//           Respond.respond(req,res,{success: false , message: 'Id of the Ticket does not exist'}) 
//      }catch(err) { Respond.error_Handler(req,res,err)}
//  }) 

 module.exports = router;