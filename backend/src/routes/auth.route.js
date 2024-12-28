import express from "express";
import { login, logout, signup,updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from 'multer';
const upload = multer({
    dest: 'uploads/', 
    limits: { fileSize: 50 * 1024 * 1024 }, 
  }).single('profilePic');
const router= express.Router();
router.post("/signup", signup );

router.post("/login", login);

router.post("/logout",logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check",protectRoute, checkAuth);
export default router;