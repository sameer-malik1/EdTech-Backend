const mongoose = require('mongoose');

const userProfile = new mongoose.Schema({
    gender:{
        type:String,
        
    },
    dateOfBirth:{
        type:String,
    },
    about:{
        type:String,
        trim:true
    },
    contact:{
        type:Number,
        trim:true
    }
})

module.exports = mongoose.model("Profile",userProfile);