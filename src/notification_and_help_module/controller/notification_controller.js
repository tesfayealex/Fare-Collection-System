

var Notification = require('../model/notification');
var employee = require('../../user_managment_module/controllers/employee_controller');
var employee_credential = require('../../user_managment_module/controllers/employee_credential_controller');
const Auth = require('../../helpers/authenticator');
const Respond = require('../../helpers/response');
const crypto = require('crypto')

module.exports = {
    async register_Notification(req , res ){
        try {
          
          // console.log(req.body)
            var notification = await this.create_Notification_Object(req)
         
                  notification.seen = false;
                  notification.sender = req.user.employee;
                if(notification.session_Id) {
                    notification.type = 'reply'  
                    var session = await this.search_for_Notification_Iv({session_Id: notification.session_Id});
                    console.log(session.message.sender)
                    console.log(req.user.employee)
                      if(!session.success) 
                             return await Respond.respond(req, res,{success: false , message: `Session Id - ${notification.session_Id} could not be found`}); 
                      else {
                        if( JSON.stringify(session.message.sender._id) == JSON.stringify(req.user.employee) || JSON.stringify(session.message.reciever._id) == JSON.stringify(req.user.employee)   )
                                {
                            if(JSON.stringify(session.message.sender._id) == JSON.stringify(notification.sender))  // console.log('true')
                                           notification.reciever = session.message.reciever._id; 
                            else         notification.reciever = session.message.sender._id;     
                            notification.context.title = session.message.context.title; 
                                 }
                            else 
                                return await Respond.respond(req, res,{success: false , message: `User does not belong to Session Id - ${notification.session_Id}`});       
                          }      
                }
                else{
                  console.log(notification)
                    notification.type = 'new';
                    notification.session_Id = await crypto.randomBytes(16).toString('hex');
                    if(notification.reciever) {
                   var reciever = await employee.search_for_Employee_IV({email: notification.reciever})
                //  console.log(notification.context.body)
                    if(reciever.success)
                         notification.reciever = reciever.message._id
                    else
                         return await Respond.respond(req, res,{success: false , message: `Reciever Employee could not be found`}); 
                                               }
                     else 
                           return await Respond.respond(req, res,{success: false , message: `Reciever Employee is not submitted`});                           
                } 
                  var result = false;
               var result =  await Notification.create(notification)
                    if(result)
                    return await Respond.respond(req, res,{success: true , message: `Session Id - ${result.session_Id} - registered`});
                    else 
                    return await Respond.respond(req, res,{success: false , message: `Notification is not registered`}); 
           
              }
        catch (err) {  throw err}        
      },
    async Internal_Notification(req , notification){
        var reciever = await employee_credential.search_For_Employee_Credential_IV(notification.reciever , 1 , notification.populate);
        notification.reciever = reciever.message.employee._id
        if(!reciever.success)
            return {success: false , message: `Reciever Employee could not be found`};   
      notification.seen = false;
      notification.sender = req.user.employee;
      notification.type = 'new';
      notification.session_Id = await crypto.randomBytes(16).toString('hex');
      var result =  await Notification.create(notification)
      if(result)
           return {success: true , message: `Session Id - ${result.session_Id} - registered`};
      else 
           return {success: false , message: `Notification is not registered`}; 
    } , 
    async check_New_Notification(req , res , limit = 10){
        try {
                var notification = await this.search_for_Notification_Iv({other: {$and: [{seen: false}, {reciever: req.user.employee}]}} ,limit)
                    return await Respond.respond(req , res , notification) 
            }
        catch (err) {  throw err}        
      },  
      async view_Notification(req , res , limit = 15){
        try {
             var notification = await this.search_for_Notification_Iv({other: {$or:[{sender: req.user.employee},{reciever: req.user.employee}]}},limit)
            // console.log(req.user.employee)
             for(i=0; i<notification.message.length;i++){
             //    notification.message[i]['user'] = req.user.employee
                 for(j=i+1;j<notification.message.length;j++)
                    // console.log(notification.message[j].session_Id)
                    // if(notification.message[j])
                     if(notification.message[i].session_Id == notification.message[j].session_Id)
                      {
                        notification.message.splice(j,1);
                        j--
                      } 
                          
             }
              //    console.log(notification.message.length)
                    return await Respond.respond(req , res ,{ message: notification , id: req.user.employee})       
             }
        catch (err) {  throw err}        
      }, 
      async find_Notifications(req , res , limit = 1){
        try {
             
             var notification =  await this.search_for_Notification_Ev(req.query , limit)
              
                          return await Respond.respond(req,res, notification)
            } 
    catch (err) {  throw err}
      }, 
    async search_for_Notification_Ev( data , limit = 1 , populate = ''){
        try{
                  
                //  var person_name = await employee.search_for_Employee_IV({_id: req.query._id})
                //     if(person_name.success ) {
                      //  if(data == '')
                      //           data.other = {$and: [ {$or:[{sender: person_name.message._id},{reciever: person_name.message._id}]} ,{  $or:[{sender: req.user.employee},{reciever: req.user.employee}]}]}
                           var result = await this.search_for_Notification_Iv(data , limit)
                           return result             
                    // }
                    // else 
                    //      return await Respond.respond(req,res, {success: false , message: 'employee is not found'})
        }catch(err){
            throw err
        }
    }, 
    async search_for_Custom_Notification_EV(req,res , limit = 1){ 
      try{
          var data = {};
        if(req.query.type == 'sender'){
           data.other =  {sender: req.user.employee}      
        } 
        else
           {
            data.other =  {reciever: req.user.employee} 
           }

        var notification = await this.search_for_Notification_Iv(data , limit)
        if(!Array.isArray(notification.message) )
           notification.message = [notification.message]
           console.log(notification.message.length)
        for(i=0; i<notification.message.length - 1;i++){
          console.log(i)
          console.log(notification.message.length);
          for(j=i+1;j<notification.message.length;j++)
             {
              if(notification.message[i].session_Id == notification.message[j].session_Id)
               { notification.message.splice(j,1); 
                j--  
               } 
                }        
      }
      console.log(notification.message.length)
      
      return Respond.respond(req,res,{message: notification , id: req.user.employee}); 
      } catch(err) {throw err}
    },
    async search_for_Notification_Iv(data , limit = 1 , populate = '', select='-__v'){
        try{
            var query_Object = {};  
            if(data.sender)
                 query_Object.sender = data.sender;
            if(data.session_Id)
             query_Object.session_Id = data.session_Id; 
            if(data.reciever)
              query_Object.reciever = data.reciever; 
            if(data.type) 
              query_Object.type = data.type; 
            if(data._id)
                 query_Object._id = data._id 
            if(data.other)
                 query_Object = data.other      
          if(populate == '') 
          populate =[ {path: 'sender' , select: '_id name employee_Id'} , {path: 'reciever' , select: '_id name employee_Id'}]                             
         var result = await Notification.find(query_Object)    //.catch(err=>{throw err})
              .populate(populate)
              .limit(limit)
              .select(select)
              .sort('-1')
                if(result.length == 1) {
                    result = result.reduce((not)=> {return not})
                    return {success:true, message: result};
                  }
              else if(result.length > 1 )   
                    return {success:true, message: result};
              else
                    return {success: false , message: 'Notification is not found'};                      
        }catch(err){throw err}      
    }, 
      async mark_Session_As_Seen(req,res){
                try{
                 
            var session = await this.search_for_Notification_Iv({session_Id: req.query.session_Id});
            console.log(session)
             if(session.success && JSON.stringify(session.message.reciever._id) == JSON.stringify(req.user.employee)){
                   var result = await Notification.findByIdAndUpdate(session.message._id,{seen: true},{new: true, runValidators: true, context:'query'})
                     if(result.length !== 0)
                       return await Respond.respond(req , res , {success:true, message: `Notification with Session Id - ${session.message.session_Id}  have been marked as seen`});
                     else 
                       return await Respond.respond(req , res , {success: false, message: 'Notification Session is not found'});     
                                        }
                          else
                              return await Respond.respond(req, res , {success: false , message: "session is not proper"});
                     }  catch(err){ throw err }
                           },              
 
  async create_Notification_Object(req){
    try{
       var notification = {
        session_Id: req.body.session_Id,
        reciever: req.body.reciever,
        sender: req.body.sender,  
        context: {
              title: req.body.title,
              body: {
                 message: req.body.message,
                    }
         },
        type: req.body.type, 
        seen: req.body.seen,
        reason:req.body.reason
               }
       if(req.file)  {
              console.log(true)
             notification.context.body.file= '/uploads/Notification_File/' + req.file.filename 
                      }

       Object.keys(notification).forEach(key=>notification[key] === undefined ? delete notification[key]: {})        
       return notification
      }
      catch(err){throw err}         
     },
}