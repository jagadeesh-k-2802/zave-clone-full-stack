const nodemailer = require('nodemailer');
const ejs = require('ejs');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.firstName = user.fullname.split(' ')[0];
    this.to = user.email;
    this.url = url;
    this.from = `Zave <hello@zave.co>`;
  }

  _newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // MailTrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the actual email
  async _send(template, subject) {
    // 1) Render HTML based on a ejs template
    const path = `${__dirname}/../views/email/${template}.ejs`;
    const data = { firstName: this.firstName, url: this.url };
    const html = await ejs.renderFile(path, data);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this._newTransport().sendMail(mailOptions);
  }

  // Methods to send different mails
  async sendWelcome() {
    await this._send('welcome', 'Welcome To Zave');
  }

  async sendDeleteRequest() {
    await this._send('delete-request', 'Zave - Account Delete Request');
  }

  async sendPasswordReset() {
    await this._send('password-reset', 'Zave - Password Reset');
  }
}

module.exports = Email;
