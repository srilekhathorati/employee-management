const mongoose = require('mongoose');
const plm=require("passport-local-mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/employee');


const employeeSchema = new mongoose.Schema({
    employeename: {
      type: String,
      required: true,
      unique: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    phoneno: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
  });
  
  
employeeSchema.plugin(plm);

// Export the model
const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;

