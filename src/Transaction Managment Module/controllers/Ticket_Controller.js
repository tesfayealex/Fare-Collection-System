const Ticket = require('../Models/Ticket');
const Respond = require('../../helpers/Response');
const Auth = require('../../helpers/authenticator')
const Station = require('../../Organization Module/Controllers/Station_controller')
const Route = require('../../Organization Module/Controllers/Route_controller');
const Fare = require('./Fare_Controller');
const Machine = require('../../Organization Module/Controllers/Machine_controller')
const Wallet = require('../../Wallet Module/Controllers/Wallet_controller');
const crypto = require('crypto'); 
const config = require('../../config/index');
module.exports = {
    async generate_Ticket(entry_Station , exit_Station , route , ticket ='' , date = ''){
        try{
           var uniqueid = '';  
         if(ticket == ''){    
         uniqueid  = await crypto.randomBytes(16).toString('hex'); 
                       }
            else 
               uniqueid = ticket           
         if(date == '')
                   {
                         date = Date.now(); 
                   }
         ticket = uniqueid +"cbfcs"+ date +"cbfcs"+ route +"cbfcs" +entry_Station + "-" + exit_Station;
                           // }
          //   console.log(entry_Station + " "+ exit_Station + " "+ route + " " + ticket)                
          //    console.log(ticket)       
        const key = await crypto.scryptSync(config.CRYPTO_PASSWORD, 'salt', 32);
        const iv = await crypto.randomBytes(16);   
        const cipher = await crypto.createCipheriv(config.CRYPTO_ALGORITHM, key, iv);
        let encrypted_Ticket =await cipher.update(ticket,'utf8','hex');
        encrypted_Ticket += cipher.final('hex');
        encrypted_Ticket += ":" + Buffer.from(iv).toString('hex');
        return {ticket: encrypted_Ticket, ticket_Id: uniqueid};
        }catch(err)   {throw err}
    },
    async buy_Ticket(req,res){
        try{  
        var wallet_transaction; 
        var Ticket_Object = await this.create_Ticket_Object(req);
        var route = await Route.search_For_Route_IV({route_Name: Ticket_Object.route})   
        entry_Station = await Station.search_For_Station_IV({station_Name: Ticket_Object.entry_Station})  
        exit_Station = await Station.search_For_Station_IV({station_Name: Ticket_Object.exit_Station}) 
        if(entry_Station.success && exit_Station.success && exit_Station.message.status == 'Activated' && entry_Station.message.status == 'Activated'){
            if(route.success && route.message.status == 'Activated'){
          const generated_Ticket = await this.generate_Ticket(entry_Station.message.station_Name,exit_Station.message.station_Name, route.message.route_Name)
          Ticket_Object.ticket = generated_Ticket.ticket_Id;
          Ticket_Object.route = route.message._id;
          Ticket_Object.entry_Station = entry_Station.message._id;
          Ticket_Object.exit_Station = exit_Station.message._id; 
          Ticket_Object.issued_Date = Date.now();
          
          var route_Stations = [  Ticket_Object.entry_Station , Ticket_Object.exit_Station] ;
          route.message.route_segments.forEach(element=>{
           if(element.sub_route.includes(route_Stations[0]) && element.sub_route.includes(route_Stations[1]) )
             Ticket_Object.ticket_Length = element.sub_route_length;
          })
          if(!Ticket_Object.ticket_Length)
             Ticket_Object.ticket_Length = route.message.route_length;

          var fare= await Fare.search_For_Fare_IV({status:'Active'}) ; 
          Ticket_Object.ticket_Amount = Ticket_Object.ticket_Length *  fare.message.fare_Amount;
        if(req.user.customer)
           {
            var balance = await  Wallet.check_Balance(req , Ticket_Object.ticket_Length )  
                if(balance.success)
                     {
                      Ticket_Object.customer = req.user.customer;
                      Ticket_Object.ticket_type = 'Mobile';   
                     }
                else if(!balance.success)
                    return await Respond.respond(req,res, balance); 
                else 
                    return await Respond.respond(req,res, {success: false , message:'Customer not found'})          
           }
          else 
             {  
                   Ticket_Object.ticket_type = 'Temporary';
                  if(Ticket_Object.machine) {
                         var customer = await Wallet.search_For_Wallet_IV({customer: Ticket_Object.customer }) 
                         var machine = await Machine.search_For_Machine_Iv({machine_Id: Ticket_Object.machine})
                         if(machine.success && machine.message.machine_Type == 'Ticket') {
                              if(customer.success)
                                   Ticket_Object.machine = machine.message._id;
                              else 
                                  throw new Error('Customer could not be found')      
                                             }
                          else
                              throw new Error('Machine could not be found or is not Ticket machine')      
                  }   
             }
        let ticket = new Ticket(Ticket_Object);  
         var  result = await Ticket.create(ticket)
        if(result) {
              transaction={
                                 customer: ticket.customer,
                                 transaction_Amount: ticket.ticket_Amount,
                                 reason: 'Ticket'
              }
               wallet_transaction =  await Wallet.deduct_Balance(transaction)
               if(wallet_transaction.success)
                         return await Respond.respond(req, res ,{ticket: generated_Ticket.ticket})
             else {
                      await Ticket.findByIdAndRemove(result._id);
                      return await Respond.respond(req, res , {success: false , message: 'Wallet Transaction Error has Occured'})     
                  }       
           }
        else
        return await Respond.respond(req,res, {success: false , message: 'Ticket is not created'})
         } 
         else
           return await Respond.respond(req,res,{success: false , message: 'Route could not be found or is not activated'});
        }else
           return await Respond.respond(req,res,{success: false , message: 'Stations could not be found or are not activated'});      
        
       } catch(err){
         if(result && !wallet_transaction){
              await Ticket.findByIdAndRemove(result._id);
         }
        throw err}            
    },
    async authenticate_Ticket(req){
       try{ 
        var Ticket_Object = await this.create_Ticket_Object(req); 
          //console.log(Ticket_Object)
          const key = await crypto.scryptSync(config.CRYPTO_PASSWORD, 'salt', 32);
          const ticket_code = Ticket_Object.ticket.split(':');
          //console.log(ticket_code)
          const iv = await Buffer.from(ticket_code[1],'hex');
          const decipher = await crypto.createDecipheriv(config.CRYPTO_ALGORITHM, key,iv);
           let decrypted =await  decipher.update(ticket_code[0],'hex','utf8');
         //  console.log(iv)
           decrypted += decipher.final('utf8');
          
           ticket_component = decrypted.split('cbfcs');   
      //   console.log(ticket_component)
       ticket_Station = ticket_component[3].split('-');
        var ticket = await this.search_for_Ticket_IV({ticket: ticket_component[0]})
        if(ticket.success)
         {
        if(ticket.message.entry_Station.station_Name == Ticket_Object.entry_Station && ticket.message.entry_Station.station_Name == ticket_Station[0]){
               if(ticket.message.exit_Station.station_Name == Ticket_Object.exit_Station && ticket.message.exit_Station.station_Name == ticket_Station[1]) {
                    //   if( ticket.message.status == 'New'){
                    //    var new_Date = new Date();
                    //    new_Date.setDate(new_Date.getDate() - 1)
                    //      if(ticket.message.issued_Date > new_Date)      
                            return { success: true , message:{ticket: ticket.message}}  
                    //   else 
                    //          return { success: false , message: ' Ticket has Expired'}       
                    //                      }
                    //    else 
                    //        return {success: false , message: `Ticket has been ${ticket.message.status}`} 
                      }                 
                    else  
                   return {success: false , message: `Ticket unauthenticated - mismatch on exit Station - ${Ticket_Object.exit_Station} `};         
                 }
        else   
             return {success: false , message: `Ticket unauthenticated - mismatch on entry Station - ${Ticket_Object.entry_Station} `};
         } 
         else 
             return {success: false , message: `Ticket unauthenticated - unrecognizaed ticket`};
    }catch(err){ throw err }
},
async find_Ticket(req , res , data , limit = 1 , populate = ''){
  try {
    var ticket;
    if(req.user && req.user.customer)
       ticket = await this.search_for_Ticket_IV( data , limit , populate)
    else 
      ticket = await this.search_for_Ticket_EV(req, data , limit , populate)
           return await Respond.respond(req,res , ticket)      
    }
catch (err) {  throw err}
},
async search_For_Ticket_EV (req, data , limit = 1 , populate = ''){
  try{
      if(await Auth.authenticate_Access({ticket: {viewer: true}},req.user.employee)){
          var result = await this.search_for_Ticket_IV(data , limit, populate)
            return result
              }
          else 
                  return {success: false, message: "attempt to find a ticket with out access"}; 
  }
  catch(err){    throw err   }
},
async search_for_Ticket_IV(data , limit = 1, populate = '' , sort=''){
  try{
    var query_Object = {};  
    if(data.ticket)
         query_Object.ticket = data.ticket;
    if(data.customer)   
         query_Object.customer = data.customer;  
    if(data._id)
         query_Object._id = data._id;
    if(data.machine)
         query_Object.bus = data.machine;
    if(data.ticket_type) 
         query_Object.ticket_type = data.ticket_type;  
    if(data.issued_Date) 
         query_Object.issued_Date = data.issued_Date; 
    if(data.entry_Station)
         query_Object.entry_Station = data.entry_Station;
    if(data.exit_Station) 
         query_Object.exit_Station = data.exit_Station;  
    if(data.status) 
         query_Object.status = data.status;                                       
    if(populate == '')
    populate =[ {path: 'customer' , select: '_id name customer_Id'} , {path: 'entry_Station' , select: '_id station_Id station_Name geometry'},{path: 'machine' , select: '_id machine_Id ip_Address status'},{path: 'exit_Station' , select: '_id station_Id station_Name geometry'},  {path: 'route' , select: '_id route_Id route_Name'}]  
    if(sort == '')
     sort = '-1'
    var result = await Ticket.find(query_Object)  
      .populate(populate)
      .sort(sort)
      .limit(limit)
      if(result.length == 1) {
        result = result.reduce((ticket)=> {return ticket})
        return {success:true, message: result};
      }
else if(result.length > 1 )   
        return {success:true, message: result};
else
        return {success: false , message: 'No Ticket is not found'};                        
}catch(err){throw err}
},
async change_Ticket_Status( data , status){
    try{
      var ticket = await this.search_for_Ticket_IV(data);  
      if(ticket.success){
     var result = await Ticket.findByIdAndUpdate(ticket.message._id,{$set: {status: status}},{new: true, runValidators: true, context:'query'})
       if(result.length !== 0)
         return {success:true};
       else 
         return {success: false , message: 'Ticket could not be found'};     
      }
       else 
              return {success: false, message: 'Ticket is not found'};
       }  catch(err){ throw err }
},
async create_Ticket_Object(req){
  try{
     var ticket = {
      issued_Date: Date.now(),
      ticket_Amount: req.body.ticket_Amount,
      route: req.body.route,
      entry_Station: req.body.entry_Station,
      exit_Station: req.body.exit_Station,
      status: req.body.status || 'New',
      machine: req.user.machine_Id,
      customer: req.body.customer,
      ticket: req.body.ticket
  };
     Object.keys(ticket).forEach(key=> ticket[key] === undefined ? delete ticket[key]: {})        
     return ticket
    }
    catch(err){throw err}         
   }  

}