const {ExtractJwt, Strategy } = require('passport-jwt');
//const Role = require('../User Managment Module/Models/Role');
const Employee_credential = require('../user_managment_module/controllers/employee_credential_controller');
const Customer = require('../wallet_module/controllers/wallet_controller');
//const Machine = require('../Organization Module/Controllers/Machine_controller')
const Machine = require('../organization_module/controllers/machine_controller')
const config = require('../config/index');

module.exports =  (user_Type , passport)=>{
         try{
       let options = {};
       options.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
       options.secretOrKey = config.JWT_SECRET;
       passport.use(new Strategy( options,async (payload,done)=>{
          // role = Role.find({role_Name: user_Type}) 
         //  console.log(user_Type)
         
           if(user_Type == 'Employee'){  
  
           var employee = await Employee_credential.search_For_Employee_Credential_IV({_id: payload.data._id},1,'role') //,(err, employee)=>{
           //   console.log(employee)
          //    if(err) return done(err,false);
             // console.log(employee) 
             if(employee.success)   //{ 
                        //  console.log(employee.message)
                         // console.log(employee.message)
                          return done(null, employee.message);
                          //    }
              else                
                  return done(null,false);
           //   })
                                          }
       else if(user_Type == 'Customer'){
          var customer = await Customer.search_For_Wallet_IV({_id: payload.data._id},1,'none')  //, ()=>{
            //  if(err)  return done(err,false);
                  
           // console.log(customer)
              if(customer.success)   { 
                       console.log(customer.message)
                      
                      return done(null, customer.message);
                          }
              else            
                      return done(null,false); 
            // })
       }
       else if(user_Type == 'Machine'){
               var machine = await   Machine.search_For_Machine_Iv({_id: payload.data._id})    
               if(machine.success)
                    return done(null, machine.message)
               else     
                    return done(null, false)
       }
       else{
              throw new Error('Attempt to change user type')
           }
     })) 
}catch(err){  return done(null,false)  }
}
