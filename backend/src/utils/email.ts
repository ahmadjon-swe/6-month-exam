import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (
  to: string,
  otp: string,
  purpose: "register" | "login" | "reset"
): Promise<void> => {
  const subjects: Record<string, string> = {
    register: "Verify your email - ShopHub",
    login: "Your login OTP - ShopHub",
    reset: "Reset your password - ShopHub",
  };

  const messages: Record<string, string> = {
    register: `Your registration OTP is: <strong>${otp}</strong>. It expires in 2 minutes.`,
    login: `Your login OTP is: <strong>${otp}</strong>. It expires in 2 minutes.`,
    reset: `Your password reset OTP is: <strong>${otp}</strong>. It expires in 2 minutes.`,
  };

  await transporter.sendMail({
    from: `"ShopHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: subjects[purpose],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#131921;">ShopHub</h2>
        <p>${messages[purpose]}</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#FF9900;margin:24px 0;">${otp}</div>
        <p style="color:#888;font-size:12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
