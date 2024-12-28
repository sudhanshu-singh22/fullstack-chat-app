import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js"
import fs from 'fs';

export const signup=async(req,res)=>{
    const {fullName,email,password}=req.body
        try{
            if(!fullName || !email || !password){
                return res.status(400).json({message:"All field are required"}); 
            }
            if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 character"}); 
            }
            const user=await User.findOne({email})
            if(user) return res.status(400).json({message:"Email already exists"})
            const salt= await bcrypt.genSalt(10)
            const hashedPassword=await bcrypt.hash(password,salt);
            const newUser= new  User({
                fullName,
                email,
                password:hashedPassword
            })
            if(newUser){
                    generateToken(newUser._id,res)
                    await newUser.save()
                res.status(201).json({
                    _id:newUser._id,
                    fullName:newUser.fullName,
                    email:newUser.email,
                    profilePic:newUser.profilePic,
                })
            }else{
                res.status(400).json({message:"Invalid user data"});
            }
        }catch(error){
                console.log("Error in signup Controller",error.message);
                res.status(500).json({message:"Internal Server Error"});
        }
   
};

export const login=async(req,res)=>{
    const {email, password}=req.body
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        const isPasswordCorrect=await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        generateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        })
    }catch(error){
        console.log("Error in login Controller",error.message);
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const logout=(req,res)=>{
   try{
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logout Successfully"})
   }catch(error){
   console.log("Error in logout controller",error.message)
   res.status(500).json({message:"Internal Server Error"})
   }
}

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      // Debugging: Log the incoming image URL to make sure it's being passed correctly
      console.log("Profile picture data:", profilePic);
  
      // Try uploading the image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "user_profiles",  // Optional: specify folder if needed
        resource_type: "image",   // Ensure resource type is image
      });
  
      // Debugging: Log the upload response to see if the upload is successful
      console.log("Cloudinary upload response:", uploadResponse);
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
      console.log("Updated user:", updatedUser);
  
      res.status(200).json(updatedUser);  // Return the updated user
  
    } catch (error) {
      console.log("Error in Update profile:", error);  // Log the error
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

export const checkAuth=(req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth Controller ",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}
