const express = require('express')
const router = express.Router()
const {updateUser, updateUserPassword, deleteUser, updateUserEmail, verifyOTP} = require('../controllers/userController')
const authenticateUser = require('../middlewares/authenticate')

router.patch('/updateUser',authenticateUser,updateUser)
router.patch('/updateUserPassword',authenticateUser,updateUserPassword)
router.patch('/updateUserEmail',authenticateUser,updateUserEmail)
router.post('/verifyOTP',authenticateUser,verifyOTP)
router.delete('/deleteUser',authenticateUser,deleteUser)


module.exports = router