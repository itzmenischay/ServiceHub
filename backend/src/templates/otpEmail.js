export const otpEmailTemplate = (otp) => {
  return {
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  };
};