const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({

    title:{ type:String, required:true, unique:true,trim:true},

    excerpt:{ type:String, required:true,trim:true},

    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'writerDB',required:true},

    ISBN:{ type:String, required:true,unique:true,trim:true},

    category:{ type:String, required:true,lowercase: true,trim:true},

    subCategory:{ type:String, required:true,lowercase: true,trim:true},

    reviews:{ type:Number, default:0},

    deletedAt:{ type: Date, default: null},

    isDeleted:{ type:Boolean, default:false},

    releasedAt:{ type:String, default:null,required:true},

}, { timestamps: true })

module.exports = mongoose.model('bookDB', bookSchema)