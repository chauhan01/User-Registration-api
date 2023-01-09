const User = require('../models/user')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {sendOTP,createTokenUser,attachCookiesToResponse} = require('../utils')
const otpGenerator = require('otp-generator')

const updateUser = async(req, res)=>{
    const {name} = req.body
    if(!name){
        throw new CustomError.BadRequestError('Please proviede name')
    }
    const user = await User.findOne({_id:req.user.userId}).select('-password')
    user.name = name
    await user.save()
    res.status(StatusCodes.OK).json({user})
    
}

const updateUserEmail = async(req, res)=>{
    const {newEmail} = req.body
    if(!newEmail){
        throw new CustomError.BadRequestError('please provide email')
    }
    //checking if email is used by another user or not
    const emailAlreadyExist = await User.findOne({email:newEmail})
    if(emailAlreadyExist){
        throw new CustomError.BadRequestError('email already in use by other user')
    }

    const user = await User.findOne({_id:req.user.userId})

    //checking if new email is not same as the old email
    if(newEmail === user.email){
        throw new CustomError.BadRequestError('Please provie a new email')
    }

    //sending otp to confirm email is valid and user is authorized to use it
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false })
    user.newEmail = newEmail
    user.otp = otp
    user.otpExpirationTime =  new Date(Date.now()+1000*60*3)
    await user.save()
    await sendOTP({name:user.name, email:user.newEmail, otp})
    res.status(StatusCodes.OK).json({msg:'OTP(one time password sent. Please check and verify your email.)'})
    
}

const verifyOTP = async(req, res)=>{
    const {otp} = req.body
    if(!otp){
        throw new CustomError.BadRequestError('please provide OTP')
    }
    const user = await User.findOne({_id:req.user.userId})
    if(user.otp !== otp ){
        throw new CustomError.UnauthenticatedError('Wrong OTP')
    }
    currentDate=new Date()
    
    if(user.otpExpirationTime<currentDate){
        throw new CustomError.UnauthenticatedError('OTP EXPIRED')
    }
    user.email = user.newEmail
    user.otp=null
    user.otpExpirationTime=null
    await user.save()
    res.status(StatusCodes.OK).json({msg:'Email updated successfully!'})
}

const updateUserPassword = async(req, res)=>{
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('Please provide old password and new password')
    }
    const user = await User.findOne({_id:req.user.userId})
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('incorrect old password')
    }
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({msg:"password updated Successfully"})
}

const deleteUser = async(req, res)=>{
    const user = await User.findOne({_id:req.user.userId})
    await user.remove()
    res.status(StatusCodes.OK).json('User removed successfully!')
}

module.exports = {updateUser, updateUserEmail, verifyOTP, updateUserPassword, deleteUser}