
const aggregation_query = require('./ready_made_aggregation');

module.exports  = 
{
    async begin_aggregation(req){
       try{
       var data;
        switch(req.body.type){
            case 'number_of_transaction':     
                        data = await aggregation_query.number_of_transaction(req.body.first_Date , req.body.last_Date, req.body.output)
                        break;
            case  'transaction_per_route':
                        data = await  aggregation_query.transaction_per_route(req.body.first_Date , req.body.last_Date, req.body.output)           
                             break;
            case 'transaction_per_transaction_amount': 
                          data = await   aggregation_query.transaction_per_transaction_amount(req.body.first_Date , req.body.last_Date, req.body.output)
                             break;
            case 'transaction_per_organization': 
                             data = await aggregation_query.transaction_per_organization(req.body.first_Date , req.body.last_Date, req.body.output);
                             break;
            case 'transaction_per_payment_type': 
                            data = await aggregation_query.transaction_per_payment_type(req.body.first_Date , req.body.last_Date, req.body.output);
                             break;
            case 'transaction_By_Entry_station':
                       data = await aggregation_query.transaction_By_Entry_station(req.body.first_Date , req.body.last_Date, req.body.output);
                             break;
            case 'transaction_By_Exit_Station':
                         data =  await aggregation_query.transaction_By_Exit_Station(req.body.first_Date , req.body.last_Date, req.body.output);
                             break;   
            case 'customer_By_Age_Range':
                         data = await  aggregation_query.customer_By_Age_Range();
                             break;
            case 'customer_By_Gender':
                           data = await aggregation_query.customer_By_Gender()
                             break; 
            case 'customer_By_customer_Type':
                       data = await aggregation_query.customer_By_customer_Type();
                             break;
            case 'customer_registration_By_Month':
                           data = await  aggregation_query.customer_registration_By_Month(req.body.first_Date , req.body.last_Date, req.body.output);
                             break;
            case 'Customer_by_user_access_type':
                           data = await  aggregation_query.Customer_by_user_access_type();
                            break;
            case 'Machine_By_Machine_Type':
                            data = await aggregation_query.Machine_By_Machine_Type(); 
                            break;
            case 'Employee_Number_By_Organization':     
                             data = await aggregation_query.Employee_Number_By_Organization() ;
                             break;
            case 'Bus_By_Service_Provider':
                           data = await  aggregation_query.Bus_By_Service_Provider();
                           break;
            default:
                              data = req.body;  
                              break;                                                                                                                                                                                                                     
          }
              return data;
        }
        catch(err) {throw err}
    },
  async aggregate_creator(data){
        var generated_aggregator = [];
        for (element in data){ 
       // data.forEach((element)=>{
       //   console.log(data[element])
              if(data[element]['type'] == 'match') 
                  await  this.match_aggregator(data[element]['data'] , generated_aggregator);
              if(data[element]['type'] == 'lookup') 
                   await  this.lookup_aggregation(data[element]['data'] , generated_aggregator);      
              if(data[element]['type'] == 'group') 
                   await  this.group_aggregation(data[element]['data'] , generated_aggregator);
              if(data[element]['type'] == 'project') 
                   await this.project_aggregator(data[element]['data'] , generated_aggregator); 
              if(data[element]['type'] == 'addFields') 
                   await this.add_Field_aggregator(data[element]['data'] , generated_aggregator);  
                //  console.log(generated_aggregator)           
        }
       
         //  entry - goro  exit - megenagna  age  - 40
       // console.log(result)
       return generated_aggregator;  
  },
  async match_aggregator(data, aggregator){
      
      var match_response ;
    //  console.log(data.data.type)
      switch(data.type){
        case 'date_difference':         
                match_response =  {"$match": {'createdAt': {'$gte': new Date (data.first_Date) , '$lte': new Date (data.last_Date)} }}
                 break;
        case 'exact_date':
               match_response = {"$match": {'createdAt' : new Date (data.date)}}
               break;
        case 'gender':
               if(data.data == 'deep')
                   match_response = {"$match": {'Customer.gender' : data.gender}} 
               else
                   match_response = {"$match": {'gender' : data.gender}}   
               break;
        case 'age':
              if(data.lower)
                     age_Id = {'$lte' : data.age} 
              else if (data.higher)
                     age_Id = {'$gte': data.age}
              else if(data.difference)
                     age_Id = {'$gte': data.low_age , '$lte': data.high_age}   
              else if(data.exact)
                     age_Id = data.age   
              if(data.data == 'deep')
                     match_response = {"$match": {'Customer.age' : data.age_Id}} 
              else
                     match_response = {"$match": {'age' : age_Id}}                         
           //   match_response = {"$match": {'age' : age_Id}} 
              break;
         case 'ticket_type':
               match_response = {"$match": {'Ticket.ticket_type' : data.ticket_type}} 
               break;
         case 'entry_Station':
               match_response = {"$match": {'Entry_Station.station_Name' : data.entry_Station}} 
               break;
         case 'exit_Station':
               match_response = {"$match": {'Exit_Station.station_Name' : data.exit_Station}}
               break;
         case 'route':
                match_response = {"$match": {'Route.route_Name' : data.route_Name}}
                break;
         default:
                return {success: false , message: 'wrong input'}; 
                }
         aggregator.push(match_response)     
     //    console.log(match_response)  
         return  {success: true, message: match_response}      
  },
  async lookup_aggregation(data , aggregator){
    var lookup_response = {};
    switch(data.type){
      case 'customer': 
              lookup_response.lookup =  {"$lookup" : { "from" : "Customer" , "localField" : "customer" , "foreignField" : "_id" , "as": "Customer"}},
              lookup_response.unwind = {"$unwind": "$Customer"}      
               break;
      case 'ticket':
              lookup_response.lookup =  {"$lookup" : { "from" : "Ticket" , "localField" : "ticket" , "foreignField" : "_id" , "as": "Ticket"}},
              lookup_response.unwind = {"$unwind": "$Ticket"} 
             break;
      case 'entry_Station':
              lookup_response.lookup =  {"$lookup" : { "from" : "Station" , "localField" : "entry_Station" , "foreignField" : "_id" , "as": "Entry_Station"}},
              lookup_response.unwind = {"$unwind": "$Entry_Station"} 
             break;
      case 'exit_Station':
              lookup_response.lookup =  {"$lookup" : { "from" : "Station" , "localField" : "exit_Station" , "foreignField" : "_id" , "as": "Exit_Station"}},
              lookup_response.unwind = {"$unwind": "$Exit_Station"}
            break;
       case 'route':
              lookup_response.lookup =  {"$lookup" : { "from" : "Route" , "localField" : "route" , "foreignField" : "_id" , "as": "Route"}},
              lookup_response.unwind = {"$unwind": "$Route"} 
               break;
       case 'bus':
              lookup_response.lookup =  {"$lookup" : { "from" : "Bus" , "localField" : "bus" , "foreignField" : "_id" , "as": "Bus"}},
              lookup_response.unwind = {"$unwind": "$Bus"} 
             break;
       case 'organization':
            //  await this.lookup_aggregation({type: 'bus'} , aggregator)
              lookup_response.lookup =  {"$lookup" : { "from" : "Organization" , "localField" : data.localField , "foreignField" : "_id" , "as": "Organization"}},
              lookup_response.unwind = {"$unwind": "$Organization"}
             break;
       case 'wallet':
               lookup_response.lookup = {"$lookup" : { "from" : "Wallet" , "localField" : "_id" , "foreignField" : "customer" , "as": "Wallet"}}
               lookup_response.unwind = {"$unwind" : "$Wallet" }  
               break;    
       default:
              return {success: false , message: 'wrong input'}  
              }
  
       aggregator.push(lookup_response.lookup);
       aggregator.push(lookup_response.unwind);       
              
       return  {success: true, message: 'Successful'}      
  }, 
  async group_aggregation(data , aggregator){
    var group_Id = {} , sort_Id= {};
    //{ $group: { "_id": { "month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}, count: { $sum: '$transaction_Amount' }  } } ,
    switch(data.type){
      case 'day':
                group_Id = { "day": {"$dayOfMonth": "$createdAt"} ,"month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}}
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
      case 'year':
                    group_Id =   {  "year" : {"$year": "$createdAt"}} 
                    sort_Id = {  "_id.year" : -1 }                
                  break;  
      case 'entry_Station':
                   group_Id = "$Entry_Station.station_Name"
                   sort_Id = {_id : 1} 
                   break;
      case 'exit_Station':
                    group_Id =  "$Exit_Station.station_Name"
                    sort_Id = {_id : 1} 
                    break;
     case 'ticket_type':
                      group_Id =  "$Ticket_type"
                      sort_Id = {_id : 1} 
                      break;  
     case 'organization':
                        group_Id = "$Organization.organization_Name"
                        sort_Id = {_id : 1} 
                        break;
     case 'route':
                        group_Id ="$Route.route_Name"
                        sort_Id = {_id : 1} 
                        break;   
     case 'user_access_type':
                        group_Id ="$user_access_type"
                        sort_Id = {_id : 1} 
                        break;  
     case 'customer_type': 
                         group_Id ="$Wallet.customer_type"
                         sort_Id = {_id : 1} 
                         break; 
     case 'range': 
                         group_Id ="$range"
                         sort_Id = {_id : 1} 
                         break;                     
     case 'gender': 
                         group_Id ="$gender"
                         sort_Id = {_id : 1} 
                         break; 
     case 'machine_type': 
                         group_Id ="$machine_Type"
                         sort_Id = {_id : 1} 
                         break;                                                                                  
     default:
                 return {success: false}
              //   break; 
                 }
                 
               //  return;        
        var  group  ={$group:  {"_id": group_Id , count: await this.group_count_aggregator(data.count)}}
        var  sort =  {  "$sort" :sort_Id }     
           
       aggregator.push(group);
       aggregator.push(sort);       
     // console.log(aggregator)   
       return  {success: true, message: 'success'}      
  }, 
  async group_count_aggregator(data){
   // var group_Id = {} , sort_Id= {};
    // console.log(data)
    switch(data.type){
      case 'sum':
                 return {"$sum" : 1};
      case 'amount':
                return { $sum: '$transaction_Amount' }           
      default:
               return {success: false}
            }
  },
  async project_aggregator(data , aggregator){
       var project ;
      
    switch(data.type){
      case 'date':
                 project = {"$project": { '_id': {'$concat' : [ {$substr: [ "$_id.day", 0, 2 ]},"/",{$substr: [ "$_id.month", 0, 2 ]}]}, 'count': 1 }};
                 break;
      case 'month':
                 project =  {"$project": { '_id': {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 2 ]}]}, 'count': 1 }};
                 break  
      // case 'year':
      //            return {"$project": { '_id': {'$concat' : [ {$substr: [ "$_id.month", 0, 2 ]},"/",{$substr: [ "$_id.year", 0, 2 ]}]}, 'count': 1 }};                    
      case 'age_range':
                 project = {
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
                }
                break;
      default:
              return {status: false}
             //  break;
                    }
      aggregator.push(project);  
  
  },
  async add_Field_aggregator(data,aggregator){
    var add;
    switch(data.type){
    case 'ticket_type':
        add = {
      $addFields: {    "Ticket_type": {  $concat: [
                                                       { $cond: [{$and :[{$ne : ['$ticket', undefined]}]} ,
                                                       { $cond: [{$eq : ['$Ticket.ticket_type', 'Temporary'] }, "Temporary" , "Mobile"]},"card" ]}
                   ]} 
                     }
        }
          break;
    case 'user_access_type':
        add = {$addFields: { user_access_type: { $setUnion: "$Wallet.user_access_type" }} }
        break;      
    default: 
          return {success: false}
               }
     aggregator.push(add);  
  },
  async result_generator(data, output){

    var result = [];
    var count = []; 
    var backgroundColor= []
    var borderColor = []; 
    var total;
   
    if(output.type == 'range'){
     // console.log(output)
           result = output.range;
              for(i=0; i<result.length ; i++)
                {
                  var counter =  data.find(element=> element['_id'] == result[i])
                   if(counter != undefined)
                        count[i] = counter.count;
                   else 
                        count[i] = 0  
                        var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
                        backgroundColor.push(color + "0.2)");
                        borderColor.push(color + "1)");       
                }
                if(count.length != 0)
                total = count.reduce((a,b)=> a+b);
                 return  {success:true, message: {result,count,backgroundColor , borderColor,total}};
    }
    else if(output.type == 'other')  {
    
    data.forEach(element=>{
      result.push(element._id)
      count.push(element.count)
      var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
      backgroundColor.push(color + "0.2)");
      borderColor.push(color + "1)");
  }) 
           if(count.length != 0)
     total = count.reduce((a,b)=> a+b);
    //   var total = 0
    // if(data.total) 
    //       {      
    //           for(i=0 ; i<result.length ; i++)
    //                total += result[i].count
    //           result.push({"_id": "total" , "count": total})     
    //       }
      return  {success:true, message: {result,count,backgroundColor , borderColor,total}};
         }
     else if(output.type == 'date'){
       var dates = await aggregation_query.calculate_dates(output.first_Date , output.last_Date , output) 
       output.first_Date = dates.first_Date 
       output.last_Date= dates.last_Date
       
        var Difference_In_Time = output.last_Date.getTime() - output.first_Date.getTime(); 
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
        for(i=0 ; i<Difference_In_Days;i++)
        {
            output.first_Date.setDate(output.first_Date.getDate() + 1)
            month =  output.first_Date.getMonth()+1
            date.push(output.first_Date.getDate() + '/' + month);
            counter = result.find(element=> element['_id'] == date[i])
            var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";
            backgroundColor.push(color + "0.2)");
            borderColor.push(color + "1)");
           
              if(counter)
                   count.push(counter.count)
              else
                    count.push(0)
        }
        return  {success:true, message: {result,count,backgroundColor , borderColor,total}};
                                }
     else if(output.type == 'month'){
      //   console.log('heeeer')
        var dates = await aggregation_query.calculate_dates(output.first_Date , output.last_Date , output) 
        output.first_Date = dates.first_Date 
        output.last_Date= dates.last_Date
    //    console.log(dates)
        // output.first_Date = new Date(output.first_Date);
        // output.last_Date= new Date(output.last_Date);
      first_Date_Month = output.first_Date.getMonth();
      last_Date_Month = output.last_Date.getMonth();
      first_Date_Year = output.first_Date.getFullYear();
      last_Date_Year = output.last_Date.getFullYear();
       diff = (last_Date_Month + (12 * (last_Date_Year - first_Date_Year)) + 1)  - first_Date_Month
                for(i=1 ; i<=  diff;i++)
                { 
                    if(i != 1) 
                        output.first_Date.setMonth(output.first_Date.getMonth() + 1)     
                    year =  output.first_Date.getYear() - 100
                    month = output.first_Date.getMonth() + 1
                    result.push(month + '/' + year);
                   // console.log(data)
                   counter = data.find(element=> element['_id'] == result[i-1])
                   var color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",";   
                    backgroundColor.push(color + "0.2)");
                    borderColor.push(color + "1)");       
                      if(counter)
                         count.push(counter.count)
                      else
                         count.push(0)
                }
  
 }   
 if(count.length != 0)
 total = count.reduce((a,b)=> a+b);
      return {success:true, message: {result,count,backgroundColor , borderColor,total}};
    }
}










// Customer_By_User_Access_Type(){
//     type: piechart
    
//     [ {"$lookup" : { "from" : "Wallet" , "localField" : "_id" , "foreignField" : "customer" , "as": "wallet"}},  
//     {"$unwind" : "$wallet" },
//     {$addFields: { user_access_type: { $setUnion: "$wallet.user_access_type" }} },
//     { $group: { _id: "$user_access_type",  count: { $sum: 1 }  } }   
//     ]

// }
// CustomerBy_registration_Date(){
// [  
//     {"$match": {'createdAt':{'$gte': first_Date , '$lte': d} }},
//     {"$group" : {   "_id": { "day": {"$dayOfMonth": "$createdAt"} ,"month":{"$month": "$createdAt"} , "year" : {"$year": "$createdAt"}} ,   "count": {"$sum" : 1}   }   },  
//     {"$project": { 
//                '_id': {'$concat' : [ {$substr: [ "$_id.day", 0, 2 ]},"/",{$substr: [ "$_id.month", 0, 2 ]}]}, //,"$_id.day","-" , "$_id.month","-", "$_id.year"]},
//                'count':1
//     }} 
//     ]
// }