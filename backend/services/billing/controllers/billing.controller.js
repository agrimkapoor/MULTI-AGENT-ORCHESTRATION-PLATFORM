import crypto from "crypto";
import axios from "axios";

import razorpay from "../config/razorpay.js";
import { PLANS } from "../config/plans.js";
import Payment from "../models/payment.model.js";

// CREATE ORDER CONTROLLER
export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.headers["x-user-id"];

    const selectedPlan = PLANS[plan];

    // Validate plan
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({//Razorpay API ko call karke ek order create ho raha hai
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save payment details in database
    await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: "created",
    });

    return res.json({
      success: true,
      order,
      plan: selectedPlan,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// verify the authenticity of razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Generate signature using Razorpay secret
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // Verify payment signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Find payment in database
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Update payment status
    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;

    await payment.save();

    // Update user's plan and credits in Auth Service
    await axios.patch(
      `${process.env.AUTH_SERVICE}/internal/update-plan`,
      {
        userId: payment.userId,
        plan: payment.plan,
        credits: payment.credits,
      }
    );

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* WORKFLOW

    1. User plan select karta hai

    Frontend par user maan lo Starter plan (₹199) select karta hai.
    
    Frontend backend ko request bhejta hai:
    
    POST /create-order
    
    {
      "plan": "starter"
    }
    
    Backend ko user ki identity header se milti hai:
    
    x-user-id: 12345
    
    
    2. createOrder controller chalta hai
    
    Sabse pehle:
    
    const { plan } = req.body;
    const userId = req.headers["x-user-id"];
    
    Ab:
    
    plan   = "starter"
    userId = "12345"
    
    
    3. Plan check hota hai
    
    Tumhare PLANS object mein:
    
    starter: {
      id: "starter",
      name: "Starter",
      amount: 199,
      credits: 500,
      validity: 30
    }
    
    To:
    
    const selectedPlan = PLANS[plan];
    
    gives:
    
    selectedPlan
         ↓
    {
      id: "starter",
      amount: 199,
      credits: 500,
      validity: 30
    }
    
    Agar user "something" bhej de jo PLANS mein nahi hai:
    
    if (!selectedPlan)
    
    to:
    
    400 Invalid plan
    
    
    4. Razorpay order create hota hai
    
    Ab important part:
    
    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    
    Razorpay amount paise mein leta hai.
    
    So:
    
    ₹199 × 100
         ↓
    19900 paise
    
    Razorpay ek order.id generate karega:
    
    order_id
    ↓
    order_xyz123
    
    Important:
    
    Order create hona payment successful hona nahi hai.
    
    Abhi user ne payment nahi kiya. Sirf Razorpay ko payment order banaya gaya hai.
    
    
    5. Payment MongoDB mein save hoti hai
    
    Uske baad:
    
    await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: "created",
    });
    
    Database mein roughly:
    
    Payment
    
    {
      userId: "12345",
      orderId: "order_xyz123",
      amount: 199,
      credits: 500,
      plan: "starter",
      currency: "INR",
      status: "created"
    }
    
    status: "created" ka matlab:
    
    Order create ho gaya hai, but payment abhi successful nahi hui.
    
    
    6. Backend frontend ko order bhejta hai
    
    return res.json({
      success: true,
      order,
      plan: selectedPlan,
    });
    
    Frontend ko Razorpay order details milti hain.
    
    Frontend ab Razorpay Checkout open karta hai.
    
    Flow:
    
    Backend
       ↓
    Razorpay Order
       ↓
    Frontend
       ↓
    Razorpay Checkout
       ↓
    User pays ₹199
    
    
    7. User Razorpay par payment karta hai
    
    User payment complete karta hai.
    
    Successful payment ke baad Razorpay frontend ko kuch important values deta hai:
    
    razorpay_order_id
    razorpay_payment_id
    razorpay_signature
    
    Example:
    
    razorpay_order_id
    = order_xyz123
    
    razorpay_payment_id
    = pay_abc456
    
    razorpay_signature
    = some_hash_value
    
    Frontend ye values tumhare backend ko bhejta hai.
    
    
    8. Backend payment verify karta hai
    
    Ab verifyPayment controller chalta hai:
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    
    Ab backend ke paas:
    
    Order ID
    Payment ID
    Signature
    
    
    9. Signature generate hoti hai
    
    Ye sabse important security step hai:
    
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");
    
    Conceptually:
    
    Order ID
       +
    Payment ID
       +
    Razorpay Secret
       ↓
    HMAC SHA256
       ↓
    Generated Signature
    
    Ab backend compare karta hai:
    
    if (generatedSignature !== razorpay_signature)
    
    Agar signatures same hain:
    
    Payment request is authentic
            ↓
    Continue
    
    Agar different hain:
    
    Payment verification failed
            ↓
    400 response
    
    Why this is necessary?
    
    Suppose koi attacker frontend se request bhej de:
    
    "I paid ₹199"
    
    Backend ko blindly believe nahi karna chahiye.
    
    Signature verification backend ko confidence deta hai ki payment details Razorpay ke expected signing mechanism se match karti hain.
    
    
    10. Payment database mein find hoti hai
    
    Verification ke baad:
    
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    });
    
    Backend apne MongoDB mein check karta hai:
    
    order_xyz123
          ↓
    Payment document?
    
    Agar nahi mila:
    
    404 Payment not found
    
    Agar mil gaya:
    
    Payment found
    
    
    11. Payment status update hota hai
    
    Ab:
    
    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;
    
    await payment.save();
    
    Database pehle:
    
    status: "created"
    
    tha.
    
    Ab:
    
    status: "paid"
    paymentId: "pay_abc456"
    
    ho gaya.
    
    
    12. Auth Service ko call kiya jaata hai
    
    Ab sabse interesting part:
    
    await axios.patch(
      `${process.env.AUTH_SERVICE}/internal/update-plan`,
      {
        userId: payment.userId,
        plan: payment.plan,
        credits: payment.credits,
      }
    );
    
    Tumhara Payment Service, Auth Service ko request bhej raha hai.
    
    Payment Service
           |
           | PATCH /internal/update-plan
           ↓
    Auth Service
    
    Data:
    
    {
      userId: "12345",
      plan: "starter",
      credits: 500
    }
    
    Auth Service ab user ke MongoDB document ko update karega.
    
    Something like:
    
    User
    
    {
      firebaseUid: "...",
      name: "Rahul",
      plan: "free",
      credits: 100
    }
    
    becomes:
    
    User
    
    {
      firebaseUid: "...",
      name: "Rahul",
      plan: "starter",
      credits: 500
}
*/
