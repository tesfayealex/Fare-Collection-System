
const express = require('express');
//const employee = require('../User Managment Module/controllers/Employee_controller');
//const bus = require('../Organization Module/controllers/Bus_controller');
const notification =require('../notification_and_help_module/controller/notification_controller');
//const help = require('../Notification And Help Module/Controller/Help Desk Controller')
const Response = require('../helpers/response');
//const multer = require('multer');
const router = express.Router();
const storage = require('../helpers/utility')
const multer=require('multer');
const path = require('path');
const util = require('util')


// const upload_File = multer({
//     storage: storage.storage,
//     filefilter: 
//           function(req,file,callback){
//             const filetype = /pdf|doc|docx|ppt/ ;
//             const extname = filetype.test(path.extname(file.originalname).toLowerCase());
//             const mimetype = filetype.test(file.mimetype);
//             if(extname && mimetype){
//                  callback(null,true);
//             }
//             else {
//                  callback('document only are allowed', true);
//             }
//     }
//     }).single('Notification_File');
// const upload  =  util.promisify(upload_File);



router.post("/register",async (req,res)=>{
    try{
     // await upload(req,res) 
      await notification.register_Notification( req,res)   //.catch(err=>{throw err});
    }
    catch(err){ await Response.error_Handler(req,res,err) }   
  });
  router.get("/check", async (req,res)=>{
    try{
        // await  ticket.authenticate_Ticket(req,res);
       //await ticket.generate_Ticket('megenagna' , 'tulu dimtu');
     // console.log(req.user)
    //  if(req.query && req.query.limit ) {
      //          limit = parseInt(req.query.limit);  
               await notification.check_New_Notification(req,res)
        //     }
      //else 
       //   await Response.respond(req,res,{success:false , message:'Request query could not be found'});    
    //  Response.respond(req,res,b)
 }catch(err){    await Response.error_Handler(req,res,err) }
 // }    
  });
  router.get("/view", async (req,res)=>{
    try{
      //  if(req.query && req.query._id)
              await notification.view_Notification(req,res)     //.catch(err=>{throw err});
     //  else 
     //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.post("/mark", async (req,res)=>{
    try{
        if(req.query && req.query.session_Id)
              await notification.mark_Session_As_Seen(req,res)     //.catch(err=>{throw err});
        else 
           await Response.respond(req,res,{success: false , message: 'Id of the Session could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.get("/find", async (req,res)=>{
    try{
        if(req.query && req.query.session_Id && req.query.limit) {
                 var limit = parseInt(req.query.limit)
                 await notification.find_Notifications(req,res,limit) 
            }    //.catch(err=>{throw err});
       else 
            await Response.respond(req,res,{success: false , message: 'Id of the Session could not be found'}) 
      //  .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
  router.get("/get_custom_notification", async (req,res)=>{
    try{
      if(req.query&& req.query.limit) {
                 var limit = parseInt(req.query.limit)
                 await notification.search_for_Custom_Notification_EV(req,res,limit) 
         }    //.catch(err=>{throw err});
        else 
            await Response.respond(req,res,{success: false , message: 'Id of the Session could not be found'}) 
      // .catch(err=>{throw err});
       }catch(err){ Response.error_Handler(req,res,err) }
  })
//   router.get("/Help_Desk/Answer", async (req,res)=>{
//     try{
//       //  if(req.query && req.query._id)
//               await help.Continue_Help_Desk(req,res)     //.catch(err=>{throw err});
//      //  else 
//      //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
//       //  .catch(err=>{throw err});
//        }catch(err){ Response.error_Handler(req,res,err) }
//   })
//   router.get("/Help_Desk/View/Self", async (req,res)=>{
//     try{
//       //  if(req.query && req.query._id)
//               await help.view_Self_Help_Desk(req,res)     //.catch(err=>{throw err});
//      //  else 
//      //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
//       //  .catch(err=>{throw err});
//        }catch(err){ Response.error_Handler(req,res,err) }
//   })
//   router.get("/Help_Desk/View/NonAssigned", async (req,res)=>{
//     try{
//       //  if(req.query && req.query._id)
//               await help.view_Non_Assigned_Help_Desk(req,res)     //.catch(err=>{throw err});
//      //  else 
//      //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
//       //  .catch(err=>{throw err});
//        }catch(err){ Response.error_Handler(req,res,err) }
//   })
//   router.get("/Help_Desk/mark", async (req,res)=>{
//     try{
//       //  if(req.query && req.query._id)
//               await help.mark_Session_As_Seen(req,res)     //.catch(err=>{throw err});
//      //  else 
//      //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
//       //  .catch(err=>{throw err});
//        }catch(err){ Response.error_Handler(req,res,err) }
//   })
//   router.get("/Help_Desk/close", async (req,res)=>{
//     try{
//       //  if(req.query && req.query._id)
//               await help.close_Help_Desk(req,res)     //.catch(err=>{throw err});
//      //  else 
//      //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
//       //  .catch(err=>{throw err});
//        }catch(err){ Response.error_Handler(req,res,err) }
//   })
//   router.get("/Help_Desk/kill", async (req,res)=>{
//     try{
//       //  if(req.query && req.query._id)
//               await help.Kill_Help_Desk(req,res)     //.catch(err=>{throw err});
//      //  else 
//      //       await Response.respond(req,res,{success: false , message: 'Id of the Station could not be found'}) 
//       //  .catch(err=>{throw err});
//        }catch(err){ Response.error_Handler(req,res,err) }
//   })
  module.exports = router;
  