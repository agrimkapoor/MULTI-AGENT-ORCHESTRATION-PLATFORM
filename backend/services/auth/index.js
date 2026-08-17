import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import router from "./routes/auth.routes.js"

dotenv.config()

const port = process.env.PORT;

const app = express();

app.use(express.json());// incoming req ke JSON body ko parse karke req.body mei available karwata hai
// iske bona POST req se json data samjh nahi aayega
// req.body mei undefined nhi hoga phir

app.get("/",(req,res)=>{
    res.status(200).json({
        service : "auth",
        status : "ok"
    });
})

app.use("/",router) // all the routed defined inside auth.router.js will be prefixed with /

/*
    For example, if auth.routes.js defines POST /register, the final endpoint will be POST /register.
    If we had used app.use("/api/auth", router), it would be POST /api/auth/register.
*/

app.listen(port,()=>{
    connectDB();
    console.log(`auth started at  ${port}`);
})
