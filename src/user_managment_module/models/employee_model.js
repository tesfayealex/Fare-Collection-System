const Employee = require('./employee')
//const Employee = require('./new_employee')
const mongoose = require('mongoose')
//const New_Employee = require('../Models/New_Employee');

module.exports =  mongoose.model('Employee',Employee)