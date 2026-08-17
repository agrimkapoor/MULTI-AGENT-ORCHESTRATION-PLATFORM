import express from "express"
import {deductCredits,login,logout,updatePlan} from "../controllers/auth.controllers.js"

const router = express.Router();
// pehle const app = express() kar rhe the par ab bas Router fn ko access kar rhe

router.post("/login",login); // ham yaha pe controller fn ka reference de rahe 
// these functions contain the actual business logic for each endpoint
router.get("/logout",logout); //ye get method hoga
router.patch("/internal/update-plan",updatePlan);//patch is used for partial updates to a resource
router.patch("/internal/deduct-credits",deductCredits);

export default router
