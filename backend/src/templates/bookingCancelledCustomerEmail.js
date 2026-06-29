export const bookingCancelledCustomerEmailTemplate = ({
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  return {
    subject: "Booking Cancellation Confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your Booking Has Been Cancelled</h2>

        <p>Hello <strong>${customerName}</strong>,</p>

        <p>
          Your booking with <strong>${providerName}</strong> has been
          successfully cancelled.
        </p>

        <hr>

        <h3>Cancelled Booking Details</h3>

        <ul>
          <li><strong>Provider:</strong> ${providerName}</li>
          <li><strong>Date:</strong> ${serviceDate}</li>
          <li><strong>Start Time:</strong> ${startTime}</li>
          <li><strong>Duration:</strong> ${hours} hour(s)</li>
        </ul>

        <p>
          If you've already completed the payment, any eligible refund will be
          processed according to ServiceHub's refund policy. You will receive a
          separate email once the refund has been successfully processed.
        </p>

        <p>
          Looking for another service? You can explore other trusted providers
          and book a new appointment anytime on ServiceHub.
        </p>

        <br>

        <p>Thank you for choosing ServiceHub.</p>
      </div>
    `,
  };
};