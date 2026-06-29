export const paymentSuccessEmailTemplate = ({
  customerName,
  providerName,
  amount,
  serviceDate,
  startTime,
}) => {
  return {
    subject: "Payment Successful",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Payment Successful</h2>

        <p>Hello <strong>${customerName}</strong>,</p>

        <p>
          Your payment has been successfully received.
        </p>

        <hr>

        <h3>Payment Summary</h3>

        <ul>
          <li><strong>Provider:</strong> ${providerName}</li>
          <li><strong>Amount Paid:</strong> ₹${amount}</li>
          <li><strong>Service Date:</strong> ${serviceDate}</li>
          <li><strong>Start Time:</strong> ${startTime}</li>
        </ul>

        <p>
          Your booking is now confirmed. The provider has been notified of your
          successful payment.
        </p>

        <br>

        <p>Thank you for choosing ServiceHub.</p>
      </div>
    `,
  };
};
