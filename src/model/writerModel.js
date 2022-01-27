const mongoose = require('mongoose')

const writerSchema = new mongoose.Schema({

     title: {type:String,required:true, enum:['Mr', 'Mrs','Miss'],trim:true},
     name: {type:String,required:true,trim:true},
     phone: {
             type:String,
             unique:true,
             required:true,
             trim:true
     },
     email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required:true
     }, 
     password: { type: String,
          trim: true,
          required:true
          },
     address: {
       street: {type:String},
       city: {type:String},
       pincode: {type:String}
     }, 

}, { timestamps: true })

module.exports = mongoose.model('writerDB', writerSchema)