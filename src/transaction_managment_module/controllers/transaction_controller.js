
const Transaction = require('../models/transaction');
const Wallet = require('../../wallet_module/controllers/wallet_controller');
const Station = require('../../organization_module/controllers/station_controller');
const Bus = require('../../organization_module/controllers/bus_controller');
const Fare = require('./fare_controller');
const Respond = require('../../helpers/response');
const Auth = require('../../helpers/authenticator');
const Ticket_Controller = require('./ticket_controller');
const crypto = require('crypto');
const Route = require('../../organization_module/controllers/route_controller');
const Customer = require('../../user_managment_module/controllers/customer_controller');
const report = require('../../report_module/controllers/aggrigation');
module.exports = {
    async register_travel_transaction(req,res){
       try{
             var  Transaction_Object = await this.create_Transaction_Object(req);  
             Transaction_Object.transaction_Id =  await crypto.randomBytes(16).toString('hex');     
             var station =  await Station.search_For_Station_IV( { station_Name:Transaction_Object.entry_Station })
             var station2 = await Station.search_For_Station_IV({station_Name: Transaction_Object.exit_Station})
             var route = await Route.search_For_Route_IV({route_Name: Transaction_Object.route}); 
       if(route.success && route.message.status == 'Activated')  {

       if(station.success && station.message.status == 'Activated' && station2.success && station2.message.status == 'Activated') 
                             {
                    
                               Transaction_Object.entry_Station = station.message._id;
                               Transaction_Object.exit_Station = station2.message._id;
                               Transaction_Object.route = route.message._id;
                               // console.log(req.user._id)
                                var bus = await Bus.search_For_Bus_IV({transaction_Machine: req.user._id})
                                 // console.log(bus)
                                    if(bus.success == true && bus.message.status == 'Activated'){
                                       Transaction_Object.bus = bus.message._id;
                                       Transaction_Object.machine = req.user._id;
                                        if(Transaction_Object.ticket_Type == 'Ticket') {
                                             
                                                var auth_ticket  = await Ticket_Controller.authenticate_Ticket(req) 
                                                if(auth_ticket.success)
                                                  { 
                                                    Transaction_Object.ticket = auth_ticket.message.ticket._id;
                                                    if(auth_ticket.message.ticket.ticket_Length > Transaction_Object.transport_length)
                                                       {
                                                            return await Respond.respond(req, res , {success: false , message: 'ticket length and transport length does not match'});     
                                                       }
                                                    Transaction_Object.transaction_Amount = auth_ticket.message.ticket.ticket_Amount;
                                                    Transaction_Object.customer = auth_ticket.message.ticket.customer._id;
                                                //    console.log(Transaction_Object)
                                                //    throw new Error('woooow')
                                                  }
                                                  else  
                                                     return await Respond.respond(req, res , {success: false , message: auth_ticket.message});  
                                                                      }
                                        else if(Transaction_Object.ticket_Type == 'customer_Id'){
                                              
                                            var fare= await Fare.search_For_Fare_IV({status:'Active'});  
                                            
                                            Transaction_Object.transaction_Amount = Transaction_Object.transport_length * fare.message.fare_Amount
                                            
                                            var result =  await Wallet.check_Balance(req ,  Transaction_Object.transaction_Amount)  //.then(result=>{
                                                
                                              if(result.success) {
                                                if(Transaction_Object.customer){
                                                    
                                                     var wallet = {
                                                      customer: Transaction_Object.customer,
                                                      reason: "Bus Tranaction Txn: " + Transaction_Object.transaction_Id,
                                                      amount: Transaction_Object.transport_length * fare.message.fare_Amount
                                                                }
                                                 var wallet =   await Wallet.deduct_Balance(wallet);
                                                  if(!wallet.success)
                                                          return await Respond.respond(req,res, wallet)
                                                               }
                                                 else 
                                                     return await Respond.respond(req, res , {success: false , message: 'Customer Id has not been found'});                 
                                                               }
                                                   else
                                                        return await Respond.respond(req, res , {success: false , message: result.message});        
                                           }
                                          else 
                                               return await Respond.respond(req,res, {success:false , message: 'ticket type has not been defined'})
                         var transaction = new Transaction(Transaction_Object);           
                         var result =   await Transaction.create(transaction)
                                   
                                           if(result) {
                                                if(Transaction_Object.ticket_Type == 'Ticket')  //{
                                                        await Ticket_Controller.change_Ticket_Status({_id : Transaction_Object.ticket} , 'Used' );
                                             
                                               return await Respond.respond(req, res,{success: true , message: `Transaction Id - ${transaction.transaction_Id} - registered`});
                                                     }
                                           else 
                                               return await Respond.respond(req, res,{success: false , message: `Transaction is not registered`}); 
                                 
                                    }
                                    else
                                       return await Respond.respond(req ,res , {success: false , message: `Bus Information is incorrect`})
                             
                             } 
                         else 
                              return await Respond.respond(req,res, {success: false , messsage: 'Station Information is incorrect'}) 
                         } 
                         else 
                              return await Respond.respond(req,res, {success: false , messsage: 'Route Information is incorrect'})           
           
          } catch(err){
           throw err
                      }
    },
    async Transaction_aggregate(data){
     try{
        var group_Id = {} , sort_Id = {} , lookup = {} , group = {} , sort = {} ,match = {}
         
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
        if(data.lookup && data.lookup == "customer") 
              lookup ={"$lookup" : { "from" : "Customer" , "localField" : "customer" , "foreignField" : "_id" , "as": "customer_Info"}}
        if(data.match)
        var match = {"$match" : data.match }
      var  query =  [     
         lookup,
         match,
         group,         
         sort       
                  ]
       var filtered_query =  query.filter(element => {
         return Object.keys(element).length > 0 
     })       
                    
       //  console.log(filtered_query)       
       var result =  await Transaction.aggregate(filtered_query)    
 
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
    async view_Transaction(req,res, limit = 5 , select = 'transaction_Id transaction_Amount entry_Station exit_Station'){
       try{
            if(req.user.customer){
               var result = await this.search_For_Transaction_IV({customer: req.user.customer},limit)
                    //  console.log(result) 
                    if(result.success)
                         return await Respond.respond(req, res , result)
                    else
                         return await Respond.respond(req, res , {success: false , message: 'No transaction could be found'})
                                   
            }
            else if(req.user.employee){
              var customer = await Wallet.search_For_Wallet_EV(req , req.query);
              if(customer.success){
              ///   console.log(customer)  
                if(await Auth.authenticate_Access({customer: customer.message.customer_type, viewer: true},req.user.employee)){
                       
                      var result = await this.search_For_Transaction_IV({customer: customer.message.customer._id}, limit)  
                   console.log('nnnnn')
                   console.log(result)
                      console.log(result.message.length)
                        if(result.success)
                           return await Respond.respond(req, res , result)
                        else
                          return await Respond.respond(req, res , {success: false , message: 'No Customer or No transaction could be found'})
                                      
                        }
                        else   
                             return await Respond.respond(req,res,{success: false , message: "attempt to view customer transaction with out access"});          
                        }
                      else
                         return await Respond.respond(req, res , {success: false , message: 'customer was not found'})         
                                        
                                    }
             else {
                   return await Respond.respond({success: false , message: 'System could not verify the type of user'})
             }                       
          }
          catch(err){throw err}
    },
    async find_Transaction(req , res , data , limit = 1 , populate = ''){
      try {
  
          ticket = await this.search_for_Ticket_EV(req, data , limit , populate)
         
               return await Respond.respond(req,res , ticket)      
            
        }
    catch (err) {  throw err}
    },
    async search_for_Transaction_EV (req, data , limit = 1 , populate = ''){
      try{
          if(await Auth.authenticate_Access({transaction: {viewer: true}},req.user.employee)){
              var result = await this.search_for_Ticket_IV(data , limit, populate)
                return result
                  }
              else 
                      return {success: false, message: "attempt to find a transaction with out access"}; 
              
      }
      catch(err){    throw err   }
    },
    async search_For_Transaction_IV(data , limit = 1 , populate = '',sort=''){
        try{
             console.log(limit)
            var query_Object = {};  
            if(data.transaction_Id)
                 query_Object.transaction_Id = data.transaction_Id;
            if(data.ticket)
                 query_Object.ticket = data.ticket;   
            if(data.customer)
                 query_Object.customer = data.customer;
            if(data.machine)
                 query_Object.machine = data.machine;               
            if(data._id)
                 query_Object._id = data._id                        
            if(populate == '')
               populate = [ {path: 'ticket' , select: '_id ticket'} , {path: 'customer' , select: '_id name customer_Id'},{path: 'bus' , select: '_id bus_Id '},{path: 'machine' , select: '_id machine_Id ip_Address'} , {path: 'entry_Station' , select: '_id station_Id station_Name geometry'},{path: 'route' , select: '_id route_Id route_Name'},{path: 'exit_Station' , select: '_id station_Id station_Name geometry'}]  
            if(sort == '')
               sort = {createdAt: -1}           
         var result = await Transaction.find(query_Object)   //.catch(err=>{throw err})
              .populate(populate)
              .sort(sort)
              .limit(limit)
            //  console.log(result)
              if(result.length == 1) {
                result = result.reduce((transaction)=> {return transaction})
                return {success:true, message: result};
              }
      
        else if(result.length > 1 )   
                return {success:true, message: result};
        else
                return {success: false , message: 'Transaction is not found'};
                             
        }catch(err){throw err}
    },
    async aggregate_worker(req,res){
           try{
       //     if(await Auth.authenticate_Access({analysis: { creator: true}},req.user.employee)){       
            var data = await report.begin_aggregation(req);
                
                   var created_aggregation = await report.aggregate_creator(data);
                
                   var aggregate = await   Transaction.aggregate(created_aggregation)
                   var result = await report.result_generator(aggregate,req.body.output)
               
                   Respond.respond(req,res,result) 
               // }
               // else 
               //         return Respond.respond ( req,res ,{success: false, message: "attempt to generate repport with out access"}); 
           }catch(err) {throw err}
    },
//     async transaction_aggregate(req,res ,data = {total: true}){
//       try{
//         // console.log('hggff')
//        var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
//        var  last_Date=new Date('2020-12-21T00:00:00.000+00:00');
//       //   console.log(req.query)  
//         var result =  await Transaction.aggregate(
//           [ //[  
//             {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }},
//             {"$group" : {   "_id": { "month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} ,   "count": {"$sum" : 1}   }   },  
//             {"$sort": {"_id.year":1, "_id.month":1}},
//             {"$project": { 
//                         '_id': {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 2 ]}]}, //,"$_id.day","-" , "$_id.month","-", "$_id.year"]},
//                         'count':1
//              }} 
//              //] 
//           ]
//           )
//         var date = [];
//        var count = []; 
//        var backgroundColor= []
//        var borderColor = []; 
         
//          if(req.query.type == 'date'){
//               // console.log('omg')
//              var Difference_In_Time = last_Date.getTime() - first_Date.getTime(); 
  
//              var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
//              for(i=0 ; i<Difference_In_Days;i++)
//              {
//                  first_Date.setDate(first_Date.getDate() + 1)
//                  month =  first_Date.getMonth()+1
//                  date.push(first_Date.getDate() + '/' + month);
//                  counter = result.find(element=> element['_id'] == date[i])
//                  var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";
//                  backgroundColor.push(color + "0.2)");
//                  borderColor.push(color + "1)");
                
//                    if(counter)
//                         count.push(counter.count)
//                    else
//                          count.push(0)
//              }
//                                      }
//           else 
//              if(req.query.type == 'month'){
//                 //var Difference_In_Time = last_Date.getTime() - first_Date.getTime(); 
                              
//                         //     var Difference_In_Days = parseInt( Difference_In_Time / (1000 * 3600 * 24 *7 * 4)); 
//                    first_Date_Month = first_Date.getMonth();
//                    last_Date_Month = last_Date.getMonth();
//                    first_Date_Year = first_Date.getFullYear();
//                    last_Date_Year = last_Date.getFullYear();
//                     diff = (last_Date_Month + (12 * (last_Date_Year - first_Date_Year)) + 1)  - first_Date_Month
//                     //  console.log(first_Date)
//                     //  console.log(last_Date)
//                      //  console.log(diff)
//                              for(i=1 ; i<=  diff;i++)
//                              { 
//                             //   console.log(i)   
//                                  if(i != 1) 
//                                      first_Date.setMonth(first_Date.getMonth() + 1)

//                                   //   console.log(first_Date)      
//                                  year =  first_Date.getYear() - 100
//                                  month = first_Date.getMonth() + 1
//                                  date.push(month + '/' + year);
//                                 counter = result.find(element=> element['_id'] == date[i-1])
//                                 var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
//                                  backgroundColor.push(color + "0.2)");
//                                  borderColor.push(color + "1)");
                                
//                                    if(counter)
//                                       count.push(counter.count)
//                                    else
//                                       count.push(0)
//                              }
               
//               }   
                 
//                var total = 0;
//       if(data.total) 
//             {      
//                 for(i=0 ; i<result.length ; i++)
//                      total += result[i].count
//                 result.push({"_id": "total" , "count": total})     
//             }
//             // var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";

//             // // We push this new color to both background and border color arrays
//             // // .. a lighter color is used for the background
//             // backgroundColor.push(color + "0.2)");
//             // borderColor.push(color + "1)");
//            // console.log(date)
//        //     console.log(count)
//         return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor,borderColor,total}});
//       }catch(err){

//         console.log(err);  
//       //  console.log('kk               ll')
//         throw err}
//   },
//   async transaction_aggregates(req,res ,data = {total: true}){
//     try{
         
//       var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
//       var  last_Date=new Date('2020-12-21T00:00:00.000+00:00');
      
//       var result =  await Transaction.aggregate(
//         [
//           {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }},
//         {"$lookup" : { "from" : "Route" , "localField" : "route" , "foreignField" : "_id" , "as": "Route"}},  
//         {"$unwind" : "$Route" },
//       //  {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
//         { $group: { _id: "$Route.route_Name",  count: { $sum: 1 }  } }   
//         ]
//         )
//       //  filtered_query)    
//       var date  = []
//       var count = []
//       var backgroundColor =[];
//       var borderColor = [];
//               result.forEach(element=>{
//                     date.push(element._id)
//                     count.push(element.count)
//                     var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
//                                  backgroundColor.push(color + "0.2)");
//                                  borderColor.push(color + "1)");
//               }) 
//       var total = 0
//       if(data.total) 
//             {      
//                 for(i=0 ; i<result.length ; i++)
//                      total += result[i].count
//                 result.push({"_id": "total" , "count": total})     
//             }
//          //   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";

//         return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
//       }catch(err){

//         console.log(err);  
//        // console.log('kk               ll')
//         throw err}
// },
// async transaction_aggregatess(req,res ,data = {total: true}){
//   try{

//     var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
//     var  last_Date=new Date('2020-12-21T00:00:00.000+00:00');
         
//     var result =  await Transaction.aggregate(
//       [
//         {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }},  
//       {"$lookup" : { "from" : "Bus" , "localField" : "bus" , "foreignField" : "_id" , "as": "bus"}},  
//       {"$unwind" : "$bus" },
//       {"$lookup" : { "from" : "Organization" , "localField" : "bus.organization" , "foreignField" : "_id" , "as": "organization"}},  
//       {"$unwind" : "$organization" },
//     //  {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
//       { $group: { _id: "$organization.organization_Name",  count: { $sum: 1 }  } }   
//       ]
//       )
//     //  filtered_query)    
//     var date  = [];
//     var backgroundColor =[];
//     var borderColor = [];
//     var count = [];
//             result.forEach(element=>{
//                   date.push(element._id)
//                   count.push(element.count)
//                   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
//                   backgroundColor.push(color + "0.2)");
//                   borderColor.push(color + "1)");
//             }) 
//     var total = 0
//     if(data.total) 
//           {      
//               for(i=0 ; i<result.length ; i++)
//                    total += result[i].count
//               result.push({"_id": "total" , "count": total})     
//           }
//        //   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";

//        return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
//     }catch(err){

//       console.log(err);  
//      // console.log('kk               ll')
//       throw err}
// },
// async transaction_aggregatesss(req,res ,data = {total: true}){
//   try{
//     var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
//     var  last_Date=new Date('2020-12-21T00:00:00.000+00:00');
         
//     var result =  await Transaction.aggregate(
//       [
//         {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }},  
//         {"$lookup" : { "from" : "Ticket" , "localField" : "ticket" , "foreignField" : "_id" , "as": "Ticket"}},
//         {"$unwind": "$Ticket"},
//         {
//           $addFields: {    
//             "Ticket_type": {
//                $concat: [
//               //    { $cond: [{$ne : ['$ticket', undefined]}, "", "Card"]}, 
//                   { $cond: [{$and :[{$ne : ['$ticket', undefined]}]} ,
//                              { $cond: [{$eq : ['$Ticket.ticket_type', 'Temporary'] }, "Temporary" , "Mobile"]},
//                              "card" ]}

                  
                  
//                //     ,   ]}, "Temporary Ticket", ""]}, 
//                 //  {  $cond: [{$and :[{$gt:["$ticket", null]} , {$eq: ['$Ticket.ticket_type:', 'Mobile'] }]}, "Mobile Ticket", ""]}, 
                 
//                ]
//             }
  
//           }
//         },
//         { $group: { _id: "$Ticket_type",  count: { $sum: 1 }  } }   
//       // {"$lookup" : { "from" : "Bus" , "localField" : "bus" , "foreignField" : "_id" , "as": "bus"}},  
//       // {"$unwind" : "$bus" },
//       // {"$lookup" : { "from" : "Organization" , "localField" : "bus.organization" , "foreignField" : "_id" , "as": "organization"}},  
//       // {"$unwind" : "$organization" },
//     //  {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
//    //   { $group: { _id: "$organization.organization_Name",  count: { $sum: 1 }  } }   
//       //  }
//       ]
//       )
//     //  filtered_query)  
//     //console.log(result)  
//     var date = []
//     var count = []
//     var backgroundColor =[];
//     var borderColor = [];
//             result.forEach(element=>{
//                   date.push(element._id)
//                   count.push(element.count)
//                   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
//                   backgroundColor.push(color + "0.2)");
//                   borderColor.push(color + "1)");
//             }) 
//     var total = count.reduce((a,b)=> a+b);
//     return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
//     }catch(err){

//       console.log(err);  
//      // console.log('kk               ll')
//       throw err}
// },
// async transaction_aggrigatessss(req,res ,data = {total: true}){
//   try{
//     var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
//     var  last_Date=new Date('2020-12-21T00:00:00.000+00:00');
         
//     var result =  await Transaction.aggregate(
//       [
//         {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }}, 
         
//       //     {"$lookup" : { "from" : "Organization" , "localField" : "organization" , "foreignField" : "_id" , "as": "Organization"}},
//       //     {"$unwind": "$Organization"},      
//            { $group: { "_id": { "month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}, count: { $sum: '$transaction_Amount' }  } } ,
//            {"$project": { 
//             '_id': {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 2 ]}]}, //,"$_id.day","-" , "$_id.month","-", "$_id.year"]},
//             'count':1
//  }}   
//       ]
//       )
//   //  console.log(result)  
//   var date = [];
//   var count = []; 
//   var backgroundColor= []
//   var borderColor = []; 
//       //  console.log(result)
//     if(req.query.type == 'date'){
//          // console.log('omg')
//         var Difference_In_Time = last_Date.getTime() - first_Date.getTime(); 

//         var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
//         for(i=0 ; i<Difference_In_Days;i++)
//         {
//             first_Date.setDate(first_Date.getDate() + 1)
//             month =  first_Date.getMonth()+1
//             date.push(first_Date.getDate() + '/' + month);
//             counter = result.find(element=> element['_id'] == date[i])
//             var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";
//             backgroundColor.push(color + "0.2)");
//             borderColor.push(color + "1)");
           
//               if(counter)
//                    count.push(counter.count)
//               else
//                     count.push(0)
//         }
//                                 }
//      else 
//         if(req.query.type == 'month'){
//            //var Difference_In_Time = last_Date.getTime() - first_Date.getTime(); 
                         
//                    //     var Difference_In_Days = parseInt( Difference_In_Time / (1000 * 3600 * 24 *7 * 4)); 
//               first_Date_Month = first_Date.getMonth();
//               last_Date_Month = last_Date.getMonth();
//               first_Date_Year = first_Date.getFullYear();
//               last_Date_Year = last_Date.getFullYear();
//                diff = (last_Date_Month + (12 * (last_Date_Year - first_Date_Year)) + 1)  - first_Date_Month
//                //  console.log(first_Date)
//                //  console.log(last_Date)
//                 //  console.log(diff)
//                         for(i=1 ; i<=  diff;i++)
//                         { 
//                        //   console.log(i)   
//                             if(i != 1) 
//                                 first_Date.setMonth(first_Date.getMonth() + 1)

//                              //   console.log(first_Date)      
//                             year =  first_Date.getYear() - 100
//                             month = first_Date.getMonth() + 1
//                             date.push(month + '/' + year);
//                            counter = result.find(element=> element['_id'] == date[i-1])
//                            var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
//                             backgroundColor.push(color + "0.2)");
//                             borderColor.push(color + "1)");
                           
//                               if(counter)
//                                  count.push(counter.count)
//                               else
//                                  count.push(0)
//                         }
          
//          }   
//          if(count.length != 0)
//     var total = count.reduce((a,b)=> a+b);
//     return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
//     }catch(err){  
//       throw err}
// },

// async transaction_aggrigatesssss(req,res ,data = {total: true}){
//   try{
//     var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
//     var  last_Date=new Date('2020-12-21T00:00:00.000+00:00');
         
//     var result =  await Transaction.aggregate(
//       [
//         {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }}, 
//       //  {"$match":{"createdAt":{"$gte":"2020-01-01T00:00:00.000+00:00","$lte":"2020-12-21T00:00:00.000+00:00"}}} 
//          {"$lookup" : { "from" : "Station" , "localField" : "entry_Station" , "foreignField" : "_id" , "as": "Entry_Station"}},
//        //  {"$lookup":{"from":"Station","localField":"entry_Station","foreignField":"_id","as":"Entry_Station"}}
//          {"$unwind": "$Entry_Station"},  
//         // {"$unwind":"$Entry_Station"}    
//         { $group: { "_id": "$Entry_Station.station_Name", count: { $sum: 1 }  } } ,
//      //   {"$group":{"_id":"$Entry_Station.station_Name","count":{"$sum":1}}}
//         {$sort: { _id: 1}}
//      //   {"$sort":{"_id":1}}
//       ]
//       )
//   //  console.log(result)  
//   var date = [];
//   var count = []; 
//   var backgroundColor= []
//   var borderColor = []; 
//   result.forEach(element=>{
//     date.push(element._id)
//     count.push(element.count)
//     var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
//     backgroundColor.push(color + "0.2)");
//     borderColor.push(color + "1)");
// }) 
//          if(count.length != 0)
//     var total = count.reduce((a,b)=> a+b);
//     return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
//     }catch(err){  
//       throw err}
// },
// async transaction_aggrigatessssss(req,res ,data = {total: true}){
//   try{
//     var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
//     var  last_Date=new Date('2020-12-21T00:00:00.000+00:00');
         
//     var result =  await Transaction.aggregate(
//       [
//         {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }},  
//            {"$lookup" : { "from" : "Station" , "localField" : "exit_Station" , "foreignField" : "_id" , "as": "Exit_Station"}},
//            {"$unwind": "$Exit_Station"}, 
//         // ],     
//         { $group: { "_id": "$Exit_Station.station_Name", count: { $sum: 1 }  } } ,
//         {$sort: { _id: 1}}
//       ]
//       )
//   //  console.log(result)  
//   var date = [];
//   var count = []; 
//   var backgroundColor= []
//   var borderColor = []; 
//   result.forEach(element=>{
//     date.push(element._id)
//     count.push(element.count)
//     var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
//     backgroundColor.push(color + "0.2)");
//     borderColor.push(color + "1)");
// }) 
//          if(count.length != 0)
//     var total = count.reduce((a,b)=> a+b);
//     return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor , borderColor,total}});
//     }catch(err){  
//       throw err}
// },
// async amazing_aggregation(req,res){
//   try{
//     var group_Id = {} , sort_Id = {} , lookup = {} , group = {} , sort = {} ,match = {}
     
//     switch (data.group) {
//         case 'day':
//               group_Id =   { "day": {"$dayOfMonth": "$createdAt"} ,"month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}               
//               sort_Id = {  "_id.year" : -1, "_id.month" : -1,  "_id.day": -1  } 
//               break;
//         case 'month':
//               group_Id =   { "month": { "$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} 
//               sort_Id = {  "_id.year" : -1, "_id.month" : -1 }              
//              break;
//         case 'year':
//                group_Id =   {  "year" : {"$year": "$createdAt"}} 
//                sort_Id = {  "_id.year" : -1 }                
//                  break;       
//         default:
//             break;
//     }       
//     if(Object.keys(group_Id).length !== 0)
//           group = {  "$group" : {   "_id": group_Id ,   "count": {"$sum" : 1}   }   }; 
//     if(Object.keys(sort_Id).length !== 0)    
//           sort =  {  "$sort" : sort_Id }    
//     if(data.lookup && data.lookup == "customer") 
//           lookup ={"$lookup" : { "from" : "Customer" , "localField" : "customer" , "foreignField" : "_id" , "as": "customer_Info"}}
//     if(data.match)
//     var match = {"$match" : data.match }
//   var  query =  [     
//      lookup,
//      match,
//      group,         
//      sort       
//               ]
//    var filtered_query =  query.filter(element => {
//      return Object.keys(element).length > 0 
//  })        
      
  
// }catch(err) {throw err}

// },
// async aggregate_creator(req,res , data){
//       var generated_aggregator = [];
//       for (element in data){ 
//      // data.forEach((element)=>{
//      //   console.log(data[element])
//             if(data[element]['type'] == 'match') 
//                 await  this.match_aggregator(data[element]['data'] , generated_aggregator);
//             if(data[element]['type'] == 'lookup') 
//                  await  this.lookup_aggregation(data[element]['data'] , generated_aggregator);      
//             if(data[element]['type'] == 'group') 
//                  await  this.group_aggregation(data[element]['data'] , generated_aggregator);
//             if(data[element]['type'] == 'project') 
//                  await this.project_aggregator(data[element]['data'] , generated_aggregator); 
//             if(data[element]['type'] == 'addFields') 
//                  await this.add_Field_aggregator(data[element]['data'] , generated_aggregator);  
//               //  console.log(generated_aggregator)           
//       }
     
//       var result = await   Transaction.aggregate(generated_aggregator)
//      // console.log(result)
//      return Respond.respond(req,res,result)   
// },
// async match_aggregator(data, aggregator){
    
//     var match_response ;
//   //  console.log(data.data.type)
//     switch(data.type){
//       case 'date_difference':         
//               match_response =  {"$match": {'createdAt': {'$gte': new Date (data.first_Date) , '$lte': new Date (data.last_Date)} }}
//                break;
//       case 'exact_date':
//              match_response = {"$match": {'createdAt' : new Date (data.date)}}
//              break;
//       case 'gender':
//              match_response = {"$match": {'gender' : data.gender}} 
//              break;
//       case 'age':
//             if(data.lower)
//                    age_Id = {'$lte' : data.age} 
//             else if (data.higher)
//                    age_Id = {'$gte': data.age}
//             else if(data.difference)
//                    age_Id = {'$gte': data.low_age , '$lte': data.high_age}   
//             else if(data.exact)
//                    age_Id = data.age                  
//             match_response = {"$match": {'age' : age_Id}} 
//             break;
//        case 'ticket_type':
//              match_response = {"$match": {'Ticket.ticket_type' : data.ticket_type}} 
//              break;
//        case 'entry_Station':
//              match_response = {"$match": {'Entry_Station.station_Name' : data.entry_Station}} 
//              break;
//        case 'exit_Station':
//              match_response = {"$match": {'Exit_Station.station_Name' : data.exit_Station}}
//              break;
//        case 'route':
//               match_response = {"$match": {'Route.route_Name' : data.route_Name}}
//               break;
//        default:
//               return {success: false , message: 'wrong input'}; 
//               }
//        aggregator.push(match_response)     
//    //    console.log(match_response)  
//        return  {success: true, message: match_response}      
// },
// async lookup_aggregation(data , aggregator){
//   var lookup_response = {};
//   switch(data.type){
//     case 'customer': 
//             lookup_response.lookup =  {"$lookup" : { "from" : "Customer" , "localField" : "customer" , "foreignField" : "_id" , "as": "Customer"}},
//             lookup_response.unwind = {"$unwind": "$Customer"}      
//              break;
//     case 'ticket':
//             lookup_response.lookup =  {"$lookup" : { "from" : "Ticket" , "localField" : "ticket" , "foreignField" : "_id" , "as": "Ticket"}},
//             lookup_response.unwind = {"$unwind": "$Ticket"} 
//            break;
//     case 'entry_Station':
//             lookup_response.lookup =  {"$lookup" : { "from" : "Station" , "localField" : "entry_Station" , "foreignField" : "_id" , "as": "Entry_Station"}},
//             lookup_response.unwind = {"$unwind": "$Entry_Station"} 
//            break;
//     case 'exit_Station':
//             lookup_response.lookup =  {"$lookup" : { "from" : "Station" , "localField" : "exit_Station" , "foreignField" : "_id" , "as": "Exit_Station"}},
//             lookup_response.unwind = {"$unwind": "$Exit_Station"}
//           break;
//      case 'route':
//             lookup_response.lookup =  {"$lookup" : { "from" : "Route" , "localField" : "route" , "foreignField" : "_id" , "as": "Route"}},
//             lookup_response.unwind = {"$unwind": "$Route"} 
//              break;
//      case 'bus':
//             lookup_response.lookup =  {"$lookup" : { "from" : "Bus" , "localField" : "bus" , "foreignField" : "_id" , "as": "Bus"}},
//             lookup_response.unwind = {"$unwind": "$Bus"} 
//            break;
//      case 'organization':
//           //  await this.lookup_aggregation({type: 'bus'} , aggregator)
//             lookup_response.lookup =  {"$lookup" : { "from" : "Organization" , "localField" : "organization" , "foreignField" : "_id" , "as": "Organization"}},
//             lookup_response.unwind = {"$unwind": "$Organization"}
//            break;
//      default:
//             return {success: false , message: 'wrong input'}  
//             }

//      aggregator.push(lookup_response.lookup);
//      aggregator.push(lookup_response.unwind);       
            
//      return  {success: true, message: 'Successful'}      
// }, 
// async group_aggregation(data , aggregator){
//   var group_Id = {} , sort_Id= {};
//   //{ $group: { "_id": { "month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}, count: { $sum: '$transaction_Amount' }  } } ,
//   switch(data.type){
//     case 'day':
//               group_Id = { "day": {"$dayOfMonth": "$createdAt"} ,"month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}
//               sort_Id = {  "_id.year" : -1, "_id.month" : -1,  "_id.day": -1  } 
//               break;
//     case 'month':
//               group_Id =   { "month": { "$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} 
//               sort_Id = {  "_id.year" : -1, "_id.month" : -1 }              
//              break;
//     case 'year':
//                group_Id =   {  "year" : {"$year": "$createdAt"}} 
//                sort_Id = {  "_id.year" : -1 }                
//                  break;  
//     case 'year':
//                   group_Id =   {  "year" : {"$year": "$createdAt"}} 
//                   sort_Id = {  "_id.year" : -1 }                
//                 break;  
//     case 'entry_Station':
//                  group_Id = "$Entry_Station.station_Name"
//                  sort_Id = {_id : 1} 
//                  break;
//     case 'exit_Station':
//                   group_Id =  "$Exit_Station.station_Name"
//                   sort_Id = {_id : 1} 
//                   break;
//    case 'ticket_type':
//                     group_Id =  "$Ticket_type"
//                     sort_Id = {_id : 1} 
//                     break;  
//    case 'organization':
//                       group_Id = "$organization.organization_Name"
//                       sort_Id = {_id : 1} 
//                       break;
//    case 'route':
//                       group_Id ="$Route.route_Name"
//                       sort_Id = {_id : 1} 
//                       break;              
//    default:
//                return {success: false}
//             //   break; 
//                }
               
//              //  return;        
//       var  group  ={$group:  {"_id": group_Id , count: await this.group_count_aggregator(data.count)}}
//       var  sort =  {  "$sort" :sort_Id }     
         
//      aggregator.push(group);
//      aggregator.push(sort);       
//    // console.log(aggregator)   
//      return  {success: true, message: 'success'}      
// }, 
// async group_count_aggregator(data){
//  // var group_Id = {} , sort_Id= {};
//   // console.log(data)
//   switch(data.type){
//     case 'sum':
//                return {"$sum" : 1};
//     case 'month':
//               return { $sum: '$transaction_Amount' }           
//     default:
//              return {success: false}
//           }
// },
// async project_aggregator(data , aggregator){
//      var project ;
    
//   switch(data.type){
//     case 'day':
//                project = {"$project": { '_id': {'$concat' : [ {$substr: [ "$_id.day", 0, 2 ]},"/",{$substr: [ "$_id.month", 0, 2 ]}]}, 'count': 1 }};
//                break;
//     case 'month':
//                project =  {"$project": { '_id': {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 2 ]}]}, 'count': 1 }};
//                break  
//     // case 'year':
//     //            return {"$project": { '_id': {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 2 ]}]}, 'count': 1 }};                    
//     default:
//             return {status: false}
//            //  break;
//                   }
//     aggregator.push(project);  

// },
// async add_Field_aggregator(aggregator){
//  var add =  {
//     $addFields: {    
//       "Ticket_type": {
//          $concat: [
//             { $cond: [{$and :[{$ne : ['$ticket', undefined]}]} ,
//                        { $cond: [{$eq : ['$Ticket.ticket_type', 'Temporary'] }, "Temporary" , "Mobile"]},
//                        "card" ]}
//                  ]
//       }

//     }
//              }
//    aggregator.push(add);  
// },
    async create_Transaction_Object(req){
        try{
           var transaction = {
            ticket_Type: req.body.ticket_Type,
            customer: req.body.customer,
            ticket: req.body.ticket,
            transport_length: req.body.transport_length,
            entry_Station : req.body.entry_Station,
            exit_Station : req.body.exit_Station,
            route: req.body.route
                            } 
           Object.keys(transaction).forEach(key=> transaction[key] === undefined ? delete transaction[key]: {})        
           return transaction
          }
          catch(err){throw err}         
         },
}
