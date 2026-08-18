import mongoose from "mongoose";

// this file defines the structure for storing chat messages in mongoDB

// there are 2 subschemas 

// Schema for individual files inside an artifact
const fileSchema = new mongoose.Schema(
  {
    name: String, //file name
    content: String,//content of file
  },
  {
    _id: false, // Since these sub-schemas are embedded within the messageSchema, we don't want Mongoose to add extra _id fields to every file or artifact
  }
);

// Schema for artifacts attached to a message
const artifactSchema = new mongoose.Schema(
  {
    id: Number, // to repres the artifact
    type: String, // type of artifact : code ,image
    title: String,
    files: [fileSchema],//array of files that belong to this artifact
    createdAt: String,
  },
  {
    _id: false,
  }
);

// Schema for messages
const messageSchema = new mongoose.Schema(
  {
    conversationId: { // ye message konsi conversation ka hai
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", // this field(conversationID) references the conversation model
    },

    role: {// message from user or assistant
      type: String,
      enum: ["user", "assistant"],
    },

    content: String,

    images: [String], // array of string

    artifacts: [artifactSchema], // array of artifact waale documents
  },
  {
    timestamps: true,
  }
);

// Create Message model
const Message = mongoose.model("Message", messageSchema);

export default Message;
