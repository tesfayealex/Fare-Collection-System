
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs')
//const router = require('./src/Routers/Index');
const mongoose = require('mongoose');
const config = require('./src/config/index');
const passport =require('passport');
//var fs = require('fs')
var morgan = require('morgan')
var path = require('path')
var logger = require('./src/config/logger')
//var rfs = require('rotating-file-stream')
//const multer = require('multer');
//const morgan = require('morgan');
//const path = require('path');
// const EOP = require('./src/Routers/Employee_Of_Platform_Provider');
// const EOS = require('./src/Routers/Employee_Of_Service_Provider');
// const BAP = require('./src/Routers/Branch_Admin_Of_Platform_Provider');
// const ASP = require('./src/Routers/Admin_OF_Service_Provider_Router');
// const AAA = require('./src/Routers/Admin_Of_AACTA_Router');
// const SAD = require('./src/Routers/Super_Admin');
const authenticate = require('./src/helpers/authenticator');
const Respond = require('./src/helpers/response')
const Employee = require('./src/routers/employee_router');
const Customer = require('./src/routers/customer_router');
const Employee_Customer = require('./src/routers/employee_customer_router');
const Customer_Credential = require('./src/routers/customer_credential_router');
const Route = require('./src/routers/route_router');
const Organization = require('./src/routers/organization_router');
const Station = require('./src/routers/station_router');
const Ticket = require('./src/routers/ticket_router');
const Transaction = require('./src/routers/transaction_router');
const Fare = require('./src/routers/fare_router');
const Bus = require('./src/routers/bus_router');
const Branch = require('./src/routers/branch_router');
const Machine = require('./src/routers/machine_task_router');
const Employee_Machine = require('./src/routers/machine_router')
const Employee_Ticket_and_Transaction = require('./src/routers/employee_ticket_and_transaction');
const Role = require('./src/routers/role_router');
const User_Sigin = require('./src/routers/user_router');
const Notification = require('./src/routers/notification_router');
const Help = require('./src/routers/help_desk_router')
const customer_help = require('./src/routers/customer_help_desk');

 // mongoose.connect(config.DB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
  mongoose.connect('mongodb+srv://Admin:tesalex@my-cluster.1hinl.gcp.mongodb.net/Fare_collection_system?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(result =>{
      if(result){
      console.log('connected successfully');
                }
}).catch((err)=>
{
   console.log('there is an error db       ' + err);
})

const CheckUserType = (req,res,next)=>{
   // console.log(req.originalUrl)
   //console.log(req);
     const User = req.originalUrl.split('/')[2] ;
     //console.log(User)
     //.log(User)
     require('./src/config/passport')(User , passport);
     next()
}

const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + "/dist"));
app.use(morgan('common', {
     stream: logger.accessLogStream
   }))
app.use(CheckUserType)

// const storage = multer.diskStorage({
//     destination: './public/profile' ,
//     filename:    
//          function(req,file,callback){
//          callback(null,file.filename + '-'+ Date.now() + path.extname(file.originalname));
//     } 
// })

// const upload = multer({
//  storage: storage
// })
//.single('profile');
//app.use(upload.array());
// app.use('/api/Customer',help.authenticate_User,router);
// //app.use('api/Customer', Customer)
// //app.use('/api/Customer')
// app.use('/api/Employee/EOP',EOP);
// //app.use('/EOS',EOS);
// app.use('/api/Employee/BAP',BAP);
// app.use('/api/Employee/ASP',ASP);
// //app.use('/AAA',AAA);
// app.use('/api/Employee/SAD', help.authenticate_User, SAD);
// app.post("/api/User/Employee/login" , async (req,res)=>{
//   try{
//      //  console.log('lllllll')
//        await credentials.login_Employee(req,res);
//             //help.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
//      }catch(err) { Respond.error_Handler(req,res,err);   } 
// }) 
// app.post("/api/User/Customer/login" , async (req,res)=>{
//      try{
//           await wallet.login_Customer(req,res);
//                //help.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
//         }catch(err) { Respond.error_Handler(req,res,err);   } 
//    }) 
// app.post("/api/User/Customer/refresh_Token" , async (req,res)=>{
//      try{
//           await wallet.refresh_access_token(req,res);
//                //help.respond(req,res,{success: false , message: 'Id of the Employee does not exist'})       
//         }catch(err) { Respond.error_Handler(req,res,err);   } 
//    })    
//console.log('1');
app.use('/api/User',User_Sigin)
app.use('/api/Employee/Customer', authenticate.authenticate_User, Employee_Customer)
app.use('/api/Customer/Ticket' , authenticate.authenticate_User , Ticket)
app.use('/api/Customer', authenticate.authenticate_User , Customer )
//app.use('/api/Customer/credential', authenticate.authenticate_User , Customer_Credential )
app.use('/api/Employee/Organization', authenticate.authenticate_User , Organization )
app.use('/api/Employee/Branch', authenticate.authenticate_User , Branch )
app.use('/api/Employee/Bus', authenticate.authenticate_User , Bus )
app.use('/api/Employee/Transaction', authenticate.authenticate_User , Transaction )
//app.use('/api/Employee/Ticket', authenticate.authenticate_User , Ticket )
app.use('/api/Employee/Station', authenticate.authenticate_User , Station )
app.use('/api/Employee/Fare', authenticate.authenticate_User , Fare )
app.use('/api/Employee/Route', authenticate.authenticate_User , Route )
app.use('/api/Employee/Role', authenticate.authenticate_User , Role)
app.use('/api/Employee/User', authenticate.authenticate_User , Employee )
app.use('/api/Employee/Machine' , authenticate.authenticate_User , Employee_Machine )
app.use('/api/Employee/TicketandTransaction', authenticate.authenticate_User , Employee_Ticket_and_Transaction );
app.use('/api/Machine', authenticate.authenticate_User , Machine )
app.use('/api/Employee/Notification', authenticate.authenticate_User , Notification)
app.use('/api/Employee/HelpDesk', authenticate.authenticate_User , Help)
app.use('/api/Customer/HelpDesk', authenticate.authenticate_User , customer_help)
const port = process.env.PORT || 5000;
app.listen(port);//, '0.0.0.0'
// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app).listen(process.env.PORT || 5000, function () {
//  console.log('Started!');
// });






