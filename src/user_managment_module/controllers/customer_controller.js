const Customer = require('../models/customer');
const Respond = require('../../helpers/response');
const Auth = require('../../helpers/authenticator');
const utility = require('../../helpers/utility');
const Wallet_Credential = require('../../wallet_module/controllers/wallet_credential_controller');
const Wallet = require('../../wallet_module/controllers/wallet_controller');
const report = require('../../report_module/controllers/aggrigation');

module.exports = {
    async register_Customer (req,res){
        try{
        if( await Auth.authenticate_Access({customer: req.body.type || 'normal' , creator: "true" },req.user.employee)){ 
            var customer_Object = await this.create_Customer_Object(req) //.catch(err=>{throw err});
            let customer = new Customer(customer_Object)  
            var result = await Customer.create(customer)
               if(result) {
              var message = await  Wallet_Credential.register_Wallet_Credential(result._id, customer,req)
                            if(message.success == true)
                                   message.message = `Customer Id - ${customer.customer_Id} - registered`
                            else 
                                   {   
                                      await Customer.findByIdAndDelete(message._id)  
                                      throw new Error('Wallet could not be created - Internal Error');
                                   }       
                                        return await Respond.respond(req,res, message)       
                        }
                    else 
                       return await Respond.respond(req,res, {success: false , message: 'Customer could not be created due to internal error'})                               
            }
            else
                  return await Respond.respond(req, res ,{success: false , message: "attempt to register customer with out access"});         
        }catch(err){ 
            var created_customer = await this.search_For_Customer_IV({phone_Number : customer_Object.phone_Number}); 
            if(created_customer)
                  {
                      var wallet = Wallet.search_For_Wallet_IV({customer: created_customer.message._id});
                      if(!wallet.success)
                         await Customer.findByIdAndDelete(created_customer.message._id)
                  }
           if(created_customer.length == 0 && req.file)
                  await utility.delete_file(req.file.path)
                throw err }
    },
 async find_Customer (req, res , limit = 1){   
      try{
    var customer = await this.search_For_Customer_EV(req,  req.query , limit )
          return await Respond.respond(req,res , customer )       
    }catch(err){ throw err }
  },
   async update_Customer (req,res){
         try{
          var result ;
          var update = false ; 
          var search_parameter;

          if(req.user.customer)
           { 
               search_parameter  = req.user.customer; 
               update = true  ;   
           } 
          else if(req.user.employee)
            {
               search_parameter = req.query._id;   
            }
         const customer = await this.search_For_Customer_EV(req, search_parameter)
         if(customer.success){
            var wallet =  await Wallet_Credential.search_For_Wallet_Iv({customer:customer.message._id})
            if(req.user.employee) 
              {
                  if( await Auth.authenticate_Access({customer: wallet.message.customer_type , editor: true },req.user.employee))
                       update = true
                    
              }
            if(update == true)   {
          var customer_Object = await  this.create_Customer_Object(req);
         if(customer_Object.customer_Id)   delete customer_Object.customer_Id;      
       result = await Customer.findByIdAndUpdate(customer.message._id,{$set: customer_Object},{new: true, runValidators: true , context:'query'})  
       if(result) 
                return await Respond.respond(req, res,{success: true , message: `Customer Id - ${customer.message.customer_Id} - updated`});
            else 
                return await Respond.respond(req, res,{success: false , message: `Customer have not been found`});
         }
         else  
               return await Respond.respond(req , res,{success: false , message: "attempt to update an customer data with out access"});
           }
          else 
               return await Respond.respond(req, res,{success: false , message: "The Customer does not exist"});
            }
            catch(err){
                if(!result && req.file)
                  await utility.delete_file(req.file.path)
                throw err}     
},  
/*async delete_Customer (req,res){
    try{          
        await Customer.findByIdAndDelete(req.body._id)
        .then(result =>{
            if(result)
                {
                     
                     
                     return this.respond(res,{success: true, message:'Customer have been successfully deleted'});
                }else{
                    return this.respond(res,{success: false, message:'Customer not found'});
                }
        })
        .catch(err=>{
            throw err
        })
    }catch(err){
       throw err
    }
}, */

async search_For_Customer_EV(req, data , limit = 1 ){
    try{
        var customer = await this.search_For_Customer_IV(data, limit)
       if(customer.success){
        customer = JSON.stringify(customer);
        customer = JSON.parse(customer);
        if(!Array.isArray(customer.message)) {
            customer.message = [customer.message]
        }
            customer.message = await customer.message.filter(async element=> 
            {    
                var wallet = await Wallet.search_For_Wallet_IV({customer: element._id},limit); 
               if(wallet.success)
               { 
                   
                    if( await Auth.authenticate_Access({customer: wallet.message.customer_type , viewer: "true" },req.user.employee))
                         {  
                             return element
                         }
                }
                  else
                           throw new Error ('Customer with out Wallet has been found');            
            })
            
            if(limit == 1 && customer.message.length == 1 )
            {
                customer.message = await customer.message.reduce((cus)=> {return cus})  
                return {success:true,  message: customer.message};
            }
       else if( customer.message.length > 0) 
                return customer;    
       else 
              return {success: false, message: 'Customer viewing is out of access'}
          }
        else
             return  {success: false, message: 'Customer is not found'};        
    }catch(err){ throw err }
},
async search_For_Customer_IV( data , limit = 1 ){
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
            if(data.phone_Number)
                query_Object.phone_Number = data.phone_Number;
            if(data.customer_Id)
                query_Object.customer_Id = data.customer_Id; 
            if(data.identification_Number)
                 query_Object.identification_Number = data.identification_Number;
           if(data._id)
                query_Object._id = data._id     
         var result = await Customer.find(
            query_Object
         ,null ,
          {sort:{
               'name.first_Name': 1,
               'name.last_Name': 1,
               'name.grand_Father_Name': 1
          }})
          .limit(limit)
           if(result.length == 1) {
            result = result.reduce((customer)=> {return customer})
          
            return {success:true, message: result};
          }
      else if(result.length > 1 )   
            return {success:true, message: result};
      else
            return {success: false , message: 'Customer is not found'}; 
    }catch(err){  throw err  }
},
async aggregate_worker(req,res){
  try{
    // if(await Auth.authenticate_Access({analysis: { creator: true}},req.user.employee)){ 
         var data = await report.begin_aggregation(req);
      //  console.log('ooooooooooo')
       // console.log(data)
          var created_aggregation = await report.aggregate_creator(data);
          // console.log(created_aggregation)
          var aggregate = await   Customer.aggregate(created_aggregation)
        // console.log(aggregate)
          var result = await report.result_generator(aggregate,req.body.output)
          Respond.respond(req,res,result) 
  //   }
  // else 
  //         return Respond.respond ( req,res ,{success: false, message: "attempt to generate report with out access"});
  }catch(err) {throw err}
},
async customer_aggregate(req,res ,data = {total: true}){
    try{
       var group_Id = {} , sort_Id = {} , lookup = {} , group = {} , sort = {} ,match = {}
        
       switch (data.group) {
           case 'day':
                 group_Id =   { "day": {"$dayOfMonth": "$createdAt"} ,"month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}               
                 sort_Id = {  "_id.year" : -1, "_id.month" : -1,  "_id.day": -1  }
                 project_Id =  {'$concat' : [ {$substr: [ "$_id.day", 0, 2 ]},"/",{$substr: [ "$_id.month", 0, 2 ]}]}
                 break;
           case 'month':
                 group_Id =   { "month": { "$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} 
                 sort_Id = {  "_id.year" : -1, "_id.month" : -1 } 
                 project_Id = {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 4 ]}]}             
                break;
           case 'year':
                  group_Id =   {  "year" : {"$year": "$createdAt"}} 
                  sort_Id = {  "_id.year" : -1 }  
                  project_Id =  "$_id.year"             
                    break;       
           default:
               break;
       }     

       if(Object.keys(group_Id).length !== 0)
             group = {  "$group" : {   "_id": group_Id ,   "count": {"$sum" : 1}   }   }; 
       if(Object.keys(sort_Id).length !== 0)    
             sort =  {  "$sort" : sort_Id }    
       if(data.lookup && data.lookup == "wallet") 
             lookup ={"$lookup" : { "from" : "Wallet" , "localField" : "_id" , "foreignField" : "customer" , "as": "wallet"}}
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
    //    var created_error =  new Error('lkjdjdjddbbddhhjddndmdj') 
    //    created_error.code = '403';
    //    throw created_error           
      //  console.log(filtered_query) 
      var d = new Date();
     // console.log(d); 
        d.setDate(d.getDate()-40); 
        d.setHours(0,0,0,0);   
      //  console.log(d);  
       var first_Date =new Date('2020-01-01T00:00:00.000+00:00');
       var last_Date=new Date('2020-12-01T00:00:00.000+00:00');
       // last_Date = new Date('')
    //    console.log(first_Date)

      var result =  await Customer.aggregate(
       [  
       {"$match": {'createdAt':{'$gte': first_Date , '$lte': last_Date} }},
       {"$group" : {   "_id": { "month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} ,   "count": {"$sum" : 1}   }   },  
       {"$sort": {"_id.year":1, "_id.month":1}},
       {"$project": { 
                   '_id': {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 2 ]}]}, //,"$_id.day","-" , "$_id.month","-", "$_id.year"]},
                   'count':1
        }} 
        ]
        )
    
       var date = [];
       var count = []; 
       var backgroundColor= []
       var borderColor = []; 
         
         if(req.query.type == 'date'){

             var Difference_In_Time = last_Date.getTime() - first_Date.getTime(); 
  
             var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
             for(i=0 ; i<Difference_In_Days;i++)
             {
                 first_Date.setDate(first_Date.getDate() + 1)
                 month =  first_Date.getMonth()+1
                 date.push(first_Date.getDate() + '/' + month);
                 counter = result.find(element=> element['_id'] == date[i])
                 var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";
                 backgroundColor.push(color + "0.2)");
                 borderColor.push(color + "1)");
                
                   if(counter)
                        count.push(counter.count)
                   else
                         count.push(0)
             }
                                     }
          else 
             if(req.query.type == 'month'){
 //               var Difference_In_Time = last_Date.getTime() - first_Date.getTime(); 
  
                         //    var Difference_In_Days = parseInt( Difference_In_Time / (1000 * 3600 * 24 *7 * 4)); 
                         first_Date_Month = first_Date.getMonth();
                         last_Date_Month = last_Date.getMonth();
                         first_Date_Year = first_Date.getFullYear();
                         last_Date_Year = last_Date.getFullYear();
                          diff = (last_Date_Month + (12 * (last_Date_Year - first_Date_Year)) + 1)  - first_Date_Month
                             for(i=1 ; i<diff;i++)
                             {      
                                 if(i != 1) 
                                     first_Date.setMonth(first_Date.getMonth() + 1)
                                 year =  first_Date.getYear() - 100
                                 month = first_Date.getMonth() + 1
                                 date.push(month + '/' + year);
                                counter = result.find(element=> element['_id'] == date[i-1])
                                var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
                                 backgroundColor.push(color + "0.2)");
                                 borderColor.push(color + "1)");
                                
                                   if(counter)
                                      count.push(counter.count)
                                   else
                                      count.push(0)
                             }
               
              }   
                 
                
            // console.log(Difference_In_Days)
            // for(i=0 ; i<Difference_In_Days;i++)
            //     {
            //         first_Date.setDate(first_Date.getDate() + 1)
            //         month =  first_Date.getMonth()+1
            //         date.push(first_Date.getDate() + '/' + month);
            //         counter = result.find(element=> element['_id'] == date[i])
            //         var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";

            //         // We push this new color to both background and border color arrays
            //         // .. a lighter color is used for the background
            //         backgroundColor.push(color + "0.2)");
            //         borderColor.push(color + "1)");
            //         // result.forEach(element=>{
            //         //    if(element['_id'] == date[i])
            //         //        {
            //         //              counter = element['count']
            //         //              break;
            //         //              //  console.log(element)
            //         //              //  count.push(element['count'])
            //         //              //  console.log(count.length + '    ' + i)
            //         //        }   
            //         // })
            //           if(counter)
            //                count.push(counter.count)
            //           else
            //                 count.push(0)
            //     }
            //    console.log(date)
            //   console.log(count)
               var total = 0;
      if(data.total) 
            {      
                for(i=0 ; i<result.length ; i++)
                     total += result[i].count
                result.push({"_id": "total" , "count": total})     
            }
            // var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";

            // // We push this new color to both background and border color arrays
            // // .. a lighter color is used for the background
            // backgroundColor.push(color + "0.2)");
            // borderColor.push(color + "1)");
        return Respond.respond(req,res, {success:true, message: {date,count,backgroundColor,borderColor,total}});
      }catch(err){

      //  console.log(err);  
      //  console.log('kk               ll')
        throw err}
},

async customer_aggregates(req,res ,data = {total: true}){
    try{
       
      
          
      var result =  await Customer.aggregate(
        [ {"$lookup" : { "from" : "Wallet" , "localField" : "_id" , "foreignField" : "customer" , "as": "wallet"}},  
        {"$unwind" : "$wallet" },
        {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
        { $group: { _id: "$user_access_type",  count: { $sum: 1 }  } }   
        ]
        )
      //  filtered_query)    
      
      var total = 0
      if(data.total) 
            {      
                for(i=0 ; i<result.length ; i++)
                     total += result[i].count
                result.push({"_id": "total" , "count": total})     
            }
         //   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";

        return Respond.respond(req,res, {success:true, message: result});
      }catch(err){

      //  console.log(err);  
       // console.log('kk               ll')
        throw err}
},
async customer_aggregatess(req,res ,data = {total: true}){
    try{
            
      var result =  await Customer.aggregate(
        [ {"$lookup" : { "from" : "Wallet" , "localField" : "_id" , "foreignField" : "customer" , "as": "wallet"}},  
        {"$unwind" : "$wallet" },
      //  {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
        { $group: { _id: "$wallet.customer_type",  count: { $sum: 1 }  } }   
        ]
        )
      //  filtered_query)    
        var data  = [];
        var backgroundColor = [];
        var borderColor = [];
        var count = [];
            result.forEach(element=>{
                  data.push(element._id)
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
         //   console.log(data)
          //  console.log(count)
         //   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";
        return Respond.respond(req,res, {success:true, message: {data, count ,backgroundColor, borderColor, total}});
      }catch(err){

      //  console.log(err);  
       // console.log('kk               ll')
        throw err}
},
async customer_aggregatesss(req,res ,data = {total: true}){
    try{
       
      
          
      var result =  await Customer.aggregate(
        [// {"$lookup" : { "from" : "Wallet" , "localField" : "_id" , "foreignField" : "customer" , "as": "wallet"}},  
         //{"$unwind" : "$wallet" },
      //  {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
        { $group: { _id: "$gender",  count: { $sum: 1 }  } }   
        ]
        )
      //  filtered_query)    
        var data  = []
        var count = []
        var backgroundColor = [];
        var borderColor = [];
            result.forEach(element=>{
                  data.push(element._id)
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
         //   console.log(data)
         //   console.log(count)
         //   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";
        return Respond.respond(req,res, {success:true, message: {data , count , backgroundColor , borderColor , total}});
      }catch(err){

      //  console.log(err);  
      //  console.log('kk               ll')
        throw err}
},
async customer_aggregatessss(req,res ,data = {total: true}){
    try{
       
      
          
      var result =  await Customer.aggregate(
        [// {"$lookup" : { "from" : "Wallet" , "localField" : "_id" , "foreignField" : "customer" , "as": "wallet"}},  
         //{"$unwind" : "$wallet" },
      //  {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
      {
        $project: {    
          "range": {
             $concat: [
                { $cond: [{$lte: ["$age",0]}, "Unknown", ""]}, 
                { $cond: [{$and:[ {$gt:["$age", 0 ]}, {$lt: ["$age", 18]}]}, "0 - 18", ""] },
                { $cond: [{$and:[ {$gte:["$age",18]}, {$lt:["$age", 25]}]}, "18 - 24", ""]},
                { $cond: [{$and:[ {$gte:["$age",25]}, {$lt:["$age", 31]}]}, "25 - 30", ""]},
                { $cond: [{$and:[ {$gte:["$age",31]}, {$lt:["$age", 41]}]}, "31 - 40", ""]},
                { $cond: [{$and:[ {$gte:["$age",41]}, {$lt:["$age", 51]}]}, "41 - 50", ""]},
                { $cond: [{$gte:["$age",51]}, "50 +", ""]}
             ]
          }

        }
    },
          {  $group: { 
              "_id" : "$range", 
              count: { 
                $sum: 1
              } 
            }
        //  }   
      } , 
           {$sort: {'_id': 1}}  
        ]
        )
       //  result    
        var data  = ["0 - 18","18 - 24","25 - 30","31 - 40","41 - 50","50 +"]
        var count = []
           for(i=0; i<data.length ; i++)
             {
               var counter =  result.find(element=> element['_id'] == data[i])
                if(counter != undefined)
                     count[i] = counter.count;
                else 
                     count[i] = 0     
             }
          //   console.log(count)
            // result.forEach(element=>{
            //       data.push(element._id)
            //       count.push(element.count)
            // }) 
      var total = 0
      if(data.total) 
            {      
                for(i=0 ; i<result.length ; i++)
                     total += result[i].count
                result.push({"_id": "total" , "count": total})     
            }
         //   console.log(data)
         //   console.log(count)
         //   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";
        return Respond.respond(req,res, {success:true, message: {data,count,total}});
      }catch(err){

     //   console.log(err);  
     //   console.log('kk               ll')
        throw err}
},


// async Registered_customer_aggregate(){
//     try{
//        data =  [     
//         //   {"$lookup" : { "form" : "wallet" , "localfield" : "_id" , "foreignField" : "customer" , "as": "wallet"}},
//         { "$group" : {
//                         "_id": { "month": { "$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} ,
//                         "count": {"$sum" : 1}
//                     }  
//         }  ,          
//         {  "$sort" : {  "_id.year" : -1, "_id.month" : -1,    } }         
//                  ]
               
//       var result =  await Customer.aggregate(data)    
//         return {success:true, message: result};
//       }catch(err){throw err}
// },


async create_Customer_Object(req){
    try{
    var customer = {
        name:{
            first_Name: req.body.first_Name,
            last_Name: req.body.last_Name,
            grand_Father_Name: req.body.grand_Father_Name
              },     
        phone_Number: req.body.phone_Number,
        address: req.body.address,
        customer_Id: req.body.customer_Id,
        identification_Number:req.body.identification_Number, 
        gender:req.body.gender,
        age: req.body.age,
            };
       if(req.file){
        customer.profile_Picture =  '/uploads/Customer_Profile/' + req.file.filename  
       } 
       if(customer.name.first_Name == undefined || customer.name.last_Name == undefined || customer.name.grand_Father_Name == undefined)
          delete customer.name;
       Object.keys(customer).forEach(key=> customer[key] === undefined ? delete customer[key]: {})       
       return customer
      }
      catch(err){throw err}         
},
} 
