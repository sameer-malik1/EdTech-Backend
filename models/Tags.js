const mongoose = require('mongoose');

const tagsSchema = new mongoose({
    name:{
        type:String,
        required:true,

    },
    description:{
        type:String,

    },
    courses:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    }]

})

module.exports = mongoose.model("Tag",tagsSchema);