
const sendEmail = require('./sendEmail')

const sendOTP = async({name, email, otp})=>{
    
    const message = `<p>Your one time password for changing the email is ${otp} 
  </p> <p>This OTP will expire in 3 minutes</p>`;

  sendEmail({
    to: email,
    subject: 'Email Confirmation',
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendOTP;