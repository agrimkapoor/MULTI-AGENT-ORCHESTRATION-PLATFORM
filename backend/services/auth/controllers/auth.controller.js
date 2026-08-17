import crypto from "crypto";
import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";
import { app } from "../config/firebase.js";

//LOGIN CONTROLLER 
export const login = async (req, res) => {
    try {
        //extract the token from req.body :  The frontend sends the Firebase ID token to backend
        //Frontend par user Firebase se login karta hai. Firebase frontend ko ek ID token deta hai.
        const { token } = req.body; // object destructing

        //verify token using firebase admin sdk 
        //Ye important hai because client/browser se aane wale data par blindly trust nahi karna chahiye
        //Agar token valid hai, Firebase us token ko decode karke uske user ki information ka object return karta hai
        const decoded = await getAuth(app).verifyIdToken(token);

        console.log(decoded);

        // find the user in database
        let user = await User.findOne({
            firebaseUid: decoded.uid,
        });

        // if the user not exists we have to create so its like signup ke samay hi login waala token milega
        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                email: decoded.email,
                name: decoded.name,
                avatar: decoded.picture,
                provider: decoded.firebase?.sign_in_provider,
            });
        }

        //SESSION MANAGEMENT
      
        // generate session id
        const sessionId = crypto.randomUUID();

        // store in redis ( 2 mappings )

        // key is userId and value is sessionId 
        await redis.set(
            `user-session:${user._id}`,
            sessionId,
            "EX",
            60 * 60 * 24 * 7
        );

        // key is sessionId and value is user ki info
        await redis.set(
            `session:${sessionId}`,
            JSON.stringify({
                userId: user._id,
                email: user.email,
                avatar: user.avatar,
                name: user.name,
                plan: user.plan,
                credits: user.credits,
                totalCredits: user.totalCredits
            }),
            "EX",
            60 * 60 * 24 * 7 // 7 din ke liye rehega session
        );

        //set cookie : ye browser mei store hoga
        res.cookie(
            "session", //name of cookie
            sessionId,
            {
                httpOnly: true, // JavaScript (client-side) is cookie ko access nahi kar sakta , sirf HTTP requests ke through server padhta hai
                secure: false, // cookie HTTP pe bhi bhejegi, sirf HTTPS pe nahi. Ye development ke liye theek hai, but production me secure: true hona chahiye (HTTPS-only), warna cookie plain HTTP pe intercept ho sakti hai.
                sameSite: "lax",// CSRF (Cross-Site Request Forgery) attacks se kuch protection deta hai by only sending the cookie on same-site requests (with some exceptions).
                maxAge: 1000 * 60 * 60 * 24 * 7,//7 din mei cookie expire
            }
        );

        return res.json({
            success: true,
            user, //user bhejdo
        });

    } 
    catch (error) {
        return res.status(401).json({
            message: error.message,
        });
    }
};

export const logout = async (req, res) => {
    try {
        // read cookie : requires the cookie-parser middleware to be applied in the main app
        const sessionId = req.cookies?.session;

        //delete both mappings from redis
        if (sessionId) {
            const sessionData = await redis.get(`session:${sessionId}`);

            if (sessionData) {
                const { userId } = JSON.parse(sessionData);
                await redis.del(`user-session:${userId}`);
            }

            await redis.del(`session:${sessionId}`);
        }
       // clear cookie
        res.clearCookie("session", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } 
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updatePlan = async (req, res) => {
    try {
        const { userId, plan, credits } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.plan = plan;
        user.credits += credits;
        user.totalCredits += credits;
        user.planExpiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        );

        await user.save();

        const sessionId = await redis.get(
            `user-session:${user._id}`
        );

        if (sessionId) {
            await redis.set(
                `session:${sessionId}`,
                JSON.stringify({
                    userId: user._id,
                    email: user.email,
                    avatar: user.avatar,
                    name: user.name,
                    plan: user.plan,
                    credits: user.credits,
                    totalCredits: user.totalCredits
                }),
                "EX",
                60 * 60 * 24 * 7
            );
        }

        return res.json({
            success: true
        });

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deductCredits = async (req, res) => {
    try {
        const { userId, agent } = req.body;

        const COST = {
            chat: 1,
            search: 5,
            coding: 10,
            pdf: 10,
            ppt: 10,
            image: 10
        };

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const requiredCredits = COST[agent] || 1;

        if (user.credits < requiredCredits) {
            return res.status(400).json({
                success: false,
                message: "Not enough credits."
            });
        }

        user.credits -= requiredCredits;
        await user.save();

        const sessionId = await redis.get(
            `user-session:${user._id}`
        );

        if (sessionId) {
            await redis.set(
                `session:${sessionId}`,
                JSON.stringify({
                    userId: user._id,
                    email: user.email,
                    avatar: user.avatar,
                    name: user.name,
                    plan: user.plan,
                    credits: user.credits,
                    totalCredits: user.totalCredits
                }),
                "EX",
                60 * 60 * 24 * 7
            );
        }

        return res.json({
            success: true,
            credits: user.credits
        });

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
