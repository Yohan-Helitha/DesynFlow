import user from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

exports. registerUser = async (req,res) => {

    const {username,email,password,phone } = req.body;

    try{

        const cleanEmail = email.trim();
        const userExists = await user.findOne({email:cleanEmail});

        if(userExists){

            return res.status(400).json({message:"User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password,8);

        const newUser = new user({
            username,
            email:cleanEmail,
            password:hashedPassword,
            phone
        });

        await newUser.save();

        const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:"1h"});

        res.status(201).json({
            message:"User registered successfully",
            token
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }

    };

    export const loginUser = async(req,res) => {
        const {email,password} =req.body;

        try{

            const cleanEmail = email.trim();
            const user = await user.findOne({email: cleanEmail});

            if(!user) return res.status(400).json({message:"Invalid email or password"});

            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch) return res.status(400).json({message:"Invalid email or password"});

            const token =jwt.sign({id:user._id, role: user.role},process.env.JWT_SECRET,{expiresIn:"30min"});
            res.status(200).json({
                message:"Login successful",
                token
                });

        }catch(error){
            console.error(error);
            res.status(500).json({message:"Internal server error"});
        }

    };



