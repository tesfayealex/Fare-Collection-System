
const Fare = require('../Models/fare');
const Respond = require('../../helpers/response');
const Auth = require('../../helpers/authenticator');
const Notification = require('../../notification_and_help_module/controller/notification_controller')
const employee_credential = require('../../user_managment_module/controllers/employee_credential_controller');
module.exports = {
    async register_New_Fare(req,res){
        try{
            if(await Auth.authenticate_Access({fare: {creator:true}},req.user.employee)){
               var Fare_Object = await this.create_Fare_Object(req);  
               Fare_Object.status = 'New'     
             var fare = new Fare(Fare_Object);
            var result = await Fare.create(fare)
                if(result) {
                  var notification = {
                    reciever: { role :'5e5ce68726edff8f28901876' } , 
                    populate : 'employee',
                    context: {
                      title: 'Fare Change has Change',
                      body: {
                         message: `Fare amount has been updated. Please activate it! Fare Id - ${fare.fare_Id}`,
                            }
                        },
                  }
                  Notification.Internal_Notification(req , notification)
                  return await Respond.respond(req , res , {success: true, message: `Fare Id - ${fare.fare_Id} have been registered`});
                           }
                else
                  return await Respond.respond(req , res , {success: false, message: `Fare is not registered`});     
                }
                else
                    return await Respond.respond(req,res,{success: false , message: "attempt to register fare with out access"});            
        }catch(err){throw err }
    },
      async activate_Fare_Amount(req , res){
        try{
          var employee = await employee_credential.search_For_Employee_Credential_IV({employee: req.user.employee});
          if(employee.success &&  employee.message.role.role_Name == 'Super Administrator')
               {
          var fare = await Fare.findOne({fare_Id: req.query.fare_Id});
          if(fare)
            {
                var result  = await Fare.findByIdAndUpdate(fare._id , {status:'Active'});
                if(result)
                      return Respond.respond(req,res,{success: true , message: `Fare Id - ${fare.fare_Id} has been Activated` })
                else 
                      return Respond.respond(req,res,{success: false , message: `Fare Id - ${fare.fare_Id} has not been Activated` })     
            }
          else 
              return Respond.respond(req,res,{success: false , message: `Fare Id - ${req.query.fare_Id} has not been Found` }) 
          }
          else
              return Respond.respond(req,res,{success: false , message: `employee have no access` }) 
          }catch(err) {throw err} 
      }, 
      async find_Fare(req , res , limit = 1 , populate = 'issued_By'){
        try {
           var fare = await this.search_For_Fare_EV(req, req.query , limit , populate)          
                return await Respond.respond(req,res , fare)       
            }
              catch (err) {  throw err}        
      },
      async search_For_Fare_EV(req , data , limit = 1 , populate = ''){
        try{
          if(await Auth.authenticate_Access({fare: {viewer: true}},req.user.employee)){
                     var result = await this.search_For_Fare_IV( data , limit , populate)
                                       return result;
                          }
            else
                  return {success: false, message: "attempt to search for a fare with out access"};                                    
            }catch(err){throw err} 
      },
      async search_For_Fare_IV(data , limit =1 , populate = '' , sort=''){
        try{
            var query_Object = {};  
            if(data.fare_Id)
                 query_Object.fare_Id = data.fare_Id;
            if(data.issued_By)   
                 query_Object.issued_By = data.issued_By; 
            if(data.fare_Amount)
                 query_Object.fare_Amount = data.fare_Amount      
            if(data._id)
                 query_Object._id = data._id;
            if(data.status)
                 query_Object.status = data.status         
            if(populate == '')                        
                populate = {path: 'issued_By' , select: '_id name employee_Id'} 
            if(sort == '')
                sort = {createdAt: -1}   
         var result = await Fare.find(query_Object)  
              .populate(populate)
              .sort(sort)
              .limit(limit)
          if(result.length == 1) {
            result = result.reduce((fare)=> {return fare})
            return {success:true, message: result};
          }
   else if(result.length > 1 )   
            return {success:true, message: result};
   else
            return {success: false , message: 'Fare is not found'};                   
        }catch(err){throw err}
      },
      async update_Fare (req,res){
        try{
            var fare = await this.search_For_Fare_EV(req , req.query)  
            if(fare.success){
            if(await Auth.authenticate_Access({fare: {editor: true}},req.user.employee)){
                var Fare_Object =  await  this.create_Fare_Object(req);    
                  if(Fare_Object.fare_Id)  delete Fare_Object.fare_Id; 
               var result = await Fare.findByIdAndUpdate(fare.message._id,{$set: Fare_Object},{new:true, runValidators:true, context:'query'})
                if(result)  
                   return await Respond.respond(req , res , {success: true, message: `Fare Id - ${result.fare_Id} have been updated`});
                else
                   return await Respond.respond(req , res , {success: false, message: `Fare is not found`});
            }
            else
                return await Respond.respond(req, res , {success: false, message: "attempt to update fare with out access"});
            }
            else
                return await Respond.respond(req , res , {success: false , message: ' Fare is not found'});
                  
        }catch(err){throw err}
    },
    // async delete_Fare (req,res){
    //     try{  
    //         var fare = await this.find_fare(req).catch(err=>{ throw err });
    //         if(fare.success){
    //         if(await Auth.authenticate_Access({fare: {remove: true}},req.user.employee)){
    //        var result = await Fare.findByIdAndDelete(fare.message._id)
    //        // .then(result=>{
    //             if(result)  
    //               return await Respond.respond(req , res , {success: true, message: `Fare Id - ${result.message.fare_Id} have been deleted`});
    //             else 
    //               return await Respond.respond(req , res , {success: false, message: `Fare is not found on database`});
    //         // })
    //         // .catch(err=>{throw err});
    //                        }  
    //         else
    //              return await Respond.respond(req, res , {success: false , message: "attempt to delete fare with out access"});
    //         }
    //     else
    //             return await Respond.respond(req , res , {success: false , message: 'Fare is not found'});
    //     }catch(err){  throw err }
    // },
    async create_Fare_Object(req){
        try{
           var fare = {
            fare_Id: req.body.fare_Id,   
            fare_Amount: req.body.fare_Amount,
            issued_By: req.user.employee
                           }  
           Object.keys(fare).forEach(key=> fare[key] === undefined ? delete fare[key]: {})        
           return fare
          }
          catch(err){throw err}         
         }     
    }   