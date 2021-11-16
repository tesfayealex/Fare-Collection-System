const Employee = require('./Employee')
//const mongoose = require('mongoose')


const New_Employee= {
    age: {
        type: Number,
        required: true,
        trim: true, 
 },
 gender: {
        type: String,
        trim: true,
        enum: ['male' , 'Female']
 },

}
 

Employee.add(New_Employee)

// const new_schema = new mongoose.Schema(Employee, {
//     age: {
//         type: Number,
//         required: true,
//         trim: true, 
//  },
//  gender: {
//         type: String,
//         trim: true,
//         enum: ['male' , 'Female']
//  },
// } )
 //console.log(Employee)
module.exports = Employee
//mongoose.model('Employee',Employee);

