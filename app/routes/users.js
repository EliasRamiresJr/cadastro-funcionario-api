var express = require("express")
var router = express.Router()
const User = require("../models/user")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const secret = process.env.JWT_TOKEN
const withAuth = require('../middlewares/auth');

router.post("/register", async (req, res) => {
    const { name, password, funcao, data, especie } = req.body
    const user = new User({ name, password, funcao, data, especie })

    try {
        await user.save()
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: "Register error" })
    }
})

router.post("/login", async (req, res) => {
    const { name, password } = req.body

    try {
        let user = await User.findOne({ name })
        if (!user)
            res.status(401).json({ error: "Incorrect name or password" })
        else {
            user.isCorrectPassword(password, function (err, same) {
                if (!same)
                    res.status(401).json({ error: "Incorrect name or password" })
                else {
                    const token = jwt.sign({ name }, secret, { expiresIn: "10d" })
                    res.json({ user: user, token: token })
                }
            })
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error, please try again" })
    }
})

router.put('/', withAuth, async function (req, res) {
    const { name, email } = req.body;

    try {
        var user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { name: name, email: email } },
            { upsert: true, 'new': true }
        )
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: error });
    }
});

router.put('/password', withAuth, async function (req, res) {
    const { password } = req.body;

    try {
        var user = await User.findOne({ _id: req.user._id })
        user.password = password
        user.save()
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: error });
    }
});

router.delete('/', withAuth, async function (req, res) {
    try {
        let user = await User.findOne({ _id: req.user._id });
        await user.delete();
        res.json({ message: 'OK' }).status(201);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

module.exports = router