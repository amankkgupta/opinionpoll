const jwt = require("jsonwebtoken");

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const verifyMail = async (email) => {
  console.log("in mailer", email);

  try {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
    const url = `${process.env.BACKEND_URL}/api/auth/register/verify?token=${token}`;

    await resend.emails.send({
      from: "DebateHub Support <pg65734@gmail.com>", // temporary sender
      to: email,
      subject: "Verify your email",
      html: `<a href="${url}">Click here</a> to verify your email. Verification link expires in 10 minutes.`,
    });

    return true;
  } catch (err) {
    console.log("err in mailer", err);
    return false;
  }
};


const resetMail = async (email) => {
  try {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const url = `${process.env.FRONTEND_URL}/resetpassword?token=${token}`;

    await resend.emails.send({
      from: "DebateHub Support <pg65734@gmail.com>",
      to: email,
      subject: "Reset your password",
      html: `
        <p>Click the button below to reset your password:</p>
        <a href="${url}" 
           style="display:inline-block;padding:10px 16px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
           Reset Password
        </a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });

    return true;
  } catch (err) {
    console.log("err in reset mail", err);
    return false;
  }
};


module.exports = { verifyMail, resetMail };




