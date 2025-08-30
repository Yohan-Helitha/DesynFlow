import mongoose from"mongoose";
import bcrypt from"bcrypt";

const userSchema = new mongoose.Schema({

    id:{type:String,required:true,unique:true},
    username: {type: String, required: true},
    email: {type: String, required: true, trim:true},
    password: {type: String,required: true},
    phone: {type: String},
    role: {type: String,
        enum:["client" , "customer service representative", "manager","project manager","finance manager","inspector","procurement officer"],
        default:"client"
    },

    isVerified: {type:Boolean,default:false},
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        twoFactorPin: String,
        twoFactorExpires: Date,
})
    userSchema.pre("save",async function(next){

        if(!this.isModified("password"))

            return next();

        else{

            this.password=await bcrypt.hash(this.password,8);
            next();
        }
    });

    userSchema.methods.comparePassword=async function(candidatePassword){

        return bcrypt.compare(candidatePassword,this.password);

    };

   const express = require("express");
    const { registerUser, loginUser } = require("../controllers/authController");
    const router = express.Router();

    router.post("/register", registerUser);
    router.post("/login", loginUser);

module.exports = router;
