// this file defines how user data is stored in MongoDB using Mongoose

import mongoose from "mongoose"

//mongoose.schema() takes 2 objects as arguement
// the first arguement is the object where each key is a field name and its value is the field's configuration
// the second arguement is the object which has timestamps key which automatically adds createdAt and updatedAt fields
const userSchema = new mongoose.Schema({
   firebaseUid:{ // it is the unique userID provided by firebase authentication
       type : String,
       unique : true
   },
   name : String,
   email : String,
   avatar : String, // URL of the user's profile picture
   provider : String,
   plan : { // user ke paas kaunsa plan hai  by default its free
       type : String,
       default : "free"
   },
   credits:{  //kitne credits user ke paas bache hai
     type : Number,
     default : 100
   },
   totalCredits : { // total kitne credits : by default its 100 for a free user
       type : Number,
       default : 100
   },
   planExpiresAt : Date
},{timestamps:true});

const User = mongoose.model("User",userSchema);
export default User
