export const refundProcessedEmailTemplate = ({
  customerName,
  providerName,
  refundAmount,
  serviceDate,
  startTime,
}) => {
  return {
    subject: "Refund Processed Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your Refund Has Been Processed</h2>

        <p>Hello <strong>${customerName}</strong>,</p>

        <p>
          Your refund has been successfully processed for the cancelled booking
          with <strong>${providerName}</strong>.
        </p>

        <hr>

        <h3>Refund Details</h3>

        <ul>
          <li><strong>Provider:</strong> ${providerName}</li>
          <li><strong>Refund Amount:</strong> ₹${refundAmount}</li>
          <li><strong>Service Date:</strong> ${serviceDate}</li>
          <li><strong>Start Time:</strong> ${startTime}</li>
        </ul>

        <p>
          Depending on your bank or payment provider, the refunded amount may
          take a few business days to appear in your account.
        </p>

        <br>

        <p>Thank you for choosing ServiceHub.</p>
      </div>
    `,
  };
};