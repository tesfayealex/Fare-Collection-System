
const Organization = require('../Models/Organization');
const Respond = require('../../helpers/Response');
const Auth = require('../../helpers/authenticator');
const utility = require('../../helpers/utility');
const Employee_credential = require('../../User Managment Module/Controllers/Employee_credential_controller');
module.exports = {
    async register_Organization (req,res){
        try{ 
          if(await Auth.authenticate_Access({organization:{creator: true }},req.user.employee)){
            var Organization_Object = await this.create_Organization_Object(req);  
            let organization = new Organization(Organization_Object);             
              var result = await Organization.create(organization)
                if(result) 
                     return await Respond.respond(req, res,{success: true , message: `Organization Id - ${organization.organization_Id} - registered`});
                else 
                      return await Respond.respond(req, res,{success: false , message: `Organization is not registered`});  
          }
          else
            return await Respond.respond(req , res,{success: false , message: "attempt to register an organization with out access"});
        }catch(err){
          var created_organization = await Organization.find(Organization_Object);
           if(created_organization.length == 0 && req.file)
                  await utility.delete_file(req.file.path)   
          throw err }
  },
  async Search_For_Organization_EV (req, data , limit = 1){
    try{
         if(await Auth.authenticate_Access({organization: {viewer: true}},req.user.employee)){
                            var result = await this.Search_For_Organization_IV(data , limit)
                                  return result      
                                }
              else
                   {
                    var credential = await Employee_credential.search_For_Employee_Credential_IV ({employee: req.user.employee}, 1 , '')  
                   var result = await this.Search_For_Organization_IV({_id: credential.message.employee.organization} , limit)
                   return result  
                   }
    }catch(err) {throw err}
                  },
      async find_Organization(req,res,limit = 1){
             try {
                         var organization = await  this.Search_For_Organization_EV(req , req.query , limit) 
                          return await Respond.respond(req,res , organization)           
                 } 
              catch (error) {  throw error}
                  }, 
   async Search_For_Organization_IV(data, limit = 1, select= '-createdAt -updatedAt -__v'){
                    try{
                        var query_Object = {};  
                        if(data.organization_Id)
                             query_Object.organization_Id = data.organization_Id;
                       if(data.phone_Number)
                             query_Object.phone_Number = data.phone_Number; 
                       if(data.status)
                             query_Object.status = data.status;          
                        if(data.organization_Name){
                         query_Object.organization_Name = {
                                    $regex : new RegExp(data.organization_Name,'ig')
                                                     }  
                                           }
                        if(data._id)
                             query_Object._id = data._id 

                          
                     var result = await Organization.find(query_Object)   
                                        .limit(limit)
                                        .select(select)
                        if(result.length == 1) {
                          result = result.reduce((organization)=> {return organization})
                          return {success:true, message: result};
                        }
                 else if(result.length > 1 )   
                          return {success:true, message: result};
                 else
                          return {success: false , message: 'Organization is not found'};                    
                    }catch(err){throw err}
                  },                              
  async update_Organization (req,res){
    try{
        var organization = await this.Search_For_Organization_EV(req , req.query) 
        if(organization.success){
        if(await Auth.authenticate_Access({organization:{editor: true}},req.user.employee)){
        var Organization_Object = await this.create_Organization_Object(req);
        if(Organization_Object.organization_Id)  delete Organization_Object.organization_Id; 
      //  if(Organization_Object.organization_Type)  delete Organization_Object.organization_Type;    
        var result = await Organization.findByIdAndUpdate(organization.message._id,{$set: Organization_Object},{new:true,runValidators:true,context:'query'})
         if(result)  
                return await Respond.respond(req , res , {success: true, message: `Organization Id - ${organization.message.organization_Id} have been updated`});
         else
                return await Respond.respond(req , res , {success: false, message: `Organization is not found`}); 
                       }
             else
                    return await Respond.respond(req, res , {success: false, message: "attempt to update organization with out access"});
                    }
             else
                      return await Respond.respond(req , res , {success: false , message: ' Organization is not found'});   
    }catch(err){
      if(!result && req.file)
        await utility.delete_file(req.file.path) 
      throw err
    }
},
// async delete_Organization (req,res){
//     try{ 
//         var organization = await this.Search_For_Organization_EV(req , req.query)  //.catch(err=>{throw err });
//         if(organization.success) {        
//            if(await Auth.authenticate_Access({organization:{remove: true}},req.user.employee)){     
//        var result = await Organization.findByIdAndDelete(organization.message._id)
//             if(result)  
//                   return await Respond.respond(req , res , {success: true, message: `Organization Id - ${organization.message.organization_Id} have been deleted`});
//             else 
//                   return await Respond.respond(req , res , {success: false, message: `Organization is not found on database`});
//              }  
//             else
//                  return await Respond.respond(req, res , {success: false , message: "attempt to delete an organization with out access"});
//         }
//         else
//                 return await Respond.respond(req , res , {success: false , message: 'Organization is not found'});
//     }catch(err){  throw err  }
// },
async activate_Organization(req,res){
  try{
      var organization = await this.Search_For_Organization_IV({_id: req.query._id}) 
       if(organization.success){
             if(await Auth.authenticate_Access({organization: {creator: true}},req.user.employee)){
      let organization_Object = {
          status: 'Activated'
      }
     var result = await Organization.findByIdAndUpdate(organization.message._id,{$set: organization_Object},{new: true, runValidators: true, context:'query'})
       if(result.length !== 0)
         return await Respond.respond(req , res , {success:true, message: `Organization - ${organization.message.organization_Name} is Activated`});
       else 
         return await Respond.respond(req , res , {success: false, message: 'Organization could not  be found'});     
                          }
            else
                return await Respond.respond(req, res , {success: false , message: "attempt to activate an organization with out access"});
      }
       else 
              return await Respond.respond(req, res , {success: false, message: 'Organization is not found'});
       }  catch(err){ throw err }
             },
async deactivate_Organization(req,res){
   try{
    var organization = await this.Search_For_Organization_IV({_id: req.query._id})
    if(organization.success){
      if(await Auth.authenticate_Access({organization: {creator: true}},req.user.employee)){
let organization_Object = {
   status: 'Deactivated'
}
     var result = await Organization.findByIdAndUpdate(organization.message._id,{$set: organization_Object},{new: true, runValidators: true, context:'query'})
       if(result.length !== 0)
         return await Respond.respond(req , res , {success: true, message: `Organization - ${organization.message.organization_Name} is Deactivated`});
       else 
         return await Respond.respond(req , res , {success: false, message: 'Organization could not  be found'});     
                          }
            else
                return await Respond.respond(req, res , {success: false , message: "attempt to deactivate an organization with out access"});
      }
       else 
              return await Respond.respond(req, res , {success: false, message: 'Organization is not found'});
      }  catch(err){ throw err }
},
async create_Organization_Object(req){
    try{
       var organization= {
        organization_Id: req.body.organization_Id,
        organization_Name: req.body.organization_Name,
        organization_Type: req.body.organization_Type,
        main_Office: req.body.main_Office,
        about_Organization: req.body.about_Organization,
        phone_Number: req.body.phone_Number,
        status: req.body.status
    };
     if(req.file)    organization.profile_Picture = '/uploads/Organization_Profile/' + req.file.filename 
       Object.keys(organization).forEach(key=>organization[key] === undefined ? delete organization[key]: {})        
       return organization
      }
      catch(err){throw err}         
     },
} 

