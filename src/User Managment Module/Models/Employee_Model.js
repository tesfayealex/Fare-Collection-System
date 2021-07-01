//const Employee = require('./Employee')
const Employee = require('./New_Employee')
const mongoose = require('mongoose')
//const New_Employee = require('../Models/New_Employee');

module.exports =  mongoose.model('Employee',Employee)