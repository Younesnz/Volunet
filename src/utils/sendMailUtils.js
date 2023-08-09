const nodeMailer = require('nodemailer');
const debug = require('debug')('app:email');

async function sendMail(to, subject, title, body) {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `Volunet <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `<h1>${title}</h1><p>${body}</p>`,
    });

    return info;
  } catch (error) {
    debug(`error sending email: ${error.message}`);
    return error;
  }
}

module.exports = sendMail;
