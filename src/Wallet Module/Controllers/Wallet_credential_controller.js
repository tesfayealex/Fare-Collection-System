
const Wallet = require('../Models/Wallet');
const bcrypt = require('bcryptjs');
const config = require('../../config/index');
const jwt = require('jsonwebtoken');
const Respond = require('../../helpers/Response');
const Auth = require('../../helpers/authenticator');
const Wallet_controller = require('../Controllers/Wallet_controller');
const wallet_refresh_token = require('../Models/Wallet_refresh_token');

module.exports = {
    async register_Wallet_Credential (id, body ,req){   
        try{
           var wallet_Credential_Object = await this.create_Wallet_Credential_Object(req);
           let wallet= new Wallet(wallet_Credential_Object);   
            wallet.customer = id;
      
            if(wallet_Credential_Object.user_access_type){
                if(wallet.user_access_type.includes('Both'))
                      wallet.user_access_type = ['Mobile' , 'Card'];
            
                 if(!wallet.user_access_type.includes('Mobile') ){
                wallet.password = '0000';
                wallet.username =  body.customer_Id;   
                       }
                 else{
                    if(!wallet.password)
                        
                       if(!wallet.username || !wallet.password)  
                      
                            throw new Error(`User name or Password could not be found while creating customer`)
                         
                 }
                 let salt = await bcrypt.genSalt(10);
                 let hash = await bcrypt.hash(wallet.password, salt);
                 wallet.password = hash;    
                
    var result = await Wallet.create(wallet) 
    
        if(result)
          return {success: true}; 
                  
        else  
      
            throw new Error('Wallet account could not be created')  
              
        }
       else 
    
           throw new Error('User access type could not be found')  
         
        }
        catch(err){
            try{

                throw err    
            }catch(err){throw err}
          
        }
    },
   
    async reset_Wallet_credential(req,res){
        try{
         var customer = await  Wallet_controller.search_For_Wallet_IV({customer: req.query._id})  
       
         if(customer.success){
            if( await Auth.authenticate_Access({customer: customer.message.customer_type , editor: true },req.user.employee) ){
            var reset_credential = {};
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash('0000', salt);
            reset_credential.password = hash;
         
            var result = await Wallet.findByIdAndUpdate(customer.message._id,{$set: reset_credential},{new: true, runValidators: true , context:'query'})
          
            if(result) 
                return await Respond.respond(req, res,{success: true , message: `Username - ${customer.message.username} - credential have been reset`});
            else 
                 return await Respond.respond(req, res,{success: false , message: `Username - ${customer.message.username} - have not been found`});
     
         }
         else  
            return await Respond.respond(req , res,{success: false , message: "attempt to reset a customer credential data with out access"});
           
        }
          else 
             return await Respond.respond(req, res,{success: false , message: "The Customer does not exist"});
             
          }
          catch(err){  throw err   }  
    },
    async login_Customer(req,res){
        try{

        const user = await Wallet.findOne({username:req.body.username}).populate('customer')    
      
      if(user) {
          if(user.status == 'Activated' ){
              if(user.user_access_type.includes('Mobile')) {
          var isMatch =  await bcrypt.compare(req.body.password, user.password ) 
         
              if(isMatch) {
             let token = jwt.sign({
                      type: "customer",
                      data: {
                          _id: user._id,
                          customer_Id: user.customer.customer_Id,
                          username:  user.username
                        }
                  }, config.JWT_SECRET,{expiresIn: '2h'} )
             let refresh_token = jwt.sign({
                    type: "customer",
                    data: {
                        _id: user._id,
                        customer_Id: user.customer.customer_Id,
                        username:  user.username
                      }
                }, config.JWT_SECRET_REFRESH,{expiresIn: '1d'} )  
                refresh_Token_Object = {
                  token: refresh_token,
                  wallet: user._id,
               
                }
                var result = await wallet_refresh_token.create(refresh_Token_Object); 
               
                 if(!result)
                     throw new Error('Refresh Token could not be created')
                  let output = {
                      customer_Id: user.customer.customer_Id,
                      username: user.username,
                      token: `jwt ${token}`,
                      refresh_token: refresh_token
                  
                               }
                  return await Respond.respond(req , res , {success: true , message: output})
                              }
              else  
                   return await Respond.respond(req, res , {success: false , message: 'Password do not match'});
                  }
                  else  
                       return await Respond.respond(req, res , {success: false , message: 'Customer does not have access to website'});
              
            }
            else 
                return await Respond.respond(req, res , {success: false , message: `Your account is ${user.status}`});
          
             }
            else  
                return await Respond.respond(req, res ,{success: false , message: "Username does not exist"});  
          
      }      
    catch(err){ throw err }         
},
async refresh_access_token(req,res){
 
  var token = req.headers['refresh_token'];
   if(token){ 
   var result = await wallet_refresh_token.findOne({token: token })
   if(result) {
    
      var payload =  jwt.verify(token,config.JWT_SECRET_REFRESH);
  
   const user = await Wallet_controller.search_For_Wallet_IV({_id: result.wallet})   //.catch(err=>{throw err}); 
  if(user) {
      if(user.message.status == 'Activated'){
   
         let token = jwt.sign({
                  type: "customer",
                  data: {
                      _id: user.message._id,
                      customer_Id: user.message.customer.customer_Id,
                      username:  user.message.username
                    }
              }, config.JWT_SECRET,{expiresIn: '2h'} )
              let output = {
                  customer_Id: user.message.customer.customer_Id,
                  username: user.message.username,
                  token: `jwt ${token}`,
               
                           }
              return await Respond.respond(req , res , {success: true , messsage: output})
                          }
              else  
                return await Respond.respond(req, res , {success: false , message: `Your account is ${user.message.status}`});
           
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
async change_Wallet_Credential(req,res){
    try{
         var wallet_Credential_Object = await this.create_Wallet_Credential_Object(req);
       if(wallet_Credential_Object.old_Password){
        const user = await Wallet_controller.search_For_Wallet_IV({customer:req.user.customer})  //.catch(err=>{throw err});
        if(user.success) {       
        var isMatch = await bcrypt.compare(wallet_Credential_Object.old_Password, user.message.password)
           
              if(isMatch){
              customer_credential = {};
              if(wallet_Credential_Object.username)
                  customer_credential.username = wallet_Credential_Object.username;
            
              if(wallet_Credential_Object.password)  
              {
                 let salt = await bcrypt.genSalt(10);
                 let hash = await bcrypt.hash(wallet_Credential_Object.password, salt);
                 customer_credential.password = hash;
              }
              var customer = await Wallet.findByIdAndUpdate(user.message._id,{$set: customer_credential},{new:true , runValidators:true, context:'query'})
               
               if(customer)    return await Respond.respond(req , res , {success: true, message:`Credential have been changed`});
                    else   return await Respond.respond(req, res , {success:false , message:'Credential have not been found'});
               
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
 async Activate_Wallet(req,res){
    try{
        var customer = await Wallet_controller.search_For_Wallet_IV({customer: req.query._id})  //.catch(err=>{throw err});
         if(customer.success){
            if( await Auth.authenticate_Access({customer: customer.message.customer_type , editor: true },req.user.employee)){
        let wallet = {
            status: 'Activated'
        }
       var result = await Wallet.findByIdAndUpdate(customer.message._id,{$set: wallet},{new: true, runValidators: true, context:'query'})
    
         if(result.length !== 0)
           return await Respond.respond(req , res , {success:true, message: `Customer - ${customer.message.customer.customer_Id}  Credential Activated`});
         else 
           return await Respond.respond(req , res , {success: false, message: 'Customer Credential not found'});     
    
                            }
              else
                  return await Respond.respond(req, res , {success: false , message: "attempt to activate Customer credentials with out access"});
            
        }
         else 
                return await Respond.respond(req, res , {success: false, message: 'Customer is not found'});
             
         }  catch(err){ throw err }
               },
 async Suspend_Wallet(req,res){
     try{
        var customer = await Wallet_controller.search_For_Wallet_IV({customer: req.query._id})//.catch(err=>{throw err});
        if(customer.success){
       let wallet = {
           status: 'Suspended'
       }
      var result = await Wallet.findByIdAndUpdate(customer.message._id,{$set: wallet},{new: true, runValidators: true, context:'query'})
   
       if(result.length !== 0)
           return await Respond.respond(req , res , {success:true, message: `Customer Id - ${customer.message.customer.customer_Id}  Credential Suspended`});
         else 
          return await Respond.respond(req , res , {success: false, message: 'Customer Credential not found'});     
   
                           }
        else 
               return await Respond.respond(req, res , {success: false, message: 'Customer is not found'});
             
        }  catch(err){ throw err }
  },
  async Deactivate_Wallet(req,res){
     try{
        var customer =await  Wallet_controller.search_For_Wallet_IV({customer: req.query._id})//.catch(err=>{throw err});
        if(customer.success){
           if( await Auth.authenticate_Access({customer: customer.message.customer_type , editor: true },   req.user.employee)){
       let wallet = {
           status: 'Deactivated'
       }
      var result = await Wallet.findByIdAndUpdate(customer.message._id,{$set: wallet},{new: true, runValidators: true, context:'query'})
    
       if(result.length !== 0)
       return await Respond.respond(req , res , {success: true, message: `Customer Id - ${customer.message.customer.customer_Id}  Credential Deactivated`});
       else 
       return await Respond.respond(req , res , {success: false, message: 'Customer Credential is not found'});     
   
                           }
             else  
                return  Respond.respond(req, res , {success: false , message: "attempt to deactivate Customer credentials with out access"});
        
              }
        else 
               return await Respond.respond(req, res , {success: false, message: 'Customer is not found'});
           
        }  catch(err){ throw err }
  },

  async create_Wallet_Credential_Object(req){
    try{
    var  wallet_Credential= {
        username: req.body.username,
        password: req.body.password,
        customer_type: req.body.type || 'normal',
        status: req.body.status,
        user_access_type: req.body.user_access_type,
        old_Password: req.body.old_Password,
        balance: req.body.balance
    };
   
     if(wallet_Credential.user_access_type)
          wallet_Credential.user_access_type = wallet_Credential.user_access_type.split(',')
       Object.keys(wallet_Credential).forEach(key=>wallet_Credential[key] === undefined ? delete wallet_Credential[key]: {})      
       return wallet_Credential
      }
      catch(err){throw err}         
},
}