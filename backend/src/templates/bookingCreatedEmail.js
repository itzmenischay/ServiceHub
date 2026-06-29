export const bookingCreatedEmailTemplate = ({
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  return {
    subject: "Booking Request Submitted",
    html: `
            <div style="font-family: Arial, sans-serif, line-height: 1.6;">
                <h2>Booking Request Submitted</h2>

                <p>Hello <strong>${customerName}</strong>,</p>

                <p>
                    Your booking request has been successfullyy submitted and is now waiting for <strong>${providerName}</strong> to review.
                </p>

                <hr>

                <h3>Booking Details</h3>

                <ul>
                    <li><strong>Provider:</strong> ${providerName}</li>
                    <li><strong>Date:</strong> ${serviceDate}</li>
                    <li><strong>Start Time:</strong> ${startTime}</li>
                    <li><strong>Duration:</strong>${hours} hour(s)</li>
                </ul>

                <p>
                    You'll receive another email once the provider accepts or rejects your booking.
                </p>

                <br>

                <p>Thank you for choosing ServiceHub</p>
            </div>
        `,
  };
};
