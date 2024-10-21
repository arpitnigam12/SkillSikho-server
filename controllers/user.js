import sendMail from '../middlewares/sendMail.js';
import TryCatch from '../middlewares/TryCatch.js';
import {User} from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

//register kar rhe hai yahn
export const register = TryCatch(async(req, res) => {
    
    const {email, password, name} = req.body;
    let user = await User.findOne({email});

    if(user)
        return res.status(400).json({message: 'User already exists'});
      const hashPassword = await bcrypt.hash(password, 10);
    user = {
          email,
          name,
          password: hashPassword,
      }
    //otp generate kar rhe hai yahn

      const otp=Math.floor(Math.random()*1000000);
      const activationToken = jwt.sign({user, otp}, process.env.Activation_Secret, {expiresIn: '5m'});
      
      const data ={
          name,
          otp,
      };

      await sendMail(email, 'SkillSikho',  data);
      res.status(200).json({message: 'OTP has been sent to your email address, please verify', activationToken});
    
    })

    //verify kar rhe hai yahn otp ko 
export const verifyUser = TryCatch(async (req, res) => {
   const {otp, activationToken} = req.body

   
   const verify = jwt.verify(activationToken, process.env.Activation_Secret)

   
   if(!verify)
    return res.status(400).json({
  message: "otp expired"
  })

  if(verify.otp !==otp)   
     return res.status(400).json({
    message: "wrong otp"
    });
    //user ko save kar rhe hai yahn
       await User.create({
        name: verify.user.name,
        email: verify.user.email,
        password: verify.user.password,
       })

       res.json({message: 'User registered successfully'})
});
        //login kar rhe hai yahn
export const loginUser = TryCatch(async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user)
        return res.status(400).json({message: 'User not found'});
    const matchPassword = await bcrypt.compare(password, user.password);

    if(!matchPassword)
        return res.status(400).json({message: 'Wrong Password'});
    const token = jwt.sign({_id: user._id}, process.env.Jwt_Sec, {expiresIn: '12d'});
       
    res.json({message: `Welcome Back ${user.name}`,
       token,
       user,
      
      });
});

export const myProfile = TryCatch(async(req, res) => {
        const user = await User.findById(req.user._id)
        res.json({ user });
});