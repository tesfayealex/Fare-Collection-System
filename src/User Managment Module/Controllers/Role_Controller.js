
const Role = require('../Models/Role');
//const help = require('../../helpers');
const Auth = require('../../helpers/authenticator')
const Respond = require('../../helpers/Response')
const access_file = require('../../access_list');
//const { query } = require('winston');
module.exports = {
    async register_new_Role (req,res){
        try{ 
          if(await Auth.authenticate_Access({role:{creator: true }},req.user.employee)){
            var Role_Object = await this.create_Role_Object(req);  
            let role = new Role(Role_Object);             
              var result = await Role.create(role)
          //  .then(result=>{
                if(result) 
                     return await Respond.respond(req, res,{success: true , message: `Role Id - ${role.role_Id} - registered`});
                else 
                      return await Respond.respond(req, res,{success: false , message: `Role is not registered`});  
            // })
            // .catch(err=>{
            //     Respond.Property_Validator(err)
            //     .then(message=>{ this.respond(req,res,{success: false , message: message}) })
            //     .catch(err=>{throw err})
            // })
          }
          else
            return await Respond.respond(req , res,{success: false , message: "attempt to register an role with out access"});
        }catch(err){  throw err }
  },
  async search_For_Role_EV (req, data , limit = 1){
    try{
         if(await Auth.authenticate_Access({role: {viewer: true}},req.user.employee))
                            var result = await this.search_For_Role_IV(data , limit)
                                    // .then(result=>{
                                    if(result)  
                                           return result      
                                      //})
                                  //   .catch(err=>{throw err}); 
              else
                    return {success: false, message: "attempt to find a Role with out access"};
    }catch(err) {throw err}
                  },
      async find_Role(req,res, limit = 1){
             try {
                         var role = await  this.search_For_Role_EV(req ,req.query , limit)
                        //  .then(route=>{  
                          return await Respond.respond(req,res , role)           
                          //               })
                          // .catch(err=>{throw err})
                 } 
              catch (error) {  throw error}
                  }, 
   async search_For_Role_IV(data, limit = 1){
                    try{
                        var query_Object = {};  
                        if(data.role_Id)
                             query_Object.role_Id = data.role_Id;
                        if(data.role_Name){
                         query_Object.role_Name = {
                                    $regex : new RegExp(data.role_Name,'ig')
                                                     }  
                                           };
                        if(data.organization_Type) 
                             query_Object.organization_Type =  data.organization_Type;
                        if(data.organization_Type) 
                             query_Object.organization_Type =  data.organization_Type;                        
                        if(data._id)
                             query_Object._id = data._id  
                        if(data.status)
                             query_Object.status = data.status                            
                       //console.log(query_Object)  
                     var result = await Role.find(query_Object)     //.catch(err=>{throw err})
                          .limit(limit)
                          .select('-createdAt -updatedAt -__v')
                         // console.log(result.length == 0)
                       if(result.length == 1) {
                                result = result.reduce((role)=> {return role})
                                return {success:true, message: result};
                              }
                       //   .then(result=>{
                       else if(result.length > 1 )   
                                return {success:true, message: result};
                       else
                                return {success: false , message: 'Role is not found'};
                            //elements: Object.keys(result).length
                          // }) 
                          // .catch(err=> {throw err})                         
                    }catch(err){throw err}
                  },                              
  async update_Role (req,res){
    try{
        var role = await this.search_For_Role_EV(req, {_id: req.query._id})  //.catch(err=>{ throw err });
        if(role.success){
        if(await Auth.authenticate_Access({role:{creator: true}},req.user.employee)){
        var Role_Object = await this.create_Role_Object(req);
        if( Role_Object.role_Id)  delete Role_Object.role_Id; 
        if(Role_Object.organization_Type)  delete Role_Object.organization_Type;   
       // if(req.body._id) delete req.body._id; 
        var result = await Role.findByIdAndUpdate(role.message._id,{$set: Role_Object},{new:true,runValidators:true,context:'query'})
        //.then(result=>{
         if(result)  
                return await Respond.respond(req , res , {success: true, message: `Role Id - ${role.message.role_Id} have been updated`});
         else
                return await Respond.respond(req , res , {success: false, message: `Role is not found`}); 
        //  })
        //  .catch(err=>{
        //         Respond.Property_Validator(err)
        //         .then(message=>{ this.respond(req,res,{status: false , message: message}) })
        //         .catch(err=>{throw err})   
        //          })
                       }
             else
                    return await Respond.respond(req, res , {success: false, message: "attempt to update a role with out access"});
                    }
             else
                      return await Respond.respond(req , res , {success: false , message: ' Role is not found'});   
    }catch(err){
       throw err
    }
},
// async delete_Role (req,res){
//     try{ 
//         var role = await this.search_For_Role_EV(req)   //.catch(err=>{throw err });
//         if(role.success) {        
//            if(await Auth.authenticate_Access({role:{remove: true}},req.user.employee)){     
//        var result = await Remove.findByIdAndDelete(role.message._id)
//         // .then(result=>{
//             if(result)  
//                   return await Respond.respond(req , res , {success: true, message: `Role Id - ${role.message.role_Id} have been deleted`});
//             else 
//                   return await Respond.respond(req , res , {success: false, message: `Role is not found on database`});
//             // })
//             // .catch(err=>{throw err});
//              }  
//             else
//                  return await Respond.respond(req, res , {success: false , message: "attempt to delete a role with out access"});
//         }
//         else
//                 return await Respond.respond(req , res , {success: false , message: 'Role is not found'});
//     }catch(err){  throw err  }
// },
async activate_Role(req,res){
  try{
      var role = await this.search_For_Role_IV({_id: req.query._id})  //.catch(err=>{throw err});
       if(role.success){
             if(await Auth.authenticate_Access({role: {editor: true}},req.user.employee)){
      let role_Object = {
          status: 'Activated'
      }
     var result = await Role.findByIdAndUpdate(role.message._id,{$set: role_Object},{new: true, runValidators: true, context:'query'})
    // .then(result=>{
       if(result.length !== 0)
         return await Respond.respond(req , res , {success:true, message: `Role - ${role.message.role_Name} is Activated`});
       else 
         return await Respond.respond(req , res , {success: false, message: 'Role could not  be found'});     
  //                   })
  //    .catch(err=>{throw err})
                          }
            else//{
                return await Respond.respond(req, res , {success: false , message: "attempt to activate a role with out access"});
           // }
      }
       else //{
              return await Respond.respond(req, res , {success: false, message: 'Role is not found'});
            //}
       }  catch(err){ throw err }
             },
async deactivate_Role(req,res){
   try{
    var role = await this.search_For_Role_IV({_id: req.query._id})
    if(role.success){
      if(await Auth.authenticate_Access({role: {editor: true}},req.user.employee)){
let role_Object = {
   status: 'Deactivated'
}
     var result = await Role.findByIdAndUpdate(role.message._id,{$set: role_Object},{new: true, runValidators: true, context:'query'})
    // .then(result=>{
       if(result.length !== 0)
         return await Respond.respond(req , res , {success: true, message: `Role - ${role.message.role_Name} is Deactivated`});
       else 
         return await Respond.respond(req , res , {success: false, message: 'Role could not  be found'});     
  //                   })
  //    .catch(err=>{throw err})
                          }
            else//{
                return await Respond.respond(req, res , {success: false , message: "attempt to deactivate a role with out access"});
           // }
      }
       else //{
              return await Respond.respond(req, res , {success: false, message: 'Role is not found'});
          // }
      }  catch(err){ throw err }
},
async create_Role_Object_2(req , access){
    try{
       var role= {
        role_Id: req.body.role_Id,
        role_Name: req.body.role_Name,
        organization_Type: req.body.organization_Type,
        role_Type: req.body.role_Type,
        status: req.body.status,
        access: access
                        };
       var temporary_role = {}
       for(i=0;i<role.access.length ;i++)
          {
              var access_levels = Object.values(role.access[i])
              var access_names = Object.keys(role.access[i])
              temporary_role[access_names[0]]  = access_levels[0]
          }
        role.access = temporary_role;
      //  console.log(role.access)
   //  if(req.file)    organization.profile_Picture = req.file.path;
      role_entity = ['organization', 'branch', 'customer' , 'free_customer', 'role', 'bus' , 'route' , 'station' , 'fare', 'ticket' , 'transaction'];
      if(role.access){
               for(entity in role.access){
                      //console.log(entity)
                      if(Object.keys(entity)){
                          //console.log(entity)
                                if(entity == 'employee'){
                                     for(type in role.access[entity]){
                                         //  console.log(type)
                                           var employee_role_Id = await Role.findOne({role_Name: type})
                                          // console.log(employee_role_Id)
                                            role.access[entity][employee_role_Id.role_Id]  = role.access[entity][type]
                                            delete role.access[entity][type]
                                            if(employee_role_Id) {
                                               //  for(access_of in role.access[entity][type]){
                                                    // console.log(access_of)
                                                  //   if(access_of == "viewer" || access_of == "editor" || access_of == "creator") 
                                                  //   {
                                                //    console.log(role.access[entity])
                                                  //  console.log( role.access[entity][employee_role_Id.role_Id])
                                                    if(Object.keys(role.access[entity][employee_role_Id.role_Id]) == "viewer" || Object.keys(role.access[entity][employee_role_Id.role_Id]) == "editor" || Object.keys(role.access[entity][employee_role_Id.role_Id]) == "creator" )          
                                                        continue;
                                                    else
                                                         throw new Error('Role access fields have been tempered or are written wrong - access type not valued to true')
                                                    // }
                                                    // else
                                                    //     throw new Error('Role access fields have been tempered or are written wrong - access type is not available') 
                                                //}           
                                                    //           }    
                                                        }
                                             else
                                                      throw new Error('Role access fields have been tempered or are written wrong - employee role id not found')          
                                     }
                                }
                                else if(role_entity.includes(entity))
                                {
                                      // for(type in role.access[entity])
                                      // {
                                        // console.log(entity)
                                      if(Object.keys(role.access[entity])== "viewer" || Object.keys(role.access[entity])== "editor" || Object.keys(role.access[entity]) == "creator" )           
                                          continue;
                                        else
                                             throw new Error('Role access fields have been tempered or are written wrong - access type is not available')
                                        // }
                                        // else
                                        //     throw new Error('Role access fields have been tempered or are written wrong - access type is not available')    
                            }
                            else 
                                throw new Error('Role access fields have been tempered or are written wrong - role entity does not exist') 
                        }
                      else  
                         throw new Error('Role access fields have been tempered or are written wrong - role entity is not object')       
                                        }   
                     }
        Object.keys(role).forEach(key=>role[key] === undefined ? delete role[key]: {})   
     // await console.log(role.access);
       return role
      }
      catch(err){throw err}         
     },
    //  async respond (req,res,response_message){
    //     res.json(response_message)
    //     Respond.logparams(req,res)
    //     .then(message=>{
    //            message.success = response_message.success
    //            message.message = response_message.message
    //            logger.info(message);
    //                    })
    //     .catch(err=>{ throw err})
    //          return 
    //   }
    async role_chooser(){  
          var roles = await this.search_For_Role_IV({} , 100);
          var employee  = {children :[]} 
          var count = 2;
            roles.message.forEach(element =>{
              if(element.role_Id == 'PP-111AB' ) {
                employee.children.push(
                  { id: count , name: element.role_Name,
                     chidren:[ 
                               { id: count + 1, name: 'viewer' }
                              ]
                             } )
                       count += 2 
                        }
              else {
               employee.children.push(
                          { id: count , name: element.role_Name,
                             chidren:[ 
                             { id: count + 1, name: 'viewer' },
                             { id: count + 2, name: 'editor' },
                             { id: count + 3, name: 'creator' },]})

               count += 4
                             }
          })
          var data = await access_file.role_access_file();
        //  console.log(data)
          data.push({id: 1 , name: 'employee', employee})
          //console.log(employee)
          data.sort(function (a, b) {
            return a.id - b.id;
          })
          return data;
         // Respond.respond(req,res,{success: true , message: data})
    } ,
    async create_Role_Object(req,res){
         var access = ['editor' , 'viewer','creator']
          var new_role = [];
          var counter = 0;
         var main_value = await this.role_chooser();
        var data = await this.fake_data();
         for(i=0 ; i< data.length;)
         {
                    if(data[i+1] && access.includes(data[i+1].name))
                       {
                         if(data[i+2] && access.includes(data[i+2].name)) 
                           {
                            if(data[i+3] && access.includes(data[i+3].name))
                            {
                                counter = 4 ;
                            }
                            else
                            {
                                counter = 3;
                                }
                           }
                           else{
                               counter = 2;  
                              }
                            }            
          if(data[i].parent){

            var parent = await main_value.filter(element=> {return element.id == data[i].parent})
            role = await new_role.findIndex((element) =>{ return element[parent[0].name]})  
            if(role >= 0)
                 {
                   role = await new_role.findIndex((element) =>{ return element[parent[0].name]})
                      new_role[role][parent[0].name][data[i].name] =  { [data[i + counter -1].name]: true}
                 }
             else{    
            object = {
                [parent[0].name] : { 
                     [data[i].name]: { [data[i + counter -1].name]: true}
                                }
                   }
            new_role.push(object)     
                  }
          }
          else
            {
              object = {
                     [data[i].name]: { [data[i + counter -1].name]: true}
                   }
                   new_role.push(object)    
            } 
            i = i + counter;
         }
        var obj = await this.create_Role_Object(req,new_role) 
       // console.log(obj)
        Respond.respond(req,res,{success: true , message: obj})
    },
    async fake_data(){
      var query = [
        { "id": 2, "name": "Super Administrator", "parent": 1 },
        { "id": 5, "name": "editor" },
        { "id": 6, "name": "Branch Administrator", "parent": 1 },
        { "id": 8, "name": "editor" },
        { "id": 9, "name": "creator" },
        { "id": 10, "name": "Service Provider Administrator", "parent": 1 },
        { "id": 13, "name": "creator" },
        { "id": 26, "name": "bus" },
        { "id": 28, "name": "editor" },
        { "id": 30, "name": "route" },
        { "id": 32, "name": "viewer" },
      ]
      return query
    },
    async get_role_side_bar(_id){
        try{
            var role = await Role.findById(_id)
            var access_level = [];
            Object.keys(role.access).forEach(key => {
              if(!Object.keys(role.access[key]).includes('creator') && !Object.keys(role.access[key]).includes('editor') && !Object.keys(role.access[key]).includes('viewer'))
                       {
                          
                        Object.keys(role.access[key]).forEach(anotherkey => {
                          Object.keys(role.access[key][anotherkey]).forEach(skey=>{
                            access_level.push(skey)
                          })        
                            })
                  
                         if(access_level.includes('creator'))
                                  role.access[key] = 'creator'
                         else   if(access_level.includes('editor'))
                                  role.access[key] = 'editor'
                         else    
                                  role.access[key] = 'viewer' 
                                  access_level = [];
                                              
                       } 
               else 
                   {
                   
                    if(Object.keys(role.access[key]) == 'creator')
                         role.access[key] = 'creator'
                    else if(Object.keys(role.access[key]) == 'editor')
                         role.access[key] = 'editor'
                    else    
                         role.access[key] = 'viewer' 
                   }
                
            });
           return {status: true , message: role.access}
          }catch(err) {throw err}
    }
         
} 

