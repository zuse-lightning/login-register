require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const UserModel = require("./models/User");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser());

mongoose.connect("mongodb://localhost:27017/employee");

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json("Access Denied");
    } else {
        jwt.verify(token, "secret", (err, decoded) => {
            if (err) {
                return res.json("Error with token");
            } else {
                if (decoded.role === "admin") {
                    next();
                } else {
                    return res.json("not admin");
                }
            }
        });
    }
};

app.get("/dashboard", verifyUser, (req, res) => {
    res.json("Success");
});

app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10).then(hash => {
        UserModel.create({ name, email, password: hash }).then(user => {
            res.json("Success");
        }).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email }).then(user => {
        if (user) {
            bcrypt.compare(password, user.password, (err, response) => {
                if (response) {
                    const token = jwt.sign({ email: user.email, role: user.role }, "secret", { expiresIn: "1h" });
                    res.cookie("token", token);
                    return res.json({ status: "Success", role: user.role });
                } else {
                    return res.json("The password is incoorect.");
                }
            });
        } else {
            res.json("No record exists.");
        }
    });
});

app.post("/logout", (req, res) => {
    res.clearCookie("token", {
        sameSite: "none",
        secure: true
    }).status(200).json("User logged out");
});

app.post("/forgot", (req, res) => {
    const { email } = req.body;
    UserModel.findOne({ email: email }).then(user => {
        if (!user) {
            return res.send({ status: "User not found" });
        }
        const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: "james@zuse.com",
            subject: "Password Reset",
            text: `http://localhost:5173/reset/${user._id}/${token}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Email sent");
                return res.send({ status: "Success" });
            }
        });
    });
});

app.post("/reset/:id/:token", (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    jwt.verify(token, "secret", (err, decoded) => {
        if (err) { 
            return res.json("Token is invalid")
        } else {
            bcrypt.hash(password, 10).then(hash => {
                UserModel.findByIdAndUpdate({ _id: id }, { password: hash }).then(user => {
                    return res.send({ status: "Success"});
                }).catch(err => res.send({ status: err }));
            }).catch(err => res.send({ status: err }));
        }
    });
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});