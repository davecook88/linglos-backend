const nodemailer = require("nodemailer") ;
const { google } = require("googleapis") ;
require('dotenv').config();
const OAuth2 = google.auth.OAuth2;

class Emailer {
  constructor(){
    this.oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    this.oauth2Client.setCredentials({
      refresh_token:process.env.GMAIL_REFRESH_TOKEN,
    });
  }

  createTransporter() {
    const accessToken = this.oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service:"gmail",
      auth: {
        type: "OAuth2",
        user: 'info@academicool.com',
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    return smtpTransport;
  }

  sendMail(options){
    if (!options.hasOwnProperty('generateTextFromHTML')) options.generateTextFromHTML = true;
    const transporter = this.createTransporter();
    let res;
    transporter.sendMail(options, (error, response) => {
      error ? res = error : res = response;
      transporter.close();
      return res;
    });
    
  }
}

module.exports = Emailer;

// const accessToken = oauth2Client.getAccessToken();

// const smtpTransport = nodemailer.createTransport({
//   service:"gmail",
//   auth: {
//     type: "OAuth2",
//     user: 'info@academicool.com',
//     clientId: process.env.GMAIL_CLIENT_ID,
//     clientSecret: process.env.GMAIL_SECRET,
//     refreshToken: process.env.GMAIL_REFRESH_TOKEN,
//     accessToken: accessToken
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });


// smtpTransport.sendMail(mailOptions, (error, response) => {
//   error ? console.trace(error) : console.log(response);
//   smtpTransport.close();
// });