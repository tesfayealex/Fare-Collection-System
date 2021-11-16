
const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
const route =require('../organization_module/controllers/route_controller');
const Respond = require('../helpers/response');
//const multer = require('multer');
const router = express.Router();
const storage = require('../helpers/utility.js')
const multer=require('multer');
const path = require('path');
const util = require('util')
const upload_Organization = multer({
    storage: storage.storage,
    fileFilter: 
          function(req,file,callback){
               const filetype = /geojson/ ;
              // console.log(file.mimetype)
               const extname = filetype.test(path.extname(file.originalname).toLowerCase());
           //    const mimetype = filetype.test(file.mimetype);
             //  console.log(extname)
              // console.log(mimetype)
               if(extname){
                    callback(null,true);
               }
               else {
                    callback('Geojson file only are allowed', true);
               }
    }
    }).single('Route_File');    
const upload  =  util.promisify(upload_Organization);
router.post("/register",async (req,res)=>{
    try{
      await upload (req,res)
      await route.register_Route( req,res)   //.catch(err=>{throw err});
    }catch(err){ await Respond.error_Handler(req,res,err) }   
  });
  router.get("/search",async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
      if(req.query && req.query.limit ) {
        var limit = parseInt(req.query.limit);
         await route.find_Route(req,res,limit)
      }
      else 
          await Respond.respond(req,res,{success:false , message:'Request query could not be found'});    
    //  Respond.respond(req,res,b)
 }catch(err){    await Respond.error_Handler(req,res,err) }
 // }    
  });
  router.post("/update", async (req,res)=>{
    try{

        if(req.query && req.query._id){
          await upload(req, res)
          await route.update_Route(req,res)     //.catch(err=>{throw err});
          
            }
              else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Route could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
  });
  router.post("/deactivate", async (req,res)=>{
    try{
        if(req.query._id)    
           await route.deactivate_Route(req,res);
        else 
           await Respond.respond(req,res,{success: false, message: "Id of the Organization does not exist"})
           
    }catch(err){Respond.error_Handler(req,res,err)}
});
router.post("/activate", async (req,res)=>{
  try{
      if(req.query._id)    
         await route.activate_Route(req,res);
      else 
         await Respond.respond(req,res,{success: false, message: "Id of the Organization could not be found"})
         
  }catch(err){Respond.error_Handler(req,res,err)}
});
  router.delete("/",  async (req,res)=>{
    try{
        if(req.query && req.query._id)
              await route.delete_Route(req,res)     //.catch(err=>{throw err});
              route.
       else 
            await Respond.respond(req,res,{success: false , message: 'Id of the Route could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Respond.error_Handler(req,res,err) }
  })

  router.get("/draw_route", async (req,res)=>{
    try{
      await route.create_route_file(req,res);
     }catch(err){    await Respond.error_Handler(req,res,err) }
      })
 
module.exports = router;