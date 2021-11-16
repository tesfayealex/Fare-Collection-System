
//const Employee_credential = require('../User Managment Module/Controllers/Employee_credential_controller');
//const Role = require('../User Managment Module/Controllers/Role_Controller');
//const {Role} = require('./internal');
//const emp = require('../User Managment Module/Models/Employee_credential')
const passport = require('passport');
const Employee = require('../user_managment_module/models/employee_credential');
const Role = require('../user_managment_module/models/role');


const authenticate_User = passport.authenticate('jwt' , {session: false});
const authenticate_Access_deeper =  async (role , key , value)=>{
  var access_for = []; 
  var role = await Role.findById(role)
      //    console.log(role)
     for(var elm in role.access)
        {
          // console.log('1111111111111111')   
          // console.log(elm)
            if(elm == key) 
             {
              // console.log('2222222222222222')   
              // console.log(key)
                  for(var access in role.access[elm])
                    {
                      // console.log('333333333333')   
                      // console.log(access)
                      var access_levels = ['viewer' , 'editor' , 'creator'];
                      var type =  Object.keys(role.access[elm][access])[0]
                     // console.log(type)
                      var type_index = access_levels.indexOf(type)
                      var access_type_index = access_levels.indexOf(value)
                    //  console.log(type_index + '  '+ access_type_index)
                      if(type_index >= access_type_index) 
                           access_for.push(access) 
                      // else 
                      //     return false     
                      //   if(role.access[elm][access][value])
                      //         access_for.push(access)
                    }
             }
        }
      return access_for;  
}

const authenticate_Access = async (access_For,employee_id)=>{
    try{    
    var  employee = await Employee.find({employee: employee_id}).limit(1).populate('role');  //.search_For_Employee_Credential_IV({employee: employee_id},1,'role') //.populate('role')
    //  .catch(err=>{
    //          throw err
    //    })   
    if(employee){
        employee = employee.reduce(emp=>{return emp}); 
        
    //  employee = JSON.stringify(employee);
    //  employee = JSON.parse(employee);      
    access_name = Object.keys(access_For)[0];
    if(!Object.keys(access_For)[1])
          access_type = Object.keys(access_For[access_name])[0];
    else 
          access_type =  Object.keys(access_For)[1];     
      var access_levels = ['viewer' , 'editor' , 'creator'];
      // var type_index = x.indexOf(type)
      var access_type_index = access_levels.indexOf(access_type)          
   // console.log(access_name);
    //console.log(Object.keys(access_For)[1]);
    //console.log(access_type);
    // console.log(employee.role)
     var result = await Role.find({_id: employee.role._id}).limit(1)
      //   .catch(err=>{
      // throw err
      //            })
    //  console.log(result);    
    
      result = result.reduce(rol=>{return rol})       
      result = JSON.stringify(result);
      result = JSON.parse(result);  
     // console.log(access_For);
     // console.log(result);
   //  var result = result;
   //  console.log(result);
     // console.log(result.access)
    // console.log(access_For)
     
    if(result){
      for(var values in result.access){      
              if(values == Object.keys(access_For)[0] ){ 
                 if(Object.keys(access_For)[1]){
                  // console.log('yessssssssssssss')
                  //  console.log(access_For[access_name])
                  for(var type in result.access[values]){
                    //  console.log('lllllllllllllllllllllllllllll')
                    //  console.log(type + '  ' +access_For[access_name])
                    if(type == access_For[access_name]){
                      var type =  Object.keys(result.access[values][type])[0]
                      var type_index = access_levels.indexOf(type)
                    //  console.log(type_index + ' ' + access_type_index)
                      if(type_index >= access_type_index) 
                        {
                      //    console.log(type_index + ' ' + access_type_index)
                           return true 
                        }
                      else 
                          return false 
                        //    for(var inner in result.access[values][type]){
                        //         console.log('hellllllllllllllllllloo')  
                        //         console.log(result.access[values]);  
                        //           if(inner == access_type){
                                       
                        //                 return result.access[values][type][inner]

                        //                                    }
                        //  //return access_For[access_name][access_type]
                        //                                    }                     
                            }
                          }
                     return false
                   }
                 else{
                     var type =  Object.keys(result.access[values])[0]
                     var type_index = access_levels.indexOf(type)
                     if(type_index >= access_type_index) 
                         return true 
                     else 
                         return false    
                    
                  
                 }      
                
                        }    
                      }
                  return false    
         }else{
              return false
         }
        }else{
              return false
        }
    }catch(err){
      //  console.log(err);
        throw err
    }                                  
}

module.exports = {
    // respond,
    // error_Handler,
    // logparams,
    // Property_Validator,
  //  authenticate_Access_To_Employee_Controller,
    authenticate_Access,
    authenticate_Access_deeper,
    authenticate_User
    // storage,
   // upload
}