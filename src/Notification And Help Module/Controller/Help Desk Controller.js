

var help = require('../Model/Help');
const Auth = require('../../helpers/authenticator');
const Respond = require('../../helpers/Response');
const crypto = require('crypto')

module.exports = {
  async register_New_Help_Desk(req , res){
    try {
        var help_Object = await this.create_Help_Desk_Object(req)
      if(req.user && req.user.customer) 
             {
              help_Object.seen = false;
              help_Object.sender = 'customer';
              help_Object.rate = 0;
              help_Object.status = 'open';
              help_Object.assigned = false;
              help_Object.session_Id = await crypto.randomBytes(16).toString('hex'); 
              if(help_Object.employee)   delete help_Object.employee;
              if(help_Object.reason)   delete help_Object.reason;

              var result = await help.create(help_Object)
              if(result)
               return await Respond.respond(req, res,{success: true , message: result._id});
             else 
               return await Respond.respond(req, res,{success: false , message: `Session is not registered`});
                }
           else 
                    throw new Error('Unidentified user have been found') 
          }
    catch (err) {  throw err}        
  }, 
   async Continue_Help_Desk(req, res){
   var session = await this.search_for_Help_Desk_IV({session_Id: req.query.session_Id , assigned: true}) 
   var checker = await this.search_for_Help_Desk_IV({session_Id: req.query.session_Id , other: {$or: [{status:'closed'} , {status: 'killed'}]}})
     if(session.success)
            {
              if(!checker.success){
     var help_Object = await this.create_Help_Desk_Object(req)
    help_Object.session_Id = req.query.session_Id;
    help_Object.seen = false;
    help_Object.rate = 0;
    help_Object.assigned = session.message.assigned;
    help_Object.employee = session.message.employee;
    help_Object.status = session.message.status;

    if(req.user.customer)
              {
                   help_Object.customer = req.user.customer
                   help_Object.sender = 'customer';
                }
    if(req.user.employee) {
                   help_Object.employee = req.user.employee;
                   help_Object.assigned = true;
                   help_Object.customer = session.message.customer;
                   help_Object.sender = 'employee';   
                }        
     var result = await help.create(help_Object)
          if(result)
          return await Respond.respond(req, res,{success: true , message: result.session_Id});
        else 
          return await Respond.respond(req, res,{success: false , message: `Session is not registered`});  
            }
       else
              return await Respond.respond(req, res,{success: false , message: `Session Id has been ${checker.message.status}`});  
           }
       else
            return await Respond.respond(req, res,{success: false , message: `Session Id does not exist`});     
   },
    async view_Non_Assigned_Help_Desk(req , res , limit = 20){
        try {
              var help_desk = {assigned: 'false'}
            var session = await this.search_for_Help_Desk_IV(help_desk,limit) 
                    return await Respond.respond(req , res , session) 
            }
        catch (err) {  throw err}        
      },  
      async view_Self_Help_Desk(req , res , limit = 20){
        try {
              var sessions;
           if(req.user && req.user.customer) 
             {
                 sessions = await this.search_for_Help_Desk_IV({customer: req.user.customer},limit)
                    return await Respond.respond(req , res , sessions) 
             }
           else if (req.user && req.user.employee){  
             sessions = await this.search_for_Help_Desk_IV({employee: req.user.employee},limit)
                    return await Respond.respond(req , res , sessions)       
                }
           else 
                    throw new Error('Unidentified user have been found')  
            }
        catch (err) {  throw err}        
      }, 
      async find_Help_Desk(req , res , limit = 1){
        try {
             var help_desk =  await this.search_for_Help_Desk_EV(req, req.query , limit)
                return await Respond.respond(req,res, help_desk)
            } 
    catch (err) {  throw err}
      }, 
    async search_for_Help_Desk_EV(req , data , limit = 1){
        try{
            if(await Auth.authenticate_Access({help_desk: {viewer: true}},req.user.employee))
                 var result = await this.search_for_Help_Desk_IV(data , limit)
                        if(result)  
                           return result      
                else
                      return {success: false, message: "attempt to search for help desk with out access"};
        }catch(err){
            throw err
        }
    }, 
    async search_for_Help_Desk_IV(data , limit = 1 , populate = '', select='-__v'){
        try{
            var query_Object = {};  
            if(data.customer)
                 query_Object.customer = data.customer;
            if(data.session_Id)
             query_Object.session_Id = data.session_Id; 
            if(data.employee)
              query_Object.employee = data.employee; 
            if(data.customer)
              query_Object.customer = data.customer;   
            if(data.status) 
              query_Object.user_access_type = data.user_access_type; 
            if(data._id)
                 query_Object._id = data._id 
            if(data.other)
                 query_Object = data.other 
            if(data.assigned)
                 query_Object.assigned = data.assigned;       
        if(populate == '')
        populate =[ {path: 'customer' , select: '_id name customer_Id'} , {path: 'employee' , select: '_id name employee_Id'}]     
         var result = await help.find(query_Object)    //.catch(err=>{throw err})
              .populate(populate)
              .limit(limit)
              .select('-createdAt -status -updatedAt -__v')
                if(result.length == 1) {
                    result = result.reduce((hel)=> {return hel})
                    return {success:true, message: result};
                  }
              else if(result.length > 1 )   
                    return {success: true, message: result};
              else
                    return {success: false , message: 'Help Session is not found'};                     
        }catch(err){throw err}      
    }, 
    async update_status(req,res){
    try{
        var session = await this.search_for_Help_Desk_IV({session_Id: req.query.session_Id}) 
         if(session.success){
             if(JSON.stringify(session.message.employee) == JSON.stringify(req.user.employee)) 
                 {
            var help_desk_Object = await this.create_Help_Desk_Object(req);
        let help_desk = {
             seen: false,
             sender: 'employee',
             rate: session.message.rate,
             assigned: session.message.assigned,
             session_Id: session.message.session_Id,
             employee: session.message.employee,
             customer: session.message.customer,
             message: 'none',
             reason: help_desk_Object.reason || 'None',
             status: help_desk_Object.status || 'closed'
                       }
       var result = await help.create(help_desk)
         if(result !== 0)
           return await Respond.respond(req , res , {success:true, message: `Help desk with Session Id - ${session.message.session_Id}  have been ${help_desk_Object.status}`});
         else 
           return await Respond.respond(req , res , {success: false, message: 'Help Session is not found'});     
                      }
                 else 
                    throw new Error('Session do not belong to User')        
              }
         else 
                return await Respond.respond(req, res , {success: false, message: 'Session is not found'});
         }  catch(err){ throw err }
               }, 
      async mark_Session_As_Assigned(req,res){
        try{
          var session = await this.search_for_Help_Desk_IV({session_Id: req.query.session_Id })  //.catch(err=>{throw err});
          if(session.success){
            if(session.message.assigned == false){
                       var help_desk = {
                                 
                                    assigned : true  ,
                                    seen: true,
                                    employee: req.user.employee
                                 
                                  }
                 var result = await help.findByIdAndUpdate(session.message._id,help_desk,{new: true, runValidators: true, context:'query'})
                   if(result.length !== 0)
                     return await Respond.respond(req , res , {success:true, message: `Help desk with Session Id - ${session.message.session_Id}  have been assigned`});
                   else 
                     return await Respond.respond(req , res , {success: false, message: 'Help Session is not found'});     
            
                             }
                                       else
                                     return await Respond.respond(req, res , {success: false , message: "help desk  is already assigned"});                                  
                                 }
                        else
                            return await Respond.respond(req, res , {success: false , message: "help desk could not be found "});
                   }  catch(err){ throw err }
      } ,        
      async mark_Session_As_Seen(req,res){
                try{
            var session = await this.search_for_Help_Desk_IV({_id: req.query._id , assigned: true})
             if(session.success){
                     
                  if(req.user.employee)
                        if( JSON.stringify(session.message.employee) != JSON.stringify(req.user.employee)) 
                                throw new Error('Session Id does not belong to user')  
                  if(req.user.customer)
                        if( JSON.stringify(session.message.customer) != JSON.stringify(req.user.customer))                
                               throw new Error('Session Id does not belong to user')  
                    var help_desk = {
                                      seen: true,
                                   
                                    }
                   var result = await help.findByIdAndUpdate(session.message._id,help_desk,{new: true, runValidators: true, context:'query'})
                     if(result.length !== 0)
                       return await Respond.respond(req , res , {success:true, message: `Help desk with Session Id - ${session.message.session_Id}  have been marked as seen`});
                     else 
                       return await Respond.respond(req , res , {success: false, message: 'Help Session is not found'});     
                                        }
                          else
                              return await Respond.respond(req, res , {success: false , message: "attempt to mark help session as seen with out access"});
                        
                     }  catch(err){ throw err }
                           },              
//  async close_Help_Desk(req,res){
//      try{
//     var session = await this.search_for_Help_Desk_IV({session_Id: req.query.session_Id})  //.catch(err=>{throw err});
//          if(session.success && session.message.employee == req.user.employee){
//              var help_desk_Object = await this.create_Help_Desk_Object(req);
//             if( await Auth.authenticate_Access({help_desk: {proccess: true }},req.user.employee)){
//         let help_desk = {
//             reason: help_desk_Object.reason || 'None',
//             status: 'closed'
//                        }
                       
//        var result = await help.findByIdAndUpdate(session.message._id,{$set: help_desk},{new: true, runValidators: true, context:'query'})
//       // .then(result=>{
//          if(result.length !== 0)
//            return await Respond.respond(req , res , {success:true, message: `Help desk with Session Id - ${session.message.session_Id}  have been closed`});
//          else 
//            return await Respond.respond(req , res , {success: false, message: 'Help Session is not found'});     
//     //                   })
//     //    .catch(err=>{throw err})
//                             }
//               else//{
//                   return await Respond.respond(req, res , {success: false , message: "attempt to close help desk with out access"});
//              // }
//         }
//          else //{
//                 return await Respond.respond(req, res , {success: false, message: 'Session is not found'});
//               //}
//          }  catch(err){ throw err }
//   },
  async create_Help_Desk_Object(req){
    try{
       // console.log(req.body);
       var help_desk = {
        session_Id: req.body.session_Id,
        customer: req.user.customer,
        employee: req.user.employee,
        rate: req.body.rate,
        sender: req.body.sender,  
        message:req.body.message,
        status: req.body.status, 
        assigned: req.body.assigned,
        reason: req.body.reason,
        seen: req.body.seen
               }
       Object.keys(help_desk).forEach(key=>help_desk[key] === undefined ? delete help_desk[key]: {})        
       return help_desk
      }
      catch(err){throw err}         
     },
}