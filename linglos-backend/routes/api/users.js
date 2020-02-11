const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretOrKey = process.env.SECRET_KEY || 'secret';

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

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



module.exports = router;