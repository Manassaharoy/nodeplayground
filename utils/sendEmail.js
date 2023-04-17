const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.techanalyticaltd.com",
    port: 465,
    secure: true,
    auth: {
      user: 'manas@techanalyticaltd.com',
      pass: 'T@ltd2628'
    },
    // auth: {
    //   user: "info@techanalyticaltd.com",
    //   pass: "T@ltd1100",
    // },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

module.exports.sendMail = async (params) => {
try {
    let info = await transporter.sendMail({
    from: "manas@techanalyticaltd.com",
    to: params.to, 
    subject: params.subject,
    text: params.message,
    });
    console.log("Email is sent");
    return info;
} catch (error) {
    console.log(error);
    throw new ErrorHandler(error.message, 500)
}
};