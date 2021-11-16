

const Route = require('../models/Route');
const Station = require('../controllers/station_controller');
const Respond = require('../../helpers/response');
const Auth = require('../../helpers/authenticator');
const ors = require('../../config/openrouteservice');
const utility = require('../../helpers/utility')
const logger = require('../../config/logger');
const config = require('../../config')
const fs = require('fs')
module.exports = {
    async register_Route (req,res){
        try{
      if(Auth.authenticate_Access({route: {creator: true}},req.user.employee)){
           var route_Object = await this.create_Route_Object(req)       
              // var stations = await Station.search_For_Station_IV({_id:{$in: route_Object.stations}},route_Object.stations.length)
              //     if(Object.keys(stations.message).length === route_Object.stations.length){
              //       var length_Object = this.find_Length_And_Segment('public' + route_Object.route_File);
              //       var segment = []; 
              //        route_Object.route_length = length_Object.route_length; 
                     
              //        for(i=0; i<length_Object.subroute_length.length;i++){
                      
              //         var sub_route_i = {
              //           sub_route:[ route_Object.stations[i],route_Object.stations[i+1]],
              //           sub_route_length: length_Object.subroute_length[i] 
              //                          }
              //            segment.push(sub_route_i);               
              //        }
              //          route_Object.route_segments = segment;
                    var route = new Route(route_Object);
                   var result = await  Route.create(route)
                       if(result) 
                          return await Respond.respond(req, res,{success: true , message: `Route Id - ${result.route_Id} - registered`});
                       else 
                          return await Respond.respond(req, res,{success: false , message: `Route is not registered`}); 
                  //          }
                  //  else
                  //       return await Respond.respond(req, res,{success: false , message: `Stations are not found`})        
        }
        else
               return await Respond.respond(req , res,{success: false , message: "attempt to register a station with out access"});   
       }
    catch(err){
      var created_Route = await Route.find(route_Object); 
           if(created_Route.length == 0 && req.file)
                  await utility.delete_file(req.file.path)
          
          throw err } 
    },
      async find_Route(req, res , limit = 1){
        try {
                var route = await this.search_For_Route_IV(req.query , limit)
               
                    return await Respond.respond(req,res , route)       
        } 
        catch (err) {  throw err}
      },
      async search_For_Route_EV(req , data , limit = 1 ){
          try {
            if(await Auth.authenticate_Access({route: {viewer: true}},req.user.employee)) {
                              var result = await this.search_For_Route_IV( data , limit )
                                           return result
                                      }
                  else
                        return {success: false, message: "attempt to find a route with out access"}; 
          } catch (err) {throw err }
      },
      async search_For_Route_IV(data, limit = 1 , populate = ''){
        try{
        //  console.log(typeof(limit))
          var query_Object = {};  
          if(data.route_Id)
               query_Object.route_Id = data.route_Id;
          if(data.status)
               query_Object.status = data.status;     
          if(data.route_Name){
           query_Object.route_Name = {
                      $regex : new RegExp(data.route_Name,'ig')
                                      }  
                             }
          if(data._id)
               query_Object._id = data._id                        
          if(data.stations)
               query_Object.stations = {$all: data.stations}
           if(populate == '')
             populate = {path: 'stations' , select: '-createdAt -updatedAt -__v'}
          // var x = 2 
          //      console.log(typeof(limit))
       var result = await Route.find(query_Object).limit(limit).populate(populate)
            
            // for(i=0;i<result.length;i++)
            //  {
            //      for(j=0;j<result[i].stations;j++) 
            //         {
            //           result[i].stations[j] =  (await Station.search_For_Station_IV({_id: result[i].stations[j]})).message
            //         }
            //  }
           //  console.log(result);   
            if(result.length == 1) {
              result = result.reduce((station)=> {return station})
              return {success:true, message: result};
            }
        else if(result.length > 1 )   
              return {success:true, message: result};
        else
              return {success: false , message:'Station is not found'};                       
      }catch(err){throw err}
      },
      async update_Route (req,res){
        try{
            var route = await this.search_For_Route_EV(req,req.query)   
            if(route.success){
            if(await Auth.authenticate_Access({route:{editor: true}},req.user.employee)){
            var route_Object = await this.create_Route_Object(req);
            if(route_Object.route_Id )  delete route_Object.route_Id;     
            var result = await Route.findByIdAndUpdate(route.message._id,{$set: route_Object},{new:true,runValidators:true,context:'query'})
             if(result)  
                    return await Respond.respond(req , res , {success: true, message: `Route Id - ${route.message.route_Id} have been updated`});
             else
                    return await Respond.respond(req , res , {success: false, message: `Route is not found`}); 
                 }
                 else
                       return await Respond.respond(req, res , {success: false, message: "attempt to update route with out access"});
                    }
                    else
                        return await Respond.respond(req , res , {success: false , message: ' Route is not found'});   
        }catch(err){  throw err }
    },
    // async delete_Route (req,res){
    //     try{ 
    //         var route = await this.search_For_Route_EV(req) //.catch(err=>{throw err });
    //         if(route && route.success) {        
    //            if(await Auth.authenticate_Access({route:{remove: true}},req.user.employee)){     
    //         var result = await Route.findByIdAndDelete(route.message._id)
    //         //.then(result=>{
    //             if(result)  
    //                    return await Respond.respond(req , res , {success: true, message: `Route Id - ${route.message.route_Id} have been deleted`});
    //                 else 
    //                    return await Respond.respond(req , res , {success: false, message: `Route is not found on database`});
    //             // })
    //             // .catch(err=>{throw err});
    //              }  
    //             else
    //                   return await Respond.respond(req, res , {success: false , message: "attempt to delete a route with out access"});
    //         }
    //         else
    //                   return await Respond.respond(req , res , {success: false , message: 'Route is not found'});
    //     }catch(err){ throw err  }
    // },
    
    async create_route_file(req,res){
        // ors.get_geocoding_extension(req,(error,result)=>{
        //   if(error){
        //     this.respond(req,res,{success: false , message: 'Geocoder error has occured'});
        //           }
        //   if(result){
        //     this.respond(req,res,{success: true , message: result});
        //   }
        //        })
      //  console.log('oooooo')

    //   var r = result.features.reduce(elm => {return elm})
    //   console.log(r.properties.summary) 
    //  // var segment = r.properties.segments.reduce(elm => {return elm})
    //   r.properties.segments.forEach(e=>{
    //        console.log(e.distance);
    //   })
      
    //  return;
      ors.get_Route(req,(error,result)=>{
                if(error){
                  Respond.respond(req,res,{success: false , message: 'Route generation error has occured'});
                }
                if(result){
                  const file = `${config.FILE_DIRECTORY}/public/Route_generation/new_route.geojson`
                    fs.writeFileSync(file , result)
                   res.download(file , (err)=>{
                    if (err) {
                       new Error('route file could not be created')
                       Respond.respond(req,res,{success: false , message: 'Route generation error has occured'}); 
                    }
                    fs.unlinkSync(file)
                     }) 
                        }
                    })      
      // ors.get_Route(req,function(error,result){
      //   if(error){
      //     this.respond(req,res,{success: false , message: 'Route generation error has occured'});
      //   }
      //   if(result){  
      //     result = JSON.parse(result);
      //     this.respond(req,res,{success: true , message: result});
      //             }
      //           }) 
      // ors.get_geocode(req,function(error,result){
      //   if(error){
      //     this.respond(req,res,{success: false , message: 'Geocoder error has occured'});
      //   }
      //   if(result){
      //     this.respond(req,res,{success: true , message: result});
      //   }
      //  })
    },  
     find_Length_And_Segment(route_file){
      var subroute_length=[];
      var file = `${config.FILE_DIRECTORY}/${route_file}`
      const data = fs.readFileSync(file, 'utf8');
      var route_Object = JSON.parse(data);
      var features = route_Object.features.reduce(elm=>{return elm});
      features.properties.segments.forEach(element=>{
            subroute_length.push(element.distance/1000)
      });
      var route_length = features.properties.summary.distance/1000;
       return {route_length , subroute_length};
    },
    async activate_Route(req,res){
      try{
          var route = await this.search_For_Route_IV({_id: req.query._id})  //.catch(err=>{throw err});
           if(route.success){
                 if(await Auth.authenticate_Access({route: {creator: true}},req.user.employee)){
          let route_Object = {
              status: 'Activated'
          }
         var result = await Route.findByIdAndUpdate(route.message._id,{$set: route_Object},{new: true, runValidators: true, context:'query'})
           if(result.length !== 0)
             return await Respond.respond(req , res , {success:true, message: `Route - ${route.message.route_Name} is Activated`});
           else 
             return await Respond.respond(req , res , {success: false, message: 'Route could not  be found'});     
                              }
                else
                    return await Respond.respond(req, res , {success: false , message: "attempt to activate a route with out access"});
          }
           else 
                  return await Respond.respond(req, res , {success: false, message: 'Route is not found'});
           }  catch(err){ throw err }
                 },
    async deactivate_Route(req,res){
       try{
        var route = await this.search_For_Route_IV({_id: req.query._id})
        if(route.success){
          if(await Auth.authenticate_Access({route: {creator: true}},req.user.employee)){
   let route_Object = {
       status: 'Deactivated'
   }
         var result = await Route.findByIdAndUpdate(route.message._id,{$set: route_Object},{new: true, runValidators: true, context:'query'})
           if(result.length !== 0)
             return await Respond.respond(req , res , {success: true, message: `Route - ${route.message.route_Name} is Deactivated`});
           else 
             return await Respond.respond(req , res , {success: false, message: 'Route could not  be found'});     
                              }
                else
                    return await Respond.respond(req, res , {success: false , message: "attempt to deactivate a route with out access"});
          }
           else
                  return await Respond.respond(req, res , {success: false, message: 'Route is not found'});
          }  catch(err){ throw err }
    },
    async create_Route_Object(req){
      try{
        var route = {
           route_Id: req.body.route_Id,
           route_Name: req.body.route_Name,
           status: req.body.status
                    }
       if(req.body.stations) 
            route.stations = req.body.stations.split(',') 
       if(req.file) 
          {
             route.route_File = '/uploads/Route_File/' + req.file.filename 
             var stations = await Station.search_For_Station_IV({_id:{$in: route_Object.stations}},route_Object.stations.length)
             if(Object.keys(stations.message).length === route_Object.stations.length){
               var length_Object = this.find_Length_And_Segment('public' + route_Object.route_File);
               var segment = []; 
                route_Object.route_length = length_Object.route_length; 
                
                for(i=0; i<length_Object.subroute_length.length;i++){
                 
                 var sub_route_i = {
                   sub_route:[ route_Object.stations[i],route_Object.stations[i+1]],
                   sub_route_length: length_Object.subroute_length[i] 
                                  }
                    segment.push(sub_route_i);               
                }
                  route_Object.route_segments = segment;
              }
              else 
                 throw new Error('station could not be found')
            }

         
       Object.keys(route).forEach(key=>route[key] === undefined ? delete route[key]: {})        
       return route
      }
      catch(err){throw err} 
    }, 
}
