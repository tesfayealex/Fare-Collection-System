const Wallet = require('../models/wallet');
const crypto = require('crypto');
const Respond = require('../../helpers/response');
const Auth = require('../../helpers/authenticator');
const Wallet_Transaction_Controller = require('./wallet_transaction_controller');

module.exports = {
    async view_Balance(req,res){
        try{  
         if(req.user.username)
            {    
        const customer = await Wallet.findOne({username: req.user.username}) 
        if(customer)
             return await Respond.respond(req, res , {success:true, message:customer.balance}); 
         else
             return await Respond.respond( req , res ,{success:true, message: 'Customer is not found'}); 
            }
         else
              return await Respond.respond( req , res ,{success: true , message: 'User is not found'});
         }
         catch(err)  {throw err}
      },
    async check_Balance(req , amount){
     try{
         var query_Object = {};     
        if(req.user.customer)
                    query_Object._id = req.user.customer;
        else if(req.body && req.body.customer_Id)
                     query_Object.customer_Id = req.body.customer_Id;     
       if(Object.keys(query_Object).length == 1) {                
                  var wallet = await  Wallet.findOne({customer: query_Object})
                    if(wallet){
                        if(wallet.status == 'Activated')
                        {
                        if(wallet.balance >= amount)
                                return {success:true, message: wallet.balance};
                        else if (wallet.customer_type == 'Free')  
                                return {success:true, message:  wallet.customer_type};      
                        else 
                                return {success:false, message:'insufficient balance'};   
                        }
                        else 
                                return {success: false , message: `Account is ${wallet.status}` }                
                               }
                       else  
                       return {success:false, message: 'Customer Wallet is not found'};
                              }
       }catch(err){throw err}
    },
    async deduct_Balance(transaction){
        try{
            wallet = await this.search_For_Wallet_IV({customer: transaction.customer})  
            if(wallet.success){
                          var balance = parseFloat(wallet.message.balance);
                          var payment = parseFloat(transaction.transaction_Amount)
                          balance = balance - payment ;
                            uniqueid = crypto.randomBytes(7).toString('hex');
                            var wallet_Object = {  balance }
                            
                            var Wallet_Transaction  = {
                                 transaction_Id: uniqueid,
                                 wallet: wallet.message._id,
                                 transaction_Amount: transaction.transaction_Amount,
                                 transaction_Type: 'Deduct',
                                 reason: transaction.reason  
                            }
                        
                            var transaction = await Wallet_Transaction_Controller.register_Wallet_Transaction(Wallet_Transaction);      //.create(Wallet_Transaction)  //.then(result=>{
                             
                              if(transaction.success){
                                
                                   if(balance < 0)
                                      wallet_Object.status = 'Suspended' 
                                   var result = await Wallet.findByIdAndUpdate(wallet.message._id, {$set: wallet_Object} ,{new: true , runValidators:true, context:'query'})
                                  
                                        if(result)
                                             return {success:true, message: 'Balance successfully deducted'};
                                        else
                                             return {success: false, message:'Wallet Transaction is not made'}     
                                  
                                         }
                                   else         
                                    return {success: false, message:'Transaction is not made'}
                         
                                    }
            else{
                return {success:false, message: 'Customer is not found'};
            }     
           }catch(err){
            if(transaction && !result)
                 {
                     
                      Wallet_Transaction_Controller.delete_Wallet_Transaction_IV({transaction_Id: transaction.message}) 
                  }
            throw err} 
    },
     async find_Wallet(req , res , limit = 1){
        try {
           if(req.user.customer) 
             {
                var wallet = await this.search_For_Wallet_IV({customer: req.user.customer})
                    return await Respond.respond(req , res , wallet) 
             }
           else {  
            var wallet = await this.search_For_Wallet_EV(req , req.query , limit) 
                    return await Respond.respond(req , res , wallet)       
                }
            }
        catch (err) {  throw err}        
      },  
    async search_For_Wallet_EV(req , data , limit = 1 , populate = ''){
        try{
            var wallet = await this.search_For_Wallet_IV(data, limit , populate , ' -updatedAt -password -__v') 
           if(wallet.success){
            wallet = JSON.stringify(wallet);
            wallet = JSON.parse(wallet);
            if(!Array.isArray(wallet.message)) {
                wallet.message = [wallet.message]
            }
                wallet.message = await wallet.message.filter(async element=> 
                {    
                        if( await Auth.authenticate_Access({customer: wallet.message.customer_type , viewer: "true" },req.user.employee))
                        
                                 return element           
                })
                
                if(limit == 1 && wallet.message.length == 1 )
                {
                    wallet.message = await wallet.message.reduce((cus)=> {return cus})  
                    return {success:true,  message: wallet.message};
                }
           else if( wallet.message.length > 0) 
                    return wallet;    
           else 
                  return {success: false, message: 'Wallet viewing is out of access'}
                      }
            else return {success: false, message: 'Wallet could not be found'}; 
        }catch(err){
            throw err
        }
    }, 
    async search_For_Wallet_IV(data , limit = 1 , populate = '' , select = '-updatedAt -password -__v'){
        try{
            var query_Object = {};  
            if(data.customer)
                 query_Object.customer = data.customer;
            if(data.username)
             query_Object.username = data.username; 
            if(data.customer_type)
              query_Object.customer_type = data.customer_type; 
            if(data.user_access_type) 
              query_Object.user_access_type = data.user_access_type; 
            if(data._id)
                 query_Object._id = data._id 
            if(populate == '')
                 populate = {path: 'customer' , select: '-updatedAt -__v'}            
         var result = await Wallet.find(query_Object)    
              .populate(populate)
              .limit(limit)
              .select(select)
              
                if(result.length == 1) {
                    result = result.reduce((wallet)=> {return wallet})
                    return {success:true, message: result};
                  }
              else if(result.length > 1 )   
                    return {success:true, message: result};
              else
                    return {success: false , message: 'Wallet is not found'};                     
        }catch(err){throw err}      
    }, 
    async refill_Balance(req,res){
        try{
            var customer = await this.search_For_Wallet_IV({_id: req.query._id})    
            if(customer.success){
               if( await Auth.authenticate_Access({customer: customer.message.customer_type , editor: true },req.user.employee)){
                if(req.body.transaction_Amount){
                
                    var old_Balance = parseFloat(customer.message.balance);
                    var refill_amount = parseFloat(req.body.transaction_Amount);
                    var status;
                if(typeof req.body.transaction_Amount === "number") {
                      var new_Balance =  old_Balance + refill_amount ;
                      if(customer.message.status == 'Suspended'){
                          if(old_Balance < 0 &&  new_Balance > 0)  
                            status = 'Activated' 
                                             }
                            uniqueid = crypto.randomBytes(7).toString('hex');
                            var Wallet_Transaction  =  {
                                 transaction_Id: uniqueid,
                                 wallet: customer.message._id,
                                 transaction_Amount: req.body.transaction_Amount,
                                 transaction_Type: 'Refill',
                                 transaction_Made_By: req.user.username,
                                 reason: 'refilling balance at Core'
                               }
                            var result = await Wallet_Transaction_Controller.register_Wallet_Transaction(Wallet_Transaction)             //.create(Wallet_Transaction)
                          
                              var wallet_Object = await this.create_Wallet_Object({balance: new_Balance.toString(), status })
                             
                                 if(result.success) {
                                    var success = await Wallet.findByIdAndUpdate(customer.message._id,{$set:wallet_Object },{new: true , runValidators:true, context:'query'})
                                   
                                        if(success)
                                            return await Respond.respond(req,res,{success: true , message: `Customer Id - ${customer.message.customer.customer_Id} balance has been successfully refilled`})
                                        else 
                                            return await Respond.respond(req,res,{success: false , message: 'Refill account is unsuccessful'})   
                                  
                                          }
                                else {
                                    return await Respond.respond(req,res,{success: false , message: 'wallet transaction for Refill account was unsuccessful'})  
                                           }
                           
                                        }
                             else 
                                 return await Respond.respond(req , res,{success: false , message: "refill balance amount is not a number"});     
                               }           
                    else                      
                             return await Respond.respond(req , res,{success: false , message: "refill balance amount could not be found"});
                        }          
        else   
                 return await Respond.respond(req , res,{success: false , message: "attempt to refill a customer credential data with out access"}); 
            } 
        else 
                    return await Respond.respond(req, res,{success: false , message: "The Customer does not exist"});
       }catch(err){throw err} 
    },
    async create_Wallet_Object(object){
        try{
        var  wallet_Credential= { 
            status: object.status,
            balance: object.balance 
        };
       
           Object.keys(wallet_Credential).forEach(key=>wallet_Credential[key] === undefined ? delete wallet_Credential[key]: {})      
           return wallet_Credential
          }
          catch(err){throw err}         
    },
   
}