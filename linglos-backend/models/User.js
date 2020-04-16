const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required: true
    },
    date: {
        type:Date,
        default:Date.now
    },
    passwordResetToken: {
        type:String,
        required: false
    }
});

UserSchema.methods.setPasswordResetToken = function( done){
    bcrypt.genSalt(10, (err,salt) => {
      bcrypt.hash(this.email, salt, (err,hash) => {
        if (err) throw err;
        
        this.passwordResetToken = hash;
        this.save()
            .then( user => done(user))
            .catch( err => console.log(err));
      })
    });
  }

  UserSchema.methods.checkPasswordResetToken  = function(token,cb) {
    jwt.verify(token, this.email+this.name, (err, decoded) => {
        if (err) return cb(null);
        if (decoded.data === this.passwordResetToken) {
            console.log('success')
            cb(decoded.data);            
        } else {
            console.log('in thrownError');
            throw err;
        }
    });

  }

module.exports = User = mongoose.model("users", UserSchema);