import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI); 
        if(conn){
                console.log("MongoDB connected");
        }
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "server is up and running",
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
