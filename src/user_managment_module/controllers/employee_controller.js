

const Employee = require('../models/employee_model');
const Employee_credential = require('./employee_credential_controller');
const Respond = require('../../helpers/response');
const Auth = require('../../helpers/authenticator');
const utility = require('../../helpers/utility')
const Role = require('./role_controller');
const Organization = require('../../organization_module/controllers/organization_controller');
const Branch = require('../../organization_module/controllers/branch_controller');
const report = require('../../report_module/controllers/aggrigation');
module.exports = {
    async register_Employee (req,res){
    try{
     var Employee_Object = await this.create_Employee_Object(req)   
     if(Employee_Object.role_Name){
     var role =  await  Role.search_For_Role_IV({role_Name: Employee_Object.role_Name})
      if(role.success)
                 {
       Employee_Object.role = role.message._id;              
      if(await Auth.authenticate_Access({employee: role.message.role_Id, creator: true},req.user.employee)){
          var message = {};
             if(Employee_Object.organization_Name)
            var org =  await  Organization.Search_For_Organization_IV({organization_Name: Employee_Object.organization_Name})
            if(org.success){
          if(Employee_Object.profile_Picture){ 
                 Employee_Object.organization = org.message._id;    
                var user = await Employee.findOne(req.user.employee).populate('organization')   //.catch(err=>{throw err})  
                var employee = new Employee(Employee_Object);  
                  //console.log(role.message.organization_Type+ ' ' + org.message.organization_Type);
                  if(role.message.organization_Type != org.message.organization_Type )    
                       throw new Error(`${user.name.first_Name+' ' + user.name.last_Name+' ' + user.name.grand_Father_Name+ ' : '} Organization and role mismatch`)
                
                  if((role.message.organization_Type == 'Service_Provider' || role.message.organization_Type == 'Government') && role.message.role_Type != 'Administrator' ){
                       employee.organization = user.organization;
                       if(employee.branch_Name)  delete employee.branch_Name;   
                 }
                 if(org.message.organization_Type == 'Platform_Provider' && role.message.role_Name!= 'Super_Administrator'){ 
                       role = JSON.stringify(role);
                       role = JSON.parse(role);
                     if(role.message.role_Type == 'Administrator'){  
                           if(Employee_Object.branch_Name) {
                        var branch = await Branch.search_For_Branch_IV({branch_Name: Employee_Object.branch_Name})
                                    if(branch.success)    employee.branch = branch.message._id;
                                    else 
                                        throw new Error(`Branch provided for - ${user.name.first_Name+' ' + user.name.last_Name+' ' + user.name.grand_Father_Name+ ' : '} - does not exist`); 
                                  }
                        }
                     else
                             {  employee.branch = user.branch;   }                                       
                     if(!employee.branch) 
                               throw new Error(`${user.name.first_Name+' ' + user.name.last_Name+' ' + user.name.grand_Father_Name+ ' : '} Branch was not available`);      
                            }                                                
         var result = await Employee.create(employee)
                       if(result) {
                          var message = await Employee_credential.register_Employee_Credential(result._id,Employee_Object.role,req)
                                  if(message.success == true)
                                          message.message = `Employee Id - ${employee.employee_Id} - registered`;
                                  else {
                                          await Employee.findByIdAndDelete(result._id)  
                                          throw new Error('Wallet could not be created - Internal Error');
                                  }
                                return await Respond.respond(req,res, message)    
                           }
                         else 
                                return await Respond.respond(req,res, {success: false , message: 'Employee could not be created due to internal error'})                     
            }  
             else
               return await Respond.respond(req, res,{success: false , message: 'Profile picture could not be found'});
            }
            else  //{
                return await Respond.respond(req, res,org);
               // }
            }  else  //{
                return await Respond.respond(req, res,{success: false , message:"attempt to create an employee with out access"});
                   //   }
            }   else
                //{
                    return await Respond.respond(req, res,{success: false, message:'Role could not be found on database' }) ; 
          } else
                    return await Respond.respond(req, res,{success: false, message:'Role Info is not submitted' }) ;       
               //}
        }catch(err){ 
          var created_employee = await Employee.find(Employee_Object); 
           if(created_employee.length == 0 && req.file)
                  await utility.delete_file(req.file.path)  
          throw err} 
    },
   async view_Employee(req, data , limit=1 , populate=''){
     try{
    var credential = await  Employee_credential.search_For_Employee_Credential_IV({employee: req.user.employee})
       
    var access_for = await Auth.authenticate_Access_deeper(credential.message.role._id , 'employee' , 'viewer')
      if(access_for) {
    var query_Object = {};
        if(data.name){    
        var name =  data.name.split(' ');
          if(name[0])
                 query_Object['name.first_Name'] = { "$regex": name[0], "$options": "i" }
          if(name[1])
              query_Object['name.first_Name'] = { "$regex": name[1], "$options": "i" } 
         if(name[2])
             query_Object['name.first_Name'] = { "$regex": name[2], "$options": "i" }
            }
             if(access_for.length >= 1){
                   query_Object['Role.role_Id'] = {$in: access_for}
             }
             var project = {
                  '_id':1,
                  'name':1,
                  'email': 1,
                  'phone_Number': 1,
                  'address': 1,
                  'employee_Id': 1,
                  'profile_Picture': 1,
                  'age':1,
                  'gender':1,
                  'status': '$Employee_credential.status',
                  'organization_Name': '$Organization.organization_Name',
                  'organization_Id': '$Organization.organization_Id',
                  'branch_Name': '$Branch.branch_Name',
                  'branch_Id': '$Branch.branch_Id',
                  'username': '$Employee_credential.username',
                  'role_Name':'$Role.role_Name',
                  'role_Id':'$Role.role_Id',
             }
            var aggrigate= {
               lookup: 'Credential',
               lookup_role: 'Role',
               lookup_organization: "Organization",
               lookup_branch: "Branch",
               match: query_Object,
               limit: limit ,  
               project: project          
                     }
        var result = await this.Employee_Aggregate(aggrigate)
           // console.log(result)
                return result 
          }
       else
           return Respond.respond(req ,res , {success: false , message: 'Not allowed to view any employee'})  
    } 
    catch(err) {throw err}     
} , 
  async search_For_Employee_EV (req, data , limit=1, populate = ''){
        try{
          var result = await this.search_for_Employee_IV(data,limit,populate);
          if(result.success){
            result = JSON.stringify(result);
            result = JSON.parse(result);
            if(!Array.isArray(result.message)) {
                result.message = [result.message]
            }
        var promises = await result.message.map(element => {
             return new Promise(async function (resolve,reject){
               var employee_populate =  [
                      {path:'employee' , populate: {path: 'organization'}},
                      {path:'role'}
                      ]
               var credential = await  Employee_credential.search_For_Employee_Credential_IV({employee: element._id}, 1 , employee_populate)
               if(credential.success) {
               var available =  await  Auth.authenticate_Access({employee: credential.message.role.role_Id, viewer: true},req.user.employee)
               const user =  await Employee_credential.search_For_Employee_Credential_IV({employee: req.user.employee}, limit , employee_populate) 
                      if(available == true){  
                      if(credential.message.role.organization_Type == 'Platform_Provider' && user.message.employee.branch) 
                      {
                          if(credential.message.employee.branch != user.message.employee.branch) 
                             resolve(null)
                      }
                      if(user.message.role.organization_Type !== 'Platform_Provider') 
                      {
                          if(credential.message.employee.organization.organization_Name !== user.message.employee.organization.organization_Name ) 
                             resolve(null)
                      }
                      element.role = credential.message.role.role_Name;
                      element.organization = element.organization.organization_Name
                     if(element.branch)
                             element.branch = element.branch.branch_Name
                       resolve(element);
                       return element
                        }
                      else{ 
                       resolve(null)
                     }
                    }  
             })
           });    
                 var data = await Promise.all(promises)  
                 data = await data.filter(Boolean);  
                 //console.log(data.length == 1)   
                 if(limit == 1 && data.length == 1 )
                      {
                          data = await data.reduce((emp)=> {return emp})  
                          return {success:true,  message: data};
                      }
                 else if( data.length > 0) 
                          return {success:true,  message: data};    
                 else 
                        return {success: false, message: 'Employee viewing is out of access'}                
                 }
                 else
                    return {success:false ,  message: 'No Employee have been found'};
       }catch(err){throw err}
  },
  async update_Employee (req,res){
    try{
        employee = await Employee_credential.search_For_Employee_Credential_IV({employee: req.query._id}) 
      //  console.log('yeees')
        if(employee.success){
        if( await Auth.authenticate_Access({employee: employee.message.role.role_Id, editor: true},req.user.employee)){ 
            var Employee_Object = await this.create_Employee_Object(req);
            if(Employee_Object.organization) delete Employee_Object.organization;
            if(Employee_Object.employee_Id)  delete Employee_Object.employee_Id;
            if(Employee_Object.branch_Name) delete Employee_Object.branch_Name;
            console.log(Employee_Object)
          var result = await Employee.findByIdAndUpdate(employee.message.employee,{$set: Employee_Object},{new: true, runValidators: true, context:'query'})
               if(result) 
                   return await Respond.respond(req, res,{success: true , message: `Employee Id - ${employee.message.employee.employee_Id} - updated`});
               else 
                   return await Respond.respond(req, res,{success: false , message: `Employee Id - ${employee.message.employee.employee_Id} - have not been found`});
              }
          else  
               return await Respond.respond(req , res,{success: false , message: "attempt to update an employee data with out access"});
           }  
          else 
              return await Respond.response(req , res,{success: false , message: "The employee provided does not exist"});
    }catch(err){
      if(!result && req.file)
        await utility.delete_file(req.file.path)
      throw err   }
},
// async delete_Employee_EV(req,res){
//     try{        
//         employee = await this.search_For_Employee_EV(req, {employee: req.query._id}); 
//         if(employee.success){ 
//         if( await Auth.authenticate_Access({employee: employee.message.role.role_Id, remove: true},req.user.employee)){
//         //  var result = await Employee.findByIdAndDelete(req.query.id)   //.then(result =>{
//         //    if(result)
//           //      {     
//                   var credential = await Employee_credential.delete_Employee_Credential(employee._id) //.then(credential=>{
//                       if(credential)
//                          {
//                               var result = this.delete_Employee_IV({employee: req.query._id}) 
//                               if(result.success)
//                                  return await Respond.respond(req , res,{success: true, message:'Employee have been successfully deleted'})
//                               else
//                                  throw new Error('Employee Credential has been deleted but the Employee Information could not be deleted');
//                          } 
//                       else 
//                           return await Respond.respond(req , res,{success: false, message:'Employee credential have not been found'});   
//                 //  }).catch(err=> {throw err})
//                 // }
//                 // else{
//                 //     return await Respond.respond(req , res,{success: false, message:'Employee is not found'});
//                 // }
//         // }).catch(err=>{
//         //     throw err
//         // })
//      }
//     else 
//          return await Respond.respond(req , res,{success: false , message: "attempt to delete an employee with out access"});
//      }
//     else
//          return await Respond.respond(req , res,{success: false , message: "The employee does not exist"}); 
//     }catch(err){  throw err }
// },


async find_Employee(req, res , limit = 1 , populate = 'organization branch' , select = 'name phone_Number address employee_Id'  , type = 1){
   try {
    var employee  
    if(type == 1)
             employee = await this.view_Employee(req , req.query , limit)
    else
             employee = await this.search_For_Employee_EV(req , req.query , limit) 
               console.log(employee.message.length)
                     return await Respond.respond(req,res , employee)       
   } 
   catch (error) {  throw error}
},

async search_for_Employee_IV(data , limit = 1 , populate = 'organization'){
    try{
     const query_Object = {};
        if(data.name){    
        var name =  data.name.split(' ');
          if(name[0])
          query_Object['name.first_Name'] = {
                   $regex:  new RegExp(name[0],'ig') 
                       }
          if(name[1])
           query_Object['name.last_Name'] = {
                $regex:  new RegExp(name[1],'ig') 
                                             }
           if(name[2])
              query_Object['name.grand_Father_Name'] = {
              $regex:  new RegExp(name[2],'ig') 
                                   }
            }
     if(data.organization) 
       {
          var organization = await Organization.Search_For_Organization_IV({_id: data.organization}) //.catch(err=>{
           if(organization.success)       
                   query_Object.organization = organization.message._id;
       } 
     if(data.branch){
         var branch = await Branch.search_For_Branch_IV({_id: data.branch})  //.catch(err =>{throw err})
         if (branch.success)  query_Object.branch = branch.message._id;
       }  
     if(data.employee_Id)
          query_Object.employee_Id = data.employee_Id;  
     if(data._id)
          query_Object._id = data._id ;    
      if(data.email)
         query_Object.email = data.email                 
      if(populate == '')
        populate = [{path: 'organization' , select: '_id organization_Name organization_Id'} , {path: 'branch' , select: '_id branch_Name branch_Id'} ]     
     var result = await Employee.find(
        query_Object
     ,null ,
      {sort:{
           'name.first_Name': 1,
           'name.last_Name': 1,
           'name.grand_Father_Name': 1
      }})
      .populate(populate)
      .limit(limit)
      .select('-createdAt -updatedAt -__v')
     if(result.length == 1) {
      result = result.reduce((emp)=> {return emp})
    
      return {success:true, message: result};
    }
else if(result.length > 1 )   
      return {success:true, message: result};
else
      return {success: false , message: 'Employee is not found'};
   }
     catch(err){ throw err }
},
async Employee_Aggregate(data){
  try{
     var group_Id = {} , sort_Id = {} , lookup = {}, lookup_role = {}, lookup_organization={}, lookup_branch ={}  , group = {} , sort = {} ,match = {} , limit = {} , project ={}
     var   unwind_lookup = {} ,   unwind_lookup_role = {} , unwind_lookup_organization = {},     unwind_lookup_branch= {}
     switch (data.group) {
         case 'day':
               group_Id =   { "day": {"$dayOfMonth": "$createdAt"} ,"month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}               
               sort_Id = {  "_id.year" : -1, "_id.month" : -1,  "_id.day": -1  } 
               break;
         case 'month':
               group_Id =   { "month": { "$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} 
               sort_Id = {  "_id.year" : -1, "_id.month" : -1 }              
              break;
         case 'year':
                group_Id =   {  "year" : {"$year": "$createdAt"}} 
                sort_Id = {  "_id.year" : -1 }                
                  break;       
         default:
             break;
     }       
     if(Object.keys(group_Id).length !== 0)
           group = {  "$group" : {   "_id": group_Id ,   "count": {"$sum" : 1}   }   }; 
     if(Object.keys(sort_Id).length !== 0)    
           sort =  {  "$sort" : sort_Id }    
     if(data.lookup && data.lookup == "Credential") 
           { lookup =   {"$lookup" : { "from" : "Employee Access Information" , "localField" : "_id" , "foreignField" : "employee" , "as": "Employee_credential"}},
             unwind_lookup  =   {$unwind : "$Employee_credential"}
           }
     if(data.lookup_role && data.lookup_role == "Role") 
         {  lookup_role =            {"$lookup" : { "from" : "Role" , "localField" : "Employee_credential.role" , "foreignField" : "_id" , "as": "Role"}},
            unwind_lookup_role =                {$unwind : "$Role"}
          }               
     if(data.lookup_organization && data.lookup_organization == "Organization") 
             {    lookup_organization =   {"$lookup" : { "from" : "Organization" , "localField" : "organization" , "foreignField" : "_id" , "as": "Organization"}},
                  unwind_lookup_organization   =        {$unwind : "$Organization"}
                         }
     if(data.lookup_branch && data.lookup_branch == "Branch") 
       {      lookup_branch =    {"$lookup" : { "from" : "Branch" , "localField" : "branch" , "foreignField" : "_id" , "as": "Branch"}}, 
              unwind_lookup_branch =    {$unwind : "$Branch"}
          }    
       if(data.match)
        var match = {"$match" : data.match }
       if(data.limit)
        var limit = {"$limit" : data.limit } 
        if(data.project)
        var limit = {"$project" : data.project }     
   var  query =  [     
      lookup,
      unwind_lookup,
      lookup_role,
      unwind_lookup_role,
      lookup_organization,
      unwind_lookup_organization,
      lookup_branch,
     // unwind_lookup_branch,
      match,
      group,        
      sort, 
      limit, 
      project      
               ]
    var filtered_query =  query.filter(element => {
      return Object.keys(element).length > 0 
  })       
                 
   // console.log(filtered_query)       
    var result =  await Employee.aggregate(filtered_query)    

    if(data.total) 
          {
              var total = 0;
              for(i=0 ; i<result.length ; i++)
                   total += result[i].count
              result.push({"_id": "total" , "count": total})     
          }
      return {success:true, message: result};
    }catch(err){throw err}
},
async aggregate_worker(req,res){
  try{
  //  if(await Auth.authenticate_Access({analysis: { creator: true}},req.user.employee)){ 

          var data = await report.begin_aggregation(req);
          var created_aggregation = await report.aggregate_creator(data);
         
          var aggregate = await   Employee.aggregate(created_aggregation)
          var result = await report.result_generator(aggregate,req.body.output)
         
          Respond.respond(req,res,result) 
        // }
        // else 
        //         return Respond.respond ( req,res ,{success: false, message: "attempt to generate report with out access"});
  }catch(err) {throw err}
},
async employee_aggregates(req,res ,data = {total: true}){
  try{
         
    var result =  await Employee.aggregate(
      [
         
          {"$lookup" : { "from" : "Organization" , "localField" : "organization" , "foreignField" : "_id" , "as": "Organization"}},
          {"$unwind": "$Organization"},
          { $group: { _id: "$Organization.organization_Name",  count: { $sum: 1 }  } }   
      ]
      )
  //  console.log(result)  
  var date  = [];
  var backgroundColor =[];
  var borderColor = [];
  var count = [];
          result.forEach(element=>{
                date.push(element._id)
                count.push(element.count)
                var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
                backgroundColor.push(color + "0.2)");
                borderColor.push(color + "1)");
          }) 
  var total = 0
  if(data.total) 
        {      
            for(i=0 ; i<result.length ; i++)
                 total += result[i].count
            result.push({"_id": "total" , "count": total})     
        }
     //   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";

     return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
    }catch(err){  
      throw err}
},
async employee_aggregatess(req,res ,data = {total: true}){
  try{
         
    var result =  await Employee.aggregate(
      [
         
        //  {"$lookup" : { "from" : "Organization" , "localField" : "organization" , "foreignField" : "_id" , "as": "Organization"}},
       //   {"$unwind": "$Organization"},
          { $group: { _id: "$gender",  count: { $sum: 1 }  } }   
      ]
      )
  //  console.log(result)  
    var data  = []
    var count = []
            result.forEach(element=>{
                  data.push(element._id)
                  count.push(element.count)
            }) 
         if(count.length != 0)
    var total = count.reduce((a,b)=> a+b);
      return Respond.respond(req,res, {success:true, message: {data,count,total}});
    }catch(err){  
      throw err}
},
async delete_Employee_IV(data){
  try{        
      employee = await this.search_for_Employee_IV(req, data); 
      if(employee.success){ 
        var result = await Employee.findByIdAndDelete(req.query.id)   
          if(result)
                   return {success: true , message: result}
              else{
                  return {success: false, message:'Employee is not found'};
              }
  }
  else
       return {success: false , message: "The employee does not exist"}; 
  }catch(err){  throw err }
},

async create_Employee_Object(req){
    try{
     // req.body.age = '89'
      console.log(req.body)
    var employee= {
        name:{
            first_Name: req.body.first_Name,
            last_Name: req.body.last_Name,
            grand_Father_Name: req.body.grand_Father_Name}, 
        email: req.body.email,   
        phone_Number: req.body.phone_Number,
        address: req.body.address,
        employee_Id: req.body.employee_Id,
        organization_Name: req.body.organization_Name, 
        role_Name: req.body.role_Name,
        branch_Name: req.body.branch_Name,
        age: req.body.age,
        gender: req.body.gender
               };
              
       if(req.file){
         console.log('nowhere')
        employee.profile_Picture = "/uploads/Employee_Profile/" +  req.file.filename  
       } 
       Object.keys(employee).forEach(key=>employee[key] === undefined ? delete employee[key]: {})    
       return employee
      }
      catch(err){throw err}         
},

}
   