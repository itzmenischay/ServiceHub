export const bookingCancelledEmailTemplate = ({
  providerName,
  customerName,
  serviceDate,
  startTime,
  hours,
}) => {
  return {
    subject: "Booking Cancelled",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Booking Cancelled</h2>

        <p>Hello <strong>${providerName}</strong>,</p>

        <p>
          <strong>${customerName}</strong> has cancelled their booking.
        </p>

        <hr>

        <h3>Cancelled Booking</h3>

        <ul>
          <li><strong>Customer:</strong> ${customerName}</li>
          <li><strong>Date:</strong> ${serviceDate}</li>
          <li><strong>Start Time:</strong> ${startTime}</li>
          <li><strong>Duration:</strong> ${hours} hour(s)</li>
        </ul>

        <p>
          This time slot is now available for new bookings.
        </p>

        <br>

        <p>Thank you for using ServiceHub.</p>
      </div>
    `,
  };
};
