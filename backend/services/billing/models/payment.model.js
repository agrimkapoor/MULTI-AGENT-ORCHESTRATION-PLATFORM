import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
    userId : { // every payment is associated with a user
        type : String,
        required : true
    },
    orderId: { //This is the unique identifier returned by Razorpay when creating an order
        type: String,
        required: true,
    },
    paymentId: String,//The Razorpay payment ID . This is provided after a successful payment. It is optional at creation time because it only exists after payment is completed.
    amount: Number,
    currency: {
        type: String,
        default: "INR",
    },
    credits: Number,
    plan: String,
    status: {
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created",
    }
},{timestamps : true})
