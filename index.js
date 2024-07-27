const express = require('express');
require('dotenv').config();
const connectDb = require('./config/database');
const app = express();


const PORT = process.env.PORT || 4000;

// middlewares
app.use(express.json());


// connecting with database
connectDb();

// activating the server
app.listen(PORT,()=>{
    console.log(`server is live at port ${PORT}`);
    
}
);



// connectDb().then(()=>{
//     console.log(`server is live at port ${PORT}`);})
//     .catch((err)=>{console.log(err)});


