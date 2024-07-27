const {connect} = require('mongoose');

const connectDb = async ()=>{
    try{
        await connect(process.env.DATABASE_URL);
        console.log("Database connected successfully");

    }
    catch(error){
        console.log(error);
        console.log("Issue with connecting Database")
    }
}

module.exports = connectDb;