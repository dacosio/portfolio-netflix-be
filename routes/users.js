const router = require("express").Router()
const User = require('../models/User')
const CryptoJS = require("crypto-js");
const tokenChecker = require('./tokenChecker')

router.put("/:id", tokenChecker, async (req, res)=> {
    if(req.user.id == req.params.id || req.user.isAdmin) {
        if (req.body.password) {
            req.body.password = CryptoJS.AES.encrypt(JSON.stringify(req.body.password), process.env.SECRET_KEY).toString()
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, {$set:req.body}, {new: true})
            res.status(200).json(updatedUser)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You can update your account only")
    }
})

router.delete("/:id", tokenChecker,  async (req, res)=> {
    if(req.user.id == req.params.id || req.user.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json("User has been deleted")
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You can delete your account only")
    }
})


router.get("/find/:id", async (req, res)=> {
    try {
        const user = await User.findById(req.params.id)
        const {password, ...userInfo} = user._doc
        res.status(200).json(userInfo)
    } catch (error) {
        res.status(500).json(error)
    }
})


router.get("/", tokenChecker ,async (req, res)=> {
    const query = req.query.new;
    if(req.user.isAdmin) {
        try {
            const users = query ? await User.find().limit(10) : await User.find()
            res.status(200).json(users)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You are not allowed to see all users")
    }
})

module.exports = router