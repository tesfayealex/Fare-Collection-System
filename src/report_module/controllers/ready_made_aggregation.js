module.exports = {
    async calculate_dates( first_Date , last_Date , output){
        if(last_Date == '' || last_Date == undefined)
          { 
              last_Date = new Date();
          }
 else 
        last_Date = new Date(last_Date);     
 if(first_Date == '' || first_Date == undefined)
       {
           if(output.type == 'date')
                   first_Date = new Date(last_Date - 15*1000 * 3600 * 24)
           else 
                  {
                     first_Date =   new Date(last_Date - 12*30*1000 * 3600 * 24)      
                   }
         }
 else
       first_Date = new Date(first_Date);  
        return {last_Date,first_Date}
    },
    async number_of_transaction(first_Date = '' , last_Date = '' , output = ''){
      
      var date = await this.calculate_dates(first_Date , last_Date ,output)           
      var query =   {
            "match" : {
                  "type": "match",
                  "data": {
                             "type": "date_difference",
                             "first_Date" : date.first_Date,
                             "last_Date" : date.last_Date
                          }
                        },
               "group":{
                   "type":"group",
                   "data":{
                       "type": output.type,
                       "count":{
                        "type": "sum"
                    } 
                          }
                         
               }   , 
               "project":{
                   "type":"project",
                   "data": {
                       "type": output.type
                   }
               }   ,  
               "output":{
                  "type": output.type,
                  "first_Date" : date.first_Date,
                 "last_Date" : date.last_Date
               }         
         }
         return query;
    },
    async transaction_per_route(first_Date = '' , last_Date = '' , output = 'date'){
        var date = await this.calculate_dates(first_Date , last_Date ,output)   
        var query = {
                "match" : {
                      "type": "match",
                      "data": {
                                 "type": "date_difference",
                                 "first_Date" : date.first_Date,
                                 "last_Date" : date.last_Date
                              }
                            },
                   "lookup":{
                       "type": "lookup",
                       "data": {
                            "type":"route"
                         }  
                             },         
                   "group":{
                       "type":"group",
                       "data":{
                           "type": "route",
                           "count":{
                            "type": "sum"
                        } 
                              }         
                   }   , 
                   "output":{
                      "type":"other"
                   }         
             }
             return query;
        },
       async transaction_per_organization(first_Date = '' , last_Date = '' , output = 'date'){
        var date = await this.calculate_dates(first_Date , last_Date ,output)   
           var query={
            "match" : {
                  "type": "match",
                  "data": {
                             "type": "date_difference",
                             "first_Date" : date.first_Date,
                             "last_Date" : date.last_Date
                          }
                        },
               "lookup":{
                   "type": "lookup",
                   "data": {
                        "type":"bus"
                     }  
                         },    
                "lookup2":{
                   "type": "lookup",
                   "data": {
                        "type":"organization",
                        "localField": "Bus.organization"
                     }  
                         },               
               "group":{
                   "type":"group",
                   "data":{
                       "type": "organization",
                       "count":{
                        "type": "sum"
                    } 
                          }         
               }   , 
               "output":{
                  "type":"other"
               }         
         }
           return query;
       },
      async transaction_per_payment_type(first_Date = '' , last_Date = '' , output = 'date'){
        var date = await this.calculate_dates(first_Date , last_Date ,output)   
          var query={
            "match" : {
                  "type": "match",
                  "data": {
                             "type": "date_difference",
                             "first_Date" : date.first_Date,
                             "last_Date" : date.last_Date
                          }
                        },
               "lookup":{
                   "type": "lookup",
                   "data": {
                        "type":"ticket"
                     }  
                         },    
                "addfields":{
                   "type": "addFields",
                   "data":{
                    "type": "ticket_type"
                       } 

                         },               
               "group":{
                   "type":"group",
                   "data":{
                       "type": "ticket_type",
                       "count":{
                        "type": "sum"
                    } 
                          }         
               }   , 
               "output":{
                  "type":"other"
               }         
         }

          return query
      }  ,
      async transaction_per_transaction_amount(first_Date = '' , last_Date = '' , output = 'date'){
        var date = await this.calculate_dates(first_Date , last_Date , output)   
          var query = {
            "match" : {
                  "type": "match",
                  "data": {
                             "type": "date_difference",
                             "first_Date" : date.first_Date,
                             "last_Date" : date.last_Date
                          }
                        },                
               "group":{
                   "type":"group",
                   "data":{
                       "type": output.type,
                       "count":{
                        "type": "amount"
                    } 
                          }         
               }   , 
               "project":{
                   "type": "project",
                   "data": {
                          "type": output.type
                   }
                         },  
               "output":{
                  "type": output.type,
                  "first_Date" : date.first_Date,
                  "last_Date" : date.last_Date 
               }         
         }
           return query;
        },
        async transaction_By_Entry_station(first_Date = '' , last_Date = '' , output = 'date'){
            var date = await this.calculate_dates(first_Date , last_Date ,output)   
             var query = {
                "match" : {
                      "type": "match",
                      "data": {
                                 "type": "date_difference",
                                 "first_Date" : date.first_Date,
                                "last_Date" : date.last_Date
                              }
                            }, 
                   "lookup":{
                       "type": "lookup",
                       "data": {
                              "type": "entry_Station"
                       }
                             },                                
                   "group":{
                       "type":"group",
                       "data":{
                           "type": "entry_Station",
                           "count":{
                            "type": "sum"
                        } 
                              }         
                   }   , 
                  
                   "output":{
                      "type":"other"
                    
                   }         
             }
             return query;
        },
        async transaction_By_Exit_Station(first_Date = '' , last_Date = '' , output = 'date'){
            var date = await this.calculate_dates(first_Date , last_Date ,output)   
            var query = {
                "match" : {
                      "type": "match",
                      "data": {
                                 "type": "date_difference",
                                 "first_Date" : date.first_Date,
                                 "last_Date" : date.last_Date
                              }
                            }, 
                   "lookup":{
                       "type": "lookup",
                       "data": {
                              "type": "exit_Station"
                       }
                             },                                
                   "group":{
                       "type":"group",
                       "data":{
                           "type": "exit_Station",
                           "count":{
                            "type": "sum"
                        } 
                              }         
                   }   , 
                  
                   "output":{
                      "type":"other"
                    
                   }         
             }
            return query
        },
        async  Employee_Number_By_Organization(){
            var query = {
                // "match" : {
                //       "type": "match",
                //       "data": {
                //                  "type": "date_difference",
                //                  "first_Date" : "2020-01-01T00:00:00.000+00:00",
                //                  "last_Date" : "2020-12-21T00:00:00.000+00:00"
                //               }
                //             }, 
                   "lookup":{
                       "type": "lookup",
                       "data": {
                              "type": "organization",
                              "localField": "organization"
                       }
                             },                                
                   "group":{
                       "type":"group",
                       "data":{
                           "type": "organization",
                           "count":{
                            "type": "sum"
                        } 
                              }         
                   }   , 
                  
                   "output":{
                      "type":"other"
                   }         
             }
             return query;
        } ,
        async customer_registration_By_Month(first_Date = '' , last_Date = '' , output = 'date'){
            var date = await this.calculate_dates(first_Date , last_Date ,output)   
            var query = {
                "match" : {
                      "type": "match",
                      "data": {
                                 "type": "date_difference",
                                 "first_Date" : date.first_Date,
                                 "last_Date" : date.last_Date
                              }
                            }, 
                                               
                   "group":{
                       "type":"group",
                       "data":{
                           "type": output.type,
                           "count":{
                            "type": "sum"
                        } 
                              }         
                   }   , 
                    "project":{
                       "type": "project",
                       "data": {
                              "type": output.type
                       }
                             },   
                  
                   "output":{
                      "type": output.type,
                      "first_Date" : date.first_Date,
                      "last_Date" : date.last_Date
                   }         
             }
            return query
        },
         async Customer_by_user_access_type(){
             var query = {
                "lookup" : {
                      "type": "lookup",
                      "data": {
                                 "type": "wallet"
                              }
                            }, 
                                               
                   "addFields":{
                       "type":"addFields",
                       "data":{
                           "type": "user_access_type"
                              }         
                   }   , 
                    "group":{
                       "type": "group",
                       "data": {
                              "type": "user_access_type",
                              "count":{
                                  "type": "sum"
                              }
                       }
                             },   
                  
                   "output":{
                      "type":"other"
                   }         
             }
             return query;
         },
         async customer_By_customer_Type(){
           var query =  {
                "lookup" : {
                      "type": "lookup",
                      "data": {
                                 "type": "wallet"
                              }
                            }, 
                                               
                    "group":{
                       "type": "group",
                       "data": {
                              "type": "customer_type",
                              "count":{
                                  "type": "sum"
                              }
                       }
                             },   
                  
                   "output":{
                      "type":"other"
                   }         
             }
             return query
         },
         async customer_By_Gender(){
                 var query = {                  
                    "group":{
                       "type": "group",
                       "data": {
                              "type": "gender",
                              "count":{
                                  "type": "sum"
                              }
                       }
                             },   
                  
                   "output":{
                      "type":"other"
                   }         
             }

                 return query
         },
         async customer_By_Age_Range(){
                var query = {
                    "project" : {
                          "type": "project",
                          "data": {
                                     "type": "age_range"
                                  }
                                }, 
                                                   
                        "group":{
                           "type": "group",
                           "data": {
                                  "type": "range",
                                  "count":{
                                      "type": "sum"
                                  }
                           }
                                 },   
                      
                       "output":{
                          "type":"range",
                          "range": ["0 - 18","18 - 24","25 - 30","31 - 40","41 - 50","50 +"]
                       }         
                 }

                return query
         },
          async Machine_By_Machine_Type (){
                  var query = {                  
                    "group":{
                       "type": "group",
                       "data": {
                              "type": "machine_type",
                              "count":{
                                  "type": "sum"
                              }
                       }
                             },   
                  
                   "output":{
                      "type":"other"
                   }         
             }

                  return query
          },
          async Bus_By_Service_Provider(){
            var query = {                  
                "lookup":{
                   "type": "lookup",
                   "data": {
                          "type": "organization",
                          "localField": "organization"
                   }
                         },   
              "group":{
                   "type": "group",
                   "data": {
                          "type": "organization",
                          "count":{
                              "type": "sum"
                          }
                   }
                         }, 
               "output":{
                  "type":"other"
               }         
         }

            return query
          }
    }
    