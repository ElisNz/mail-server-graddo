import nodemailer from "nodemailer";

exports.sendMail = (req: any, res: any) => {
  if (!req.body.subject || !req.body.text) {
    res.status(422).send({
      error: {
        code: 422,
        message: "Missing arguments"
      }
    });
    return;
  }

  if (!process.env.WORKER_MAIL || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    res.status(500).send({
      error: {
        code: 500,
        message: "Missing environment variables"
      }
    });
    return;
  }

  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.WORKER_MAIL,
      serviceClient: process.env.CLIENT_ID,
      privateKey: process.env.CLIENT_SECRET.replace(/\\n/g, "\n")
    }
  });

  const mailOptions = {
    from: req.body.from || process.env.MAIL_FROM || process.env.WORKER_MAIL,
    to: req.body.to || process.env.TARGET_MAIL,
    bcc: req.body.bcc || process.env.MAIL_BCC,
    subject: req.body.subject,
    text: req.body.text
  };

  transporter.sendMail(mailOptions)
    .then(() => {
      res.status(200).send({
        data: {
          code: 200,
          message: "Mail sent"
        }
      });
    })
    .catch(e => {
      res.status(500).send({
        error: {
          code: 500,
          message: e.toString()
        }
      });
    });
}
