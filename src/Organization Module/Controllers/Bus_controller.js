
const Bus = require('../Models/Bus');
const Route = require('../Controllers/Route_controller');
const Employee = require('../../User Managment Module/Controllers/Employee_controller');
const Machine = require('./Machine_controller');
const Respond = require('../../helpers/Response');
const Auth = require('../../helpers/authenticator');
const fs = require('fs');
const report = require('../../Report Module/Controllers/aggrigation');
module.exports = {
    async register_Bus(req,res){
        try{
            if(await Auth.authenticate_Access({bus:{creator: true}},req.user.employee)){
              var Bus_Object = await this.create_Bus_Object(req);    
              var user = await Employee.search_for_Employee_IV({_id: req.user.employee},1,'organization')
                 if(user.success) {
                    if(Bus_Object.bus_Driver) {
                            var employee = await Employee.search_for_Employee_IV({employee_Id: Bus_Object.bus_Driver},1,'organization')
                               if(employee.success ){
                                    if(employee.message.organization.organization_Id === user.message.organization.organization_Id) 
                                          Bus_Object.bus_Driver = employee.message._id;
                                    else 
                                       return await Respond.respond(req, res,{success: false , message: `Organization mismatch between Bus Driver and user`})       
                                 }
                                else
                                    return await Respond.respond(req, res,{success: false , message: `Bus Driver data is not found`})    
                                              }
                     if(Bus_Object.transaction_Machine) {
                        var transaction_Machine = await Machine.search_For_Machine_Iv({machine_Id: Bus_Object.transaction_Machine ,machine_Type: 'Transaction'});
                        if(transaction_Machine.success) 
                                         {
                                               var check_for_machine = this.search_For_Bus_IV({transaction_Machine: transaction_Machine.message._id})
                                               if(!check_for_machine.success)
                                                       Bus_Object.transaction_Machine =  transaction_Machine.message._id;
                                               else 
                                               return await Respond.respond(req, res,{success: false , message: 'Transaction Machine has already been installed on another bus'});         
                                         }
                         else            return await Respond.respond(req, res,{success: false , message: 'Transaction Machine is not found '});
                     }    
                     else
                        throw new Error('Transaction_Machine could not be found');
                     if(Bus_Object.ticket_Machine)
                                  {
                                        var ticket_Machine = await Machine.search_For_Machine_Iv({machine_Id: Bus_Object.ticket_Machine , machine_Type: 'Ticket'});
                                        if(ticket_Machine.success)  
                                            {
                                              var check_for_machine = this.search_For_Bus_IV({ticket_Machine: ticket_Machine.message._id})
                                              if(!check_for_machine.success)
                                                       Bus_Object.ticket_Machine =  ticket_Machine.message._id
                                              else 
                                                  return await Respond.respond(req, res,{success: false , message: 'Ticket Machine has already been installed on another bus'}); 
                                                
                                            }
                                               else            return await Respond.respond(req, res,{success: false , message: 'Ticket Machine is not found '});
                                  }     
                                                
                            Bus_Object.organization = user.message.organization._id; 
                              var bus = await new Bus(Bus_Object);  
                                var result = await Bus.create(bus)
                                    if(result) 
                                    return await Respond.respond(req, res,{success: true , message: `Bus Id - ${result.bus_Id} - registered`});
                                    else 
                                    return await Respond.respond(req, res,{success: false , message: `Bus is not registered`}); 
                      }
                  else 
                      return await Respond.respond(req, res,{success: false , message: `user could not be found`}) 
        }
        else{
                 return  await Respond.respond(req , res,{success: false , message: "attempt to register a bus with out access"});
            }
        }
        catch(err){     throw err   }
    },
    async find_Bus(req, res , limit = 1){
        try {
         var bus = await this.search_For_Bus_EV(req , req.query , limit)
              return await Respond.respond(req,res , bus)       
          } 
          catch (err) {  throw err}
      },
    async search_For_Bus_EV(req, data , limit = 1 , populate = 'organization'){
        try{
           var query_Object={};
                if(await Auth.authenticate_Access({bus: {viewer: true}},req.user.employee)){
                   query_Object = data; 
                var user = await Employee.search_for_Employee_IV( {_id: req.user.employee},1, populate)
                 if(user && user.success && user.message.organization && user.message.organization.organization_Type == 'Service_Provider')
                                    query_Object.organization = user.message.organization._id;   
                var bus =  await this.search_For_Bus_IV(query_Object, limit) 
                        return bus 
                }
                else
                    return {success: false, message: "attempt to find a bus with out access"};            
        }catch(err){
           throw err
        }
      },
      async search_For_Bus_IV(data, limit = 1 , populate = '', select='-createdAt -updatedAt -__v'){
        try{
            var query_Object = {};  
            if(data.bus_Id)
                 query_Object.bus_Id = data.bus_Id;
            if(data.organization)
                 query_Object.organization = data.organization 
            if(data._id)
                 query_Object._id = data._id 
            if(data.bus_Driver)
                 query_Object.bus_Driver = data.bus_Driver
            if(data.ticket_Machine)
                 query_Object.ticket_Machine = data.ticket_Machine 
            if(data.transaction_Machine)
                 query_Object.transaction_Machine = data.transaction_Machine                                      
         if(populate == '')
                  populate =[ {path: 'organization' , select: '_id organization_Name organization_Id'} , {path: 'bus_Driver' , select: '_id name employee_Id'},{path: 'ticket_Machine' , select: '_id machine_Id ip_Address status'},{path: 'transaction_Machine' , select: '_id machine_Id ip_Address status'}]  
         var result =  await Bus.find(query_Object) 
              .populate(populate)
              .limit(limit)
              .select(select)  
            if(result.length == 1) {
                result = result.reduce((bus)=> {return bus})
                return {success:true, message: result};
              }
          else if(result.length > 1 )   
                return {success:true, message: result};
          else
                return {success: false , message:'Bus is not found'};                        
        }catch(err){throw err}      
      },

  //     async sfb(data , limit = 1 , populate = ''){
  //       try{
  //         // data = 
  //         //            [
  //         //   {  "$match" : { "status" : "Activated" }, },
  //         //   {  "$group" : {"_id": "$updatedAt" , "count": {"$sum" : 1}} }
  //         //             ]
                 
  //       var result =  await Bus.aggregate(data)     //.catch(err=>{throw err})
  //     //  .populate(populate)
  //     //  .limit(limit)
  //    //   .select('-createdAt -status -updatedAt -__v')
  //  //     .then(result=>{
  //         console.log(result)
  //     if(result.length == 1) {
  //         result = result.reduce((bus)=> {return bus})
  //         return {success:true, message: result};
  //       }
  //   //   .then(result=>{
  //   else if(result.length > 1 )   
  //         return {success:true, message: result};
  //   else
  //         return {success: false , message:'Bus is not found'};
  //       }catch(err){throw err}
  //       },





      async update_Bus (req,res){
        try{
            bus = await this.search_For_Bus_EV(req , req.query)   // .catch(err=>{throw err});
            if(bus.success){
            if(await Auth.authenticate_Access({bus: {editor: true}},req.user.employee)){  
            var Bus_Object = await this.create_Bus_Object(req); 
            if(Bus_Object.bus_Id) delete Bus_Object.bus_Id;
            if(Bus_Object.organization) delete Bus_Object.organization;   
            if(Bus_Object.bus_Driver) { 
               var bus_Driver =  await  Employee.search_For_Employee_EV(req,{employee_Id:Bus_Object.bus_Driver})
                   if(bus_Driver.success)
                         Bus_Object.bus_Driver = bus_Driver.message._id;
                   else
                        return await Respond.respond(req, res,{ success: false , message: `Bus Driver data is not found`})  
                                        }
             if(Bus_Object.transaction_Machine) {
                var transaction_Machine = await Machine.search_For_Machine_Iv({machine_Id: Bus_Object.transaction_Machine ,machine_Type: 'Transaction'});
                 if(transaction_Machine.success)  {
                                var check_for_machine = this.search_For_Bus_IV({transaction_Machine: transaction_Machine.message._id})
                                       if(!check_for_machine.success)
                                                 Bus_Object.transaction_Machine =  transaction_Machine.message._id;
                                       else 
                                                  return await Respond.respond(req, res,{success: false , message: 'Transaction Machine has already been installed on another bus'});
                                                  }
                  else            return await Respond.respond(req, res,{success: false , message: 'Transaction_Machine is not found '});
                                               }    
             if(Bus_Object.ticket_Machine) {
                var ticket_Machine = await Machine.search_For_Machine_Iv({machine_Id: Bus_Object.ticket_Machine , machine_Type: 'Ticket'});
                 if(ticket_Machine.success) 
                      {
                  var check_for_machine = this.search_For_Bus_IV({ticket_Machine: ticket_Machine.message._id})
                  if(!check_for_machine.success)
                           Bus_Object.ticket_Machine =  ticket_Machine.message._id
                  else 
                      return await Respond.respond(req, res,{success: false , message: 'Ticket Machine has already been installed on another bus'}); 
                    
                }
                 else            return await Respond.respond(req, res,{success: false , message: 'Ticket Machine is not found '});
                                          }
          var result = await Bus.findByIdAndUpdate(bus.message._id,{$set:Bus_Object},{new:true,runValidators:true,context:'query'})
                  if(result)  
                      return await Respond.respond(req , res , {success: true, message: `Bus Id - ${bus.message.bus_Id} have been updated`});
                  else
                      return await Respond.respond(req , res , {success: false, message: `Bus is not found`}); 
                 }
         else {
                   return await Respond.respond(req, res , {success: false, message: "attempt to update a bus with out access"});
               }
            }
            else{
                 return await Respond.respond(req , res , {success: false , message: ' Bus is not found'});
                }
          }
        catch(err){  throw err }
    },
    // async delete_Bus (req,res){
    //     try{  
    //         bus = await this.search_For_Bus_EV(req)//.catch(err=>{throw err});
    //         if(bus.success){
    //         if(await Auth.authenticate_Access({bus: {remove: true}},req.user.employee)){ 
    //           var employee = await Employee.search_for_Employee_IV({_id:req.user.employee})
    //                 if(employee.success){
    //                 if(employee.message.organization == bus.message.organization)
    //                      {  
    //                        var result =  await Bus.findByIdAndDelete(bus.message._id)
    //                                   if(result)  
    //                                        return await Respond.respond(req , res , {success: true, message: `Bus Id - ${bus.message.bus_Id} have been deleted`});
    //                                   else 
    //                                        return await Respond.respond(req , res , {success: false, message: `Bus is not found on database`});
    //                     }  
    //                 else{
    //                     return await Respond.respond(req , res , {success: false, message: 'Unautorized Access to non organizational bus data '}) 
    //                 }
    //                      }
    //                 else 
    //                    return await Respond.respond(req , res , {success: false, message: 'User data could not be found'})       
    //                 }         
    //         else {
    //             return await Respond.respond(req, res , {success: false , message: "attempt to delete an bus with out access"});
    //             }
    //     }
    //     else{
    //            return await Respond.respond(req , res , {success: false , message: 'Bus is not found'});
    //         }    
    //     }
    //     catch(err){  throw err }
    // },
     async activate_Bus(req,res){
      try{
          var bus = await this.search_For_Bus_EV(req , {_id: req.query._id})  
           if(bus.success){
                 if(await Auth.authenticate_Access({bus: {editor: true}},req.user.employee)){
          let bus_Object = {
              status: 'Activated'
          }
         var result = await Bus.findByIdAndUpdate(bus.message._id,{$set: bus_Object},{new: true, runValidators: true, context:'query'})
           if(result.length !== 0)
             return await Respond.respond(req , res , {success:true, message: `Bus - ${bus.message.bus_Name} is Activated`});
           else 
             return await Respond.respond(req , res , {success: false, message: 'Bus could not  be found'});     
                              }
                else
                    return await Respond.respond(req, res , {success: false , message: "attempt to activate a bus with out access"});
          }
           else 
                  return await Respond.respond(req, res , {success: false, message: 'Bus is not found'});
              
           }  catch(err){ throw err }
                 },
    async deactivate_Bus(req,res){
       try{
        var bus = await this.search_For_Bus_EV(req , {_id: req.query._id})
        if(bus.success){
          if(await Auth.authenticate_Access({bus: {editor: true}},req.user.employee)){
   let bus_Object = {
       status: 'Deactivated'
   }
         var result = await Bus.findByIdAndUpdate(bus.message._id,{$set: bus_Object},{new: true, runValidators: true, context:'query'})
        // .then(result=>{
           if(result.length !== 0)
             return await Respond.respond(req , res , {success: true, message: `Bus - ${bus.message.bus_Name} is Deactivated`});
           else 
             return await Respond.respond(req , res , {success: false, message: 'Bus could not  be found'});     
                              }
                else
                    return await Respond.respond(req, res , {success: false , message: "attempt to deactivate a bus with out access"});
          }
           else 
                  return await Respond.respond(req, res , {success: false, message: 'Bus is not found'});
          }  catch(err){ throw err }
    },
    async aggregate_worker(req,res){
      try{
      //  if(await Auth.authenticate_Access({analysis: { creator: true}},req.user.employee)){  
              var data = await report.begin_aggregation(req);
              var created_aggregation = await report.aggregate_creator(data);
            
              var aggregate = await   Bus.aggregate(created_aggregation)
              var result = await report.result_generator(aggregate,req.body.output)
              Respond.respond(req,res,  result) 
            // }
            // else 
            //         return Respond.respond ( req,res ,{success: false, message: "attempt to generate report with out access"});
      }catch(err) {throw err}
},
    // async bus_aggregate(req,res ,data = {total: true}){
    //   try{
             
    //     var result =  await Bus.aggregate(
    //       [
             
    //           {"$lookup" : { "from" : "Organization" , "localField" : "organization" , "foreignField" : "_id" , "as": "Organization"}},
    //           {"$unwind": "$Organization"},
    //           { $group: { _id: "$Organization.organization_Name",  count: { $sum: 1 }  } }   
    //       ]
    //       )
    //    // console.log(result)  
    //     var date  = []
    //     var count = []
    //     var borderColor = [];
    //     var backgroundColor =[];
    //             result.forEach(element=>{
    //                   date.push(element._id)
    //                   count.push(element.count)
    //                   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
    //                   backgroundColor.push(color + "0.2)");
    //                   borderColor.push(color + "1)");
    //             }) 
    //          if(count.length != 0)
    //     var total = count.reduce((a,b)=> a+b);
    //     return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
    //     }catch(err){  
    //       throw err}
    // },
    async create_Bus_Object(req){
        try{
           var bus = {
            bus_Id: req.body.bus_Id,
            bus_Driver: req.body.bus_Driver_Id,        
            ticket_Machine: req.body.ticket_Machine,
            transaction_Machine: req.body.transaction_Machine,
            status: req.body.status  
                   }
           Object.keys(bus).forEach(key=>bus[key] === undefined ? delete bus[key]: {})  
           return bus
          }
          catch(err){throw err}         
         },
    }   