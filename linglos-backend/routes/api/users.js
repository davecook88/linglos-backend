const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Emailer = require('../../mailer/mailer');
require('dotenv').config();

const secretOrKey = process.env.SECRET_KEY || 'secret';

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateForgotPasswordInput = require('../../validation/forgotpassword');
const validateResetPasswordInput = require('../../validation/resetPassword');

const User = require('../../models/User');

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);
    console.log(errors,isValid);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({email: req.body.email })
        .then((user) => {
            if(user) {
                return res.status(400).json({email:'email already exists'});
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                });
            }
        })
        .catch(err => console.log(`Error ${err}`));
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req,res) => {
    console.log(req.body);
    const {errors, isValid} = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email}).then(user => {
        if(!user) {
            return res.status(404).json({emailNotFound: "Email not found"});
        }
        bcrypt.compare(password,user.password).then(isMatch => {
            if (isMatch) {
                const payload = {
                    id: user.id,
                    name: user.name
                };
    
                jwt.sign(
                    payload, 
                    secretOrKey,
                    {
                    expiresIn:1200
                    },
                    (err,token) => {
                        res.json({
                            success:true,
                            token: `bearer ${token}`
                        });
                    }
                )
            } else {
                return res
                        .status(400)
                        .json({passwordincorrect: 'Password incorrect'});
            }
        })
    });

    
});
// @route POST api/users/login
// @desc Send password reset email
// @access Public
router.post('/forgot-password', (req, res) => {
    const {errors, isValid} = validateForgotPasswordInput(req.body);
    console.log(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;

    User.findOne({ email }).then(user => {
        if(!user) {
            return res.status(404).json({emailNotFound: "Email not found"});
        }
        user.setPasswordResetToken((user) => {
            const signedHash = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data: user.passwordResetToken
            }, user.email + user.name);
            const mailer = new Emailer();
            const mailOptions = {
                from:'info@academicool.com',
                to: user.email,
                subject: 'Your password reset link',
                html:`<h1>Test</h1><br>
                    <a href="http://localhost:5000/api/users/forgot-password/${user._id}-${signedHash}">link</a>`
            }
            const mailResponse = mailer.sendMail(mailOptions)
            return res.status(200).json(mailResponse);
        });        
    });
});
// @route GET api/users/login/:token
// @desc check if link is valid
// @access Public
router.get('/forgot-password/:id-:token', (req, res) => {
    const { token, id } = req.params;
    User.findOne({_id:id}, (err, user) => {
        if (err) return res.status(200).json({error:"User not found"});
        user.checkPasswordResetToken(token,(decoded) => {
            if (decoded) {
                const uriSafeToken = encodeURI(token)
                res.redirect(`http://localhost:3000/reset-password/${user._id}/${uriSafeToken}`)
            } else {
                res.json({error:'invalid token'});
            }
            
        });
    })
});

// @route POST api/users/reset-password
// @desc accept reset password form, verify and reset
// @access Public
router.post('/reset-password', (req, res) => {
    console.log(req.body);
    const {errors, isValid} = validateResetPasswordInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { email, password, encodedToken } = req.body;
    
    User.findOne({ email }, (err, user) => {
        if (err) return res.status(200).json({errors:{status:"User not found"}});
        const decodedToken = decodeURI(encodedToken)
        
        user.checkPasswordResetToken(decodedToken,(decoded) => {
            if (decoded) {
                console.log(decoded);
                console.log(user.passwordResetToken);
                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        console.log(err,hash);
                        if (err) throw err;
                        const attributes = {
                            password:hash,
                        }
                        
                        User.updateOne({_id:user._id}, {password:hash}, (err) => {
                            console.log(user);
                            if (err) res.status(200).json({errors:{status:'Error updating password in database'}});
                            res.status(200).json({success:true});
                        })
                    })
                });
                
            } else {
                res.status(200).json({errors:{status:'invalid token for this email address - try sending another reset email'}});
            }
            
        });
    })
});


module.exports = router;