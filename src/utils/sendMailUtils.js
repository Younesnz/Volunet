const nodeMailer = require('nodemailer');
const path = require('path');
const debug = require('debug')('app:email');
const hbs = require('nodemailer-express-handlebars');

async function sendMail(options) {
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

    const handlebarOptions = {
      viewEngine: {
        extName: '.handlebars',
        partialsDir: path.resolve('../../views/email'),
        defaultLayout: false,
      },
      viewPath: path.resolve('./views'),
      extName: '.handlebars',
    };

    transporter.use('compile', hbs(handlebarOptions));

    const mailOptions = {
      from: `Volunet <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      template: 'email',
      context: {
        title: options.title,
        text: options.text,
        name: options.name
          ? options.name.charAt(0).toUpperCase() + options.name.slice(1)
          : options.username,
        action: options.action,
      },
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    debug(`error sending email: ${error.message}`);
    return error;
  }
}

module.exports = sendMail;
