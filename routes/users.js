const mongoose = require('mongoose');
const plm=require("passport-local-mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/employee');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Email validation
  },
  password: {
    type: String,
    
    minlength: [6, 'Password should be at least 6 characters long'],
  },
  employeelst:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Employee',
  }]
  
});


userSchema.plugin(plm);

module.exports= mongoose.model('User', userSchema);


