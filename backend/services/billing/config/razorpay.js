// this file is razorpay gateway initialisation
//It sets up the Razorpay SDK using API keys from environment variables, allowing your backend to create orders, verify payments, and handle transactions.
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
