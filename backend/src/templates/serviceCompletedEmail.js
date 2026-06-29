export const serviceCompletedEmailTemplate = ({
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  return {
    subject: "Service Completed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your Service Has Been Completed</h2>

        <p>Hello <strong>${customerName}</strong>,</p>

        <p>
          <strong>${providerName}</strong> has marked your booking as completed.
        </p>

        <hr>

        <h3>Booking Summary</h3>

        <ul>
          <li><strong>Provider:</strong> ${providerName}</li>
          <li><strong>Date:</strong> ${serviceDate}</li>
          <li><strong>Start Time:</strong> ${startTime}</li>
          <li><strong>Duration:</strong> ${hours} hour(s)</li>
        </ul>

        <p>
          We hope you had a great experience.
        </p>

        <p>
          Don't forget to leave a review to help other customers.
        </p>

        <br>

        <p>Thank you for choosing ServiceHub.</p>
      </div>
    `,
  };
};
