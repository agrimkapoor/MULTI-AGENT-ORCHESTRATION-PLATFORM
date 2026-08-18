import express from "express";

import {createConversation,getConversations,getMessages,saveMessage,updateConversation} from "../controllers/chat.controller.js";

const router = express.Router();

// Create a new conversation
router.post("/create-conversation", createConversation);

// Get all conversations
router.get("/get-conversations", getConversations);

// Update a conversation
router.post("/update-conversation", updateConversation);

// Save a message
router.post("/save-message", saveMessage);

// Get messages of a conversation
router.get("/get-messages/:id", getMessages);

export default router;
