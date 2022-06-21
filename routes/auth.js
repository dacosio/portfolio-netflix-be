const router = require('express').Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken")
const tokenList = {}

router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(JSON.stringify(req.body.password), process.env.SECRET_KEY).toString()
    })

    try {
        const user = await newUser.save()
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
})


router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        !user && res.status(401).json("Incorrect password or username")

        var bytes  = CryptoJS.AES.decrypt(user.password, process.env.HASH_SECRET_KEY);
        var originalPassword = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        originalPassword !== req.body.password && res.status(401).json("Incorrect password or username")

        const accessToken = jwt.sign({id: user._id, isAdmin: user.isAdmin}, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn: "1d"})
        const refreshToken = jwt.sign({id: user._id, isAdmin: user.isAdmin}, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: "5d"})

        
        // _.doc is the object from mongodb
        const {password, ...userInfo} = user._doc
        const response = {
            ...userInfo,
            accessToken,
            refreshToken,
        }
        tokenList[refreshToken] = response

        res.status(200).json(response)
    } catch (error) {
        res.status(500).json(error)
    }
})



router.post('/token', async (req,res) => {
    const postData = req.body
    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = await User.findOne({email: req.body.email})
        !user && res.status(401).json("Incorrect password or username")

        const accessToken = jwt.sign({id: user._id, isAdmin: user.isAdmin}, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn: "1d"})
        const response = {
            "accessToken": accessToken,
        }
        // update the token in the list
        tokenList[postData.refreshToken].accessToken = accessToken
        console.log(tokenList)
        res.status(200).json(response);        
    } else {
        res.status(404).send('Invalid request')
    }
})

module.exports = router;