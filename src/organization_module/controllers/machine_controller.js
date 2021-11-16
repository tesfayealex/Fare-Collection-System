
const jwt = require('jsonwebtoken')
const Machine = require('../models/machine');
const Respond = require('../../helpers/response');
const Auth = require('../../helpers/authenticator');
const config = require('../../config')
var machine_Refresh_Token = require('../models/machine_referesh_token');
var report = require('../../report_module/controllers/aggrigation')
module.exports = {
    async register_Machine (req,res){
        try{ 
          if(await Auth.authenticate_Access({machine:{creator: true }},req.user.employee)){
            var Machine_Object = await this.create_Machine_Object(req);  
            let machine = new Machine(Machine_Object);             
              var result = await Machine.create(machine)
                if(result) 
                     return await Respond.respond(req, res,{success: true , message: `Machine Id - ${machine.machine_Id} - registered`});
                else 
                      return await Respond.respond(req, res,{success: false , message: `Machine is not registered`});  
          }
          else
            return await Respond.respond(req , res,{success: false , message: "attempt to register a machine with out access"});
        }catch(err){throw err }
  },
  async search_For_Machine_Ev(req, data , limit = 1){
    try{
         if(await Auth.authenticate_Access({machine: {viewer: true}},req.user.employee)){
                            var result = await this.search_For_Machine_Iv(data , limit)
                                  return result      
                                }
              else
                    return {success: false, message: "attempt to find a machine with out access"};
    }catch(err) {throw err}
                  },
      async find_Machine(req,res,limit = 1){
             try {
                         var machine = await  this.search_For_Machine_Ev(req , req.query , limit)
                          return await Respond.respond(req,res , machine)           
                 } 
              catch (error) {  throw error}
                  }, 
   async search_For_Machine_Iv(data, limit = 1, select='-createdAt -updatedAt -__v'){
                    try{
                        var query_Object = {};  
                        if(data.machine_Id)
                             query_Object.machine_Id = data.machine_Id;
                        if(data.machine_Type)
                         query_Object.machine_Type = data.machine_Type;
                                          
                        if(data._id)
                             query_Object._id = data._id                        
                          
                     var result = await Machine.find(query_Object) 
                                        .limit(limit)
                                        .select(select)
                        if(result.length == 1) {
                          result = result.reduce((mac)=> {return mac})
                          return {success:true, message: result};
                        }
                 else if(result.length > 1 )   
                          return {success:true, message: result};
                 else
                          return {success: false , message: 'Machine is not found'};                     
                    }catch(err){throw err}
                  },                              
  async update_Machine (req,res){
    try{
        var machine = await this.search_For_Machine_Iv({_id: req.query._id})   //.catch(err=>{ throw err });
        if(machine.success){
        if(await Auth.authenticate_Access({machine:{editor: true}},req.user.employee)){
        var machine_Object = await this.create_Machine_Object(req);
        if(machine_Object.machine_Id)  delete machine_Object.machine_Id;
        if(machine_Object.machine_Type)  delete machine_Object.machine_Type;        
        var result = await Machine.findByIdAndUpdate(machine.message._id,{$set: machine_Object},{new:true,runValidators:true,context:'query'})
         if(result)  
                return await Respond.respond(req , res , {success: true, message: `Machine Id - ${machine.message.machine_Id} have been updated`});
         else
                return await Respond.respond(req , res , {success: false, message: `Machine is not found`}); 
                       }
             else
                    return await Respond.respond(req, res , {success: false, message: "attempt to update machine with out access"});
                    }
             else
                      return await Respond.respond(req , res , {success: false , message: ' Machine is not found'});   
    }catch(err){ throw err }
},
async login_Machine(req,res){
  try{
  const machine = await Machine.findOne({machine_Id:req.body.machine_Id})  
if(machine) {
    if(machine.status == 'Activated'){
      
       let token = jwt.sign({
                type: "machine",
                data: {
                    _id: machine._id,
                    type: machine.machine_Type,
                  }
            }, config.JWT_SECRET)
       let refresh_token = jwt.sign({
        type: "machine",
        data: {
            _id: machine._id,
            type: machine.machine_Type,
                }
          }, config.JWT_SECRET_REFRESH,{expiresIn: '1d'} )  
          refresh_Token_Object = {
            token: refresh_token,
            machine: machine._id, 
                        }
          var result = await machine_Refresh_Token.create(refresh_Token_Object); 
           if(!result)
               throw new Error('Refresh Token could not be created')
            let output = {
                machine_Id: machine.machine_Id,
                token: `jwt ${token}`,
                refresh_token: refresh_token
                         }
            return await Respond.respond(req , res , {success: true , messsage: output})
      }
      else  
          return await Respond.respond(req, res , {success: false , message: `Account is ${user.status}`});
       }
      else 
          return await Respond.respond(req, res ,{success: false , message: "Machine Id does not exist"});  
}      
catch(err){ throw err }         
},
async refresh_access_token(req,res){
      var token = req.headers['refresh_token'];
       if(token){ 
          var result = await machine_Refresh_Token.findOne({token: token })
       if(result) {
          var payload = jwt.verify(token,config.JWT_SECRET_REFRESH);
const machine = await this.search_For_Machine_Iv({_id: result.machine})  
if(machine) {
if(machine.message.status == 'Activated'){
  let token = jwt.sign({
    type: "machine",
    data: {
        _id: machine.message._id,
        type: machine.message.machine_Type,
      }
}, config.JWT_SECRET,{expiresIn: '2h'} )
let output = {
  machine_Id: machine.message.machine_Id,
  token: `jwt ${token}`,
           }
        return await Respond.respond(req , res , {success: true , message: output})
                    }
        else  
          return await Respond.respond(req, res , {success: false , message: `Your account is ${machine.message.status}`});
    
       }
      else  
          return await Respond.respond(req, res ,{success: false , message: "Wallet could not been found"});  
  }
  else 
  return await Respond.respond(req, res , {success: false , message: `Refresh Token has not been sent`});
}
else 
  return await Respond.respond(req, res , {success: false , message: `Refresh Token has not been found`});            

},
// async delete_Machine (req,res){
//     try{ 
//         var machine = await this.search_For_Machine_Ev(req)  //.catch(err=>{throw err });
//         if(machine.success) {        
//            if(await Auth.authenticate_Access({machine:{remove: true}},req.user.employee)){     
//        var result = await Machine.findByIdAndDelete(machine.message._id)
//         // .then(result=>{
//             if(result)  
//                   return await Respond.respond(req , res , {success: true, message: `Machine Id - ${machine.message.machine_Id} have been deleted`});
//             else 
//                   return await Respond.respond(req , res , {success: false, message: `MAchine is not found on database`});
//             // })
//             // .catch(err=>{throw err});
//              }  
//             else
//                  return await Respond.respond(req, res , {success: false , message: "attempt to delete a machine with out access"});
//         }
//         else
//                 return await Respond.respond(req , res , {success: false , message: 'Machine is not found'});
//     }catch(err){  throw err  }
// },
async activate_Machine(req,res){
  try{
      var machine = await this.search_For_Machine_Iv({_id: req.query._id})  //.catch(err=>{throw err});
       if(machine.success){
             if(await Auth.authenticate_Access({machine: {editor: true}},req.user.employee)){
      let machine_Object = {
          status: 'Activated'
      }
     var result = await Machine.findByIdAndUpdate(machine.message._id,{$set: machine_Object},{new: true, runValidators: true, context:'query'})
       if(result.length !== 0)
         return await Respond.respond(req , res , {success:true, message: `Machine - ${machine.message.machine_Name} is Activated`});
       else 
         return await Respond.respond(req , res , {success: false, message: 'Machine could not  be found'});     
                          }
            else
                return await Respond.respond(req, res , {success: false , message: "attempt to activate a machine with out access"});
      }
       else 
              return await Respond.respond(req, res , {success: false, message: 'Machine is not found'});
       }  catch(err){ throw err }
             },
async deactivate_Machine(req,res){
   try{
    var machine = await this.search_For_Machine_Iv({_id: req.query._id})
    if(machine.success){
      if(await Auth.authenticate_Access({machine: {editor: true}},req.user.employee)){
let machine_Object = {
   status: 'Deactivated'
}
     var result = await Machine.findByIdAndUpdate(machine.message._id,{$set: machine_Object},{new: true, runValidators: true, context:'query'})
       if(result.length !== 0)
         return await Respond.respond(req , res , {success: true, message: `Machine - ${machine.message.machine_Name} is Deactivated`});
       else 
         return await Respond.respond(req , res , {success: false, message: 'Machine could not  be found'});     
                          }
            else
                return await Respond.respond(req, res , {success: false , message: "attempt to deactivate a machine with out access"});
      }
       else 
              return await Respond.respond(req, res , {success: false, message: 'Machine is not found'});
      }  catch(err){ throw err }
},
async aggregate_worker(req,res){
  try{
    // if(await Auth.authenticate_Access({analysis: { creator: true}},req.user.employee)){       
    var data = await report.begin_aggregation(req);
          var created_aggregation = await report.aggregate_creator(data);
          var aggregate = await   Machine.aggregate(created_aggregation)
          var result = await report.result_generator(aggregate,req.body.output)
          Respond.respond(req,res,result) 
        // }
        // else 
        //         return Respond.respond ( req,res ,{success: false, message: "attempt to generate report with out access"});
  }catch(err) {throw err}
},
// async machine_aggregation(req,res ,data = {total: true}){
//   try{
         
//     var result =  await Machine.aggregate(
//       [
//           { $group: { _id: "$machine_Type",  count: { $sum: 1 }  } }   
//       ]
//       ) 
//     var data  = []
//     var count = []
//             result.forEach(element=>{
//                   data.push(element._id)
//                   count.push(element.count)
//             }) 
//          if(count.length != 0)
//     var total = count.reduce((a,b)=> a+b);
//       return Respond.respond(req,res, {success:true, message: {data,count,total}});
//     }catch(err){  
//       throw err}
// },
async create_Machine_Object(req){
    try{
       var machine= {
        machine_Id: req.body.machine_Id,
        machine_Type: req.body.machine_Type,
        ip_Address: req.body.ip_Address,
        status: req.body.status
    };
       Object.keys(machine).forEach(key=>machine[key] === undefined ? delete machine[key]: {})        
       return machine
      }
      catch(err){throw err}         
     },
} 

