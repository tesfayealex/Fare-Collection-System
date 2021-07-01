
const Employee_credential = require('../Models/Employee_credential');
var Employee = require('../Models/Employee_Model');
const bcrypt = require('bcryptjs');
const config = require('../../config/index');
const jwt = require('jsonwebtoken');
const Auth = require('../../helpers/authenticator');
const Respond = require('../../helpers/Response');
const Role = require('../Controllers/Role_Controller');
// const mongoose = require('mongoose')
// //const New_Employee = require('../Models/New_Employee');

// const Employee =  mongoose.model()

module.exports = {
     async register_Employee_Credential (id,role,req){ 
        try{  
           var Employee_Credential_Object = await this.create_Employee_Credential_Object(req); 
      
                Employee_Credential_Object.employee = id ;
                Employee_Credential_Object.password = '0000';
                Employee_Credential_Object.role = role;
                Employee_Credential_Object.status = 'Activated'; 
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(Employee_Credential_Object.password, salt)  
             Employee_Credential_Object.password = hash;
             let employee_credential= new Employee_credential(Employee_Credential_Object)
              var result =  await Employee_credential.create(employee_credential)
                   if(result)  
                      return {success: true , message: 'Employee credential registered'}
                   else  
                      throw new Error('Employee credential account could not be created')  
      }
                catch(error){
                    try{
                         await Employee.findByIdAndDelete(Employee_Credential_Object.employee)
                          throw error
                      }catch(err){throw err}
                }
                    //  }    
    },
    async search_For_Employee_Credential_EV (req, data ,  limit = 1 ,populate = ''){
        try{
        var employee = await this.search_For_Employee_Credential_IV(data,limit,populate) 
        var user =  await this.search_For_Employee_Credential_IV({employee: req.user.employee},limit,populate)  
       if(employee.success){
        if(Auth.authenticate_Access({employee: employee.message.role.role_Id, viewer: true}, req.user.employee)){ 
          if(employee.message.role.organization_Type == 'Platform_Provider' && user.message.role.role_Name != 'Super_Administrator') 
              {
                  if(employee.message.employee.branch != user.message.employee.branch) 
                      return {success: false, message: 'Do not have access to view Employee'};
              }
              if([employee.message].length == 1  )   employee.message.password = undefined;
              else for(x in [employee.message])   {[employee.message][x].password = undefined}
             return employee
        }
        else{
            return {success: false, message: 'attempt to view an employee credential data with out access'};
        }
       } 
       else 
            return {success: false, message: 'Employee could not be found'};

       }catch(err){throw err}
     },
    async search_For_Employee_Credential_IV(data, limit = 1 ,populate = ''){
     try{
        var query_Object = {} 
       if(data.employee)
               query_Object.employee = data.employee;
       if(data.username)
               query_Object.username = data.username        
       if(data._id)
               query_Object._id = data._id
       if(data.status)
            query_Object.status = data.status
       if(data.role)
            query_Object.role = data.role     
       if(populate == '')                        
       populate = [{path: 'employee' , select: '-createdAt -updatedAt -__v'},{path: 'role' , select: '_id role_Name role_Id'}] 
       var result = await Employee_credential.find(query_Object)
                           .limit(limit)   
                           .populate(populate) 
                           .select('-createdAt -updatedAt -__v')         
       if(result.length == 1) {
        result = result.reduce((employee)=> {return employee})
        return {success:true, message: result};
      }
  else if(result.length > 1 )   
        return {success:true, message: result};
  else
        return {success: false , message: 'Employee is not found'};                         
       }catch(err){throw err}         
                                           },
    async reset_Employee_Credential(req,res){
        try{
           
            employee = await this.search_For_Employee_Credential_EV(req , {employee: req.query._id})  
            if(employee.success){
                if( await Auth.authenticate_Access({employee: employee.message.role.role_Id , editor: true},req.user.employee)){
                    employee_credential = {};
                    let salt = await bcrypt.genSalt(10);
                    let hash = await bcrypt.hash('0000', salt);
                    employee_credential.password = hash; 
                   var result = await Employee_credential.findByIdAndUpdate(employee.message._id,{$set: employee_credential},{new: true, runValidators: true , context:'query'})
                        if(result) 
                          return await Respond.respond(req, res,{success: true , message: `Employee Id - ${employee.message.employee.employee_Id} - credential have been reset`});
                       else 
                          return await Respond.respond(req, res,{success: false , message: `Employee Id - ${employee.message.employee.employee_Id} - have not been found`});
                        }
                        else 
                            return  await Respond.respond(req , res,{success: false , message: "attempt to reset an employee credential data with out access"});
                       }  else 
                                return await Respond.respond(req , res, employee);
            }
            catch(err){ throw err; }  
    },
    async login_Employee(req,res){
        try{ 
          //  console.log(Employee)
             var user = {};
            if(req.body.username) 
              user = await  this.search_For_Employee_Credential_IV({username:req.body.username},1,'none')
          
       if(user.success) {
       var isMatch  = await bcrypt.compare(req.body.password, user.message.password) 
              if(isMatch) {
            var result = await this.account_Activation_Checkup(user.message);
            var access = await Role.get_role_side_bar(user.message.role); 
                 if(result.success) {         
                let token = await jwt.sign({
                      type: "employee",
                      data: {
                          _id: user.message._id,
                          username:  user.message.username,
                          access: access.message
                        }
                  }, config.JWT_SECRET,{ expiresIn: 43200})
                  let credential = {
                      username: user.message.username,
                      access: access.message,
                      token: `jwt ${token}`,
                      expiresIn: 168
                                 }
                         return await Respond.respond(req , res , {success: true , message: credential})
                    }
                    else 
                       return await Respond.respond(req,res, result)            
                     }
              else  
                return await Respond.respond(req, res , {success: false , message: 'Password do not match'});
            }
            else    
                return await Respond.respond(req, res , {success: false , message: "Username does not exist"});
          
        }catch(err){ throw err } 
             },
             async account_Activation_Checkup(user){
                try{  
                  var result = await  Employee.findById({_id: user.employee}).populate('organization branch')
                
                        if(result)
                           {
                            
                              if(user.status !== 'Activated')
                                   return {success: false , message: `Your account is ${user.status}`}
                              if (result.organization.status !== 'Activated')
                                   return {success: false , message: `Your Organization account is ${result.organization.status}`}
                              if(result.branch && result.branch.status !== 'Activated')
                                   return {success: false, message: `Your Branch account is ${result.branch.status}` }
                              return {success: true}                       
                           }
                          else 
                             return {success: false , messsage: 'Employee could not be found'} 
                }catch(err){throw err}   
               },
             async change_Employee_Credential(req,res){
                try{
                  var Employee_Credential_Object =  await this.create_Employee_Credential_Object(req)
                     if(Employee_Credential_Object.old_Password){
                    const user = await this.search_For_Employee_Credential_IV({employee:req.user.employee});
                    if(user.success) {    
                    var result = await bcrypt.compare(Employee_Credential_Object.old_Password, user.message.password)
                          if(result){ 
                            let salt = await bcrypt.genSalt(10);
                            let hash = await bcrypt.hash(Employee_Credential_Object.password, salt)  
                             Employee_Credential_Object.password = hash;
                          var employee = await Employee_credential.findByIdAndUpdate(user.message._id,{$set: Employee_Credential_Object},{new: true, runValidators: true, context:'query'})
                                if(employee)   return await Respond.respond(req , res , {success: true, message:'Credential have been changed'});
                                
                                     }
                        else  
                            return await Respond.respond(req, res, {success: false , message: 'Old password is incorrect'});
                    }
                    else
                        return await Respond.respond(req, res , {success: false , message:'Credential are not found'});
                  }else
                        return await Respond.respond(req , res , {success: false , message:'Old password is not detected'});
                }catch(err){   throw err}
             },
             async activate_Employee_Credential(req,res){
                try{
                    employee = await this.search_For_Employee_Credential_EV(req,{employee: req.query._id})  //.catch(err=>{throw err});
                   if(employee.success){   
                 if( await Auth.authenticate_Access({employee: employee.message.role.role_Id , editor: true },req.user.employee)){
                    let employee_credential = {
                        status: 'Activated'
                    }
                   var result = await Employee_credential.findByIdAndUpdate(employee.message._id,{$set: employee_credential}, {new: true, runValidators: true, context:'query'})
                         if(result)
                             return await Respond.respond(req , res , {success:true, message: `Employee Id - ${employee.message.employee.employee_Id}  Credential Activated`});
                         else 
                             return await Respond.respond(req , res , {success: false, message: 'Employee Credential not found'});     
                 }
                 else
                    return await Respond.respond(req, res , {success: false , message: "attempt to activate credentials with out access"});
                }
                else 
                    return await Respond.respond(req, res , {success: false, message: 'Employee is not found'});
                }  catch(err){ throw err }
             },
             async deactivate_Employee_Credential(req,res){
                try{
                    employee = await this.search_For_Employee_Credential_EV(req,{employee: req.query._id})  //.catch(err=>{throw err});
                    if(employee.success){ 
                    if( await Auth.authenticate_Access({employee: employee.message.role.role_Id , editor: true },req.user.employee)){ 
                    let employee_credential = {
                        status: 'Deactivated'
                    }
                   var result = await Employee_credential.findByIdAndUpdate(employee.message._id,{$set: employee_credential} , {new: true, runValidators: true, context:'query'})
                    if(result)
                        return await Respond.respond(req , res , {success:true, message: `Employee Id - ${employee.message.employee.employee_Id}  Credential Deactivated`});
                    else 
                        return await Respond.respond(req , res , {success: false, message: 'Employee Credential not found'});      
                }
                else
                    return await Respond.respond(req, res , {success: false , message: "attempt to deactivate employee credentials with out access"});
               }
               else
                   return await Respond.respond(req, res , {success: false, message: 'Employee is not found'});
               }  catch(err){ throw err }
             },
             async delete_Employee_Credential(id){
                 try{ 
                var result = await Employee_credential.findOneAndDelete({employee: id})
               
                    if(result) 
                               return true;
                    else     
                              return false;
                  }catch(err){throw err}
             },
             async create_Employee_Credential_Object(req){
                try{
                var  employee_credential= {
                    username: req.body.username,
                    password: req.body.password,
                    old_Password: req.body.old_Password,
                    role: req.body.role
                };
                   Object.keys(employee_credential).forEach(key=>employee_credential[key] === undefined ? delete employee_credential[key]: {})      
                   return employee_credential
                  }
                  catch(err){throw err}         
            },
      }