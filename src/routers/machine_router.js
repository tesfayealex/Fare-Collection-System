const express = require('express');
//const employee =require('../User Managment Module/controllers/Employee_controller');
const machine =require('../organization_module/controllers/machine_controller');

//const Branch =require('../Organization Module/controllers/Branch_controller');
const Respond = require('../helpers/response');
const router = express.Router();

router.post("/register", async (req,res)=>{
    try{       
          await machine.register_Machine(req,res)     
       }catch (err){ Respond.error_Handler(req,res,err)}
  });
  router.get("/search", async (req,res)=>{
      try{
           if(req.query && req.query.limit) {
              limit = parseInt(req.query.limit);   
             await machine.find_Machine(req,res,limit)
           }
        //    .then(result=>{
        //         if(result)
        //                  res.json({success: true , message: result})
          else 
                await Respond.respond(req,res,{success: false , message: 'Request query could not be found'});            
         //  })
         //  .catch(err=>{throw err});
         }catch(err){ Respond.error_Handler(req,res,err)     }
  });
  router.post("/update", async (req,res)=>{
    try{
              //  await upload(req,res)   //,(err)=>{
         //  if(err)   res.send({success: false , message: err});
         //   else{
                if(req.query && req.query._id)
                       await machine.update_Machine(req,res)  //.catch(err=>{throw err});
                else 
                      await Respond.respond(req,res,{success: false , message: 'Id of the Machine does not exist'})    
               // }
               // })
        }catch(err){ await Respond.error_Handler(req,res,err) }
  });
  router.post("/deactivate", async (req,res)=>{
     try{
         if(req.query._id)    
            await machine.deactivate_Machine(req,res);
         else 
            await Respond.respond(req,res,{success: false, message: "Id of the Machine does not exist"})
            
     }catch(err){Respond.error_Handler(req,res,err)}
});
router.post("/activate", async (req,res)=>{
   try{
       if(req.query._id)    
          await machine.activate_Machine(req,res);
       else 
          await Respond.respond(req,res,{success: false, message: "Id of the Machine could not be found"})
          
   }catch(err){Respond.error_Handler(req,res,err)}
});
  router.delete("/", async (req,res)=>{
    try{
      if(req.query._id)
           await machine.delete_Machine(req,res)  //.catch(err=>{throw err});
      else
           await Respond.respond(req,res,{success: false , message: 'Id of the Machine does not exist'})       
    }catch(err) { Respond.error_Handler(req,res,err)}
  });

  router.get("/analysis" , async (req,res)=>{
       try{
         
          await machine.aggregate_worker(req,res)  
               
          }catch(err) { Respond.error_Handler(req,res,err);   } 
     })
  module.exports = router;