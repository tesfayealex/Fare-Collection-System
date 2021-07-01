
const fs = require('fs');
const help = require('../../helpers/index');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Employee = require('../../User Managment Module/Models/Employee');

module.exports = {
    async dispatch_bus(req,res){
      try{  
       if(help.authenticate_Access({bus:{proccess: true}},req.user.employee)){
           Bus.findbyId({_id: req.body.bus})
                 .then(bus=>{
                              if(bus) {
                              Route.exists({_id: req.body.route})
                                 .then(route=>{
                                         if(route){
                                         Employee.findOne({_id: req.body.driver})
                                             .then(driver=>{
                                                if(driver){
                                                    employee = Employee.findOne({_id: req.user.employee})
                                                    if(bus.organization == employee.organization && driver.organization == employee.organization){
                                                  var data = { 'bus_id': req.body.route , 'route_Id': req.body.route , 'starting_date': req.body.starting_Date , 'ending_date': req.body.ending_Date , 'issued_by': req.user.employee , 'purpose': req.body.purpose , 'driver_Id': req.body.driver }
                                                  fs.appendFile(`../../../public/Bus/${req.body.bus}`, data , 'utf8' , (err)=>{ if(err) throw err}) 
                                                  this.respond(req,res,{status: true , message: 'Bus successfully been dispatched'});
                                                               }
                                                    else{           
                                                           this.respond(req,res,{status: true , message: 'unautherized access of organization juristiction'});
                                                           }
                                                        }     
                                                   else {
                                                            this.respond(req,res,{status: false , message: 'Requested driver is not found'});
                                                        }            
                                                     })
                                             .catch(err=>{throw err});   
                                                    }
                                        else {
                                               this.respond(req,res,{status: false , message: 'Requested route is not found'});
                                            }                            
                                  }) 
                                  .catch(err=>{throw err})
                                           }
                              else {
                                  this.respond(req,res,{status: false , message: 'Requested bus is not found'});
                              }             
                 })
                 .catch(err=>{throw err})
          } 
     else {
            this.respond(req,res,{status: false , message: "attempt to dispatch a bus with out access"});
         }       
    }
    catch(err){throw err};
   },
  
}