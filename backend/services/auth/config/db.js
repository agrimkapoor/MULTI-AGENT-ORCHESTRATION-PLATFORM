// this file  auth service ko mongodb se connect karne ka function hai 
// hamara auth service ka express server and mongodb automatically connected nhi hota 
// isko call ham auth ke index.js mei karenge
import mongoose from "mongoose"

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);// mongoose.connect fn 
        console.log("DB connected");
    }
    catch(error){
        console.log("DB error " ,error);
    }
}

export default connectDB
