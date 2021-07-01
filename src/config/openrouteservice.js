var request = require('request');
const config = require('./index')
const openrouteservice = require('openrouteservice-js'); 
module.exports ={
 get_Route(req,callback){
    request({
        method: 'POST',
        url: 'https://api.openrouteservice.org/v2/directions/driving-hgv/geojson',
        body: `{"coordinates":${JSON.stringify(req.body.stations)}}`,
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Authorization': config.APP_OPENROUTESERVICE_API_KEY,
          'Content-Type': 'application/json; charset=utf-8'
        }}, function (error, response, body) {
         // console.log('kkkkkkkkk') 
          if(error)
              return callback(error);
            if(body)
            {
             
              // console.log(body) 
                return callback(null,body);
            }
      })
    },
   get_geocode(req, callback){
     var text = req.query.address;
     text = text.replace(' ', '%20');  
    request({
        method: 'GET',
        url: `https://api.openrouteservice.org/geocode/search?api_key=${config.APP_OPENROUTESERVICE_API_KEY}&text=${text}&sources=openstreetmap&layers=venue&size=10&boundary.country=ET`,
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }}, function (error, response, body) {
            if(error)
            return callback(err);
          if(body)
          return callback(null,body);
   })
      },
    get_geocode_locationiq(req, callback){
        var text = req.query.address;
        text = text.replace(' ', '%20');  
       request({
           method: 'GET',
           url: `https://us1.locationiq.com/v1/search.php?key=${config.APP_GEOCODER_API}&q=${text}&countrycodes=et&format=json`,
         //  url: `https://api.openrouteservice.org/geocode/search?api_key=${config.APP_OPENROUTESERVICE_API_KEY}&text=${text}&sources=openstreetmap&layers=venue&size=10&boundary.country=ET`,
           headers: {
             'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
           }}, function (error, response, body) {
               if(error)
               return callback(err);
             if(body)
             return callback(null,body);
      })
         },
    get_route_extension(req,callback){
        var route = new openrouteservice.Directions({
            api_key:  process.env.APP_OPENROUTESERVICE_API_KEY
        })  
         route.calculate({
         coordinates: req.body.stations,
         profile: 'driving-hgv',
         format: 'geojson'
       })
       .then(json=> {
             callback(null,json);
       })
       .catch(err=>{ 
            console.log(err)    
            callback(err);
       }); 
    },
    get_geocoding_extension(req,callback){
        var code =  new openrouteservice.Geocode({
            api_key: process.env.APP_OPENROUTESERVICE_API_KEY
          });  
          var texts = req.query.address;
         // console.log(config.APP_OPENROUTESERVICE_API_KEY)
          code.geocode({
            text: texts,
            //boundary_circle: { lat_lng: [49.412388, 8.681247], radius: 50 },
           // boundary_bbox: [[49.260929, 8.40063], [49.504102, 8.941707]],
            boundary_country: ["ET"]
          })
          .then(json=> {
            console.log('aaaa')
            callback(null,json);
                       })
          .catch(err=>{   
              console.log(err)   
              callback(err);
                       }); 
    }  
  }