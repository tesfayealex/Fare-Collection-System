
const Wallet_Transaction = require('../Models/Wallet_Transaction');
const Wallet = require('../Models/Wallet')
const Respond = require('../../helpers/Response');
const Auth = require('../../helpers/authenticator');

module.exports = {
    async register_Wallet_Transaction( transaction_Object){
        try{
             var Transaction_Object = await this.create_Wallet_Transaction_Object(transaction_Object);
             var Transaction = new Wallet_Transaction(Transaction_Object);
             var result =  await Wallet_Transaction.create(Transaction)
                if(result) 
                return {success: true , message: result.transaction_Id};
                else 
                return {success: false , message: `Transaction is not registered`};    
        }catch(err){ throw err  }
    },
    async search_For_Wallet_Transaction_EV (req, data , limit = 1){
        try{
          var wallet = await this.search_For_Wallet_IV(data, limit , populate , ' -updatedAt -password -__v') 
          if(wallet.success){   
            if(await Auth.authenticate_Access({customer: wallet.message.customer_type ,viewer: true},req.user.employee)){
                var result = await this.search_For_Wallet_Transaction_IV(data , limit)
                  return result
                 }
                else{
                        return {success: false, message: "attempt to find a wallet transaction with out access"}; 
                   }
                  }
                  else
                        return {success: false, message: "customer not found"}; 
        }
        catch(err){    throw err   }
      },
      async find_Wallet_Transaction(req , res , limit = 1){
        try {
             var route =  await this.search_For_Wallet_Transaction_EV(req, req.query , limit)
                return await Respond.respond(req,res, route)
            } 
    catch (error) {  throw err}
      },
      async search_For_Wallet_Transaction_IV(data , limit = 1){
        try{
            var query_Object = {};  
            if(data.transaction_Id)
                 query_Object.transaction_Id = data.transaction_Id;
            if(data.wallet)
                 query_Object.wallet =  data.wallet;
            if(data._id)
                 query_Object._id = data._id                        
            var populate =  {path: 'wallet' , select: 'customer username user_access_type customer_type'}  
           var result = await Wallet_Transaction.find(query_Object)      
              .populate(populate)
              .limit(limit)
        
            if(result.length == 1) {
              result = result.reduce((wal)=> {return wal})
              return {success:true, message: result};
            }
    
     else if(result.length > 1 )   
              return {success:true, message: result};
     else
              return {success: false , message: 'Wallet transaction is not found'};
                                      
        }catch(err){throw err}
      },
    //   async Wallet_Transaction_aggregate(data){
    //     try{
    //        var group_Id = {} , sort_Id = {} , lookup = {} , group = {} , sort = {} ,match = {}
            
    //        switch (data.group) {
    //            case 'day':
    //                  group_Id =   { "day": {"$dayOfMonth": "$createdAt"} ,"month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}               
    //                  sort_Id = {  "_id.year" : -1, "_id.month" : -1,  "_id.day": -1  } 
    //                  break;
    //            case 'month':
    //                  group_Id =   { "month": { "$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} 
    //                  sort_Id = {  "_id.year" : -1, "_id.month" : -1 }              
    //                 break;
    //            case 'year':
    //                   group_Id =   {  "year" : {"$year": "$createdAt"}} 
    //                   sort_Id = {  "_id.year" : -1 }                
    //                     break;       
    //            default:
    //                break;
    //        }       
    //        if(Object.keys(group_Id).length !== 0)
    //              group = {  "$group" : {   "_id": group_Id ,   "count": {"$sum" : 1}   }   }; 
    //        if(Object.keys(sort_Id).length !== 0)    
    //              sort =  {  "$sort" : sort_Id }    
    //        if(data.lookup && data.lookup == "wallet") 
    //              lookup ={"$lookup" : { "from" : "Wallet" , "localField" : "wallet" , "foreignField" : "_id" , "as": "wallet_info"}}
    //        if(data.match)
    //        var match = {"$match" : data.match }
    //      var  query =  [     
    //         lookup,
    //         match,
    //         group,         
    //         sort       
    //                  ]
    //       var filtered_query =  query.filter(element => {
    //         return Object.keys(element).length > 0 
    //     })       
                       
    //       //  console.log(filtered_query)       
    //       var result =  await Wallet_Transaction.aggregate(filtered_query)    
    
    //       if(data.total) 
    //             {
    //                 var total = 0;
    //                 for(i=0 ; i<result.length ; i++)
    //                      total += result[i].count
    //                 result.push({"_id": "total" , "count": total})     
    //             }
    //         return {success:true, message: result};
    //       }catch(err){throw err}
    // },
   
    async delete_Wallet_Transaction_IV (data){
        try{  
            var wallet_Transaction = await this.search_For_Wallet_Transaction_IV(data)   
            if(wallet_Transaction.success) {          
            var result = await Wallet_Transaction.findByIdAndDelete(wallet_Transaction.message._id)
         
              if(result)  
           
                  return {success: true, message: `wallet Transaction Id - ${wallet_Transaction.message.transaction_Id} have been deleted`};
                else 
                  return {success: false, message: `Wallet Transation is not found on database`};
          
                                 }
        else
               return {success: false , message: 'wallet Transaction is not found'};
        }catch(err){  throw err }
    },
    async view_Wallet_Transaction(req,res ,limit = 5){
      try{
          var data;
          if(req.user && req.user.customer)   data = req.user.customer
          else if(req.user && req.user.employee && req.query && req.query._id)   data = req.query._id
        
          if(data){
           
          var customer = await Wallet.find({customer: data}).limit(limit);  
        
                 customer = customer.reduce(cus=>{return cus});
               if(customer.length !== 0){
              if(  req.user.customer || req.user.employee && await Auth.authenticate_Access({customer: customer.customer_type , viewer: true },req.user.employee)){
                   var customer_Transaction =  await Wallet_Transaction.find({wallet: customer._id}).limit(limit)
                      if(customer_Transaction.length !== 0 )
                           return await Respond.respond( req , res ,{success:true, message: customer_Transaction});
                      else 
                           return await Respond.respond( req , res ,{success:true, message: 'No Transcation Found'}); 
                  }
                 else 
                      return await Respond.respond( req , res ,{success:false, message: 'Attempt to view Wallet transaction with out authorization'}); 
                    
                    }
             else 
                  throw new Error('The customers Wallet could not be found');
               
                  }
             else   
              return await Respond.respond(req,res, {success: false , message: 'customer input data error has occured'})           
                          
       
         }catch(err){throw err} 
        },
    async create_Wallet_Transaction_Object(Transaction_Info){
        try{
          
           var wallet_Transaction = {
            transaction_Id: Transaction_Info.transaction_Id,
            wallet: Transaction_Info.wallet,
            transaction_Type: Transaction_Info.transaction_Type,
            transaction_Amount: Transaction_Info.transaction_Amount,
            reason: Transaction_Info.reason,
            transaction_Made_By: Transaction_Info.transaction_Made_By  
                   }
           Object.keys(wallet_Transaction).forEach(key=>wallet_Transaction[key] === undefined ? delete wallet_Transaction[key]: {})        
           return wallet_Transaction
          }
          catch(err){throw err}         
         },
    }   