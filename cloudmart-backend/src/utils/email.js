import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 25,
  secure: false,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    : undefined
});

export const sendConfirmationEmail = async (to, order) => {
  const message = {
    from: process.env.SMTP_FROM || 'no-reply-cloudmart@gmail.com',
    to,
    subject: 'Order Confirmation',
    text: `Your order ${order.id} totaling $${order.total} has been placed.`
  };
  await transporter.sendMail(message);
};