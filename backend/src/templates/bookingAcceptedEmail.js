export const bookingAcceptedEmailTemplate = ({
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  return {
    subject: "Booking Accepted",
    html: `
            <div style="font-family: Arial, sans-serif, line-height: 1.6;">
                <h2>Your Booking Has Been Accepted 🎉</h2>

                <p>Hello <strong>${customerName}</strong>,</p>

                <p>Great news! <strong>${providerName}</strong> has accepted your booking.</p>

                <hr>

                <h3>Booking Details</h3>

                <ul>
                    <li><strong>Provider:</strong> ${providerName}</li>
                    <li><strong>Date:</strong> ${serviceDate}</li>
                    <li><strong>Start Time:</strong> ${startTime}</li>
                    <li><strong>Duration:</strong> ${hours} hour(s)</li>
                </ul>

                <p>
                    Please complete the payment (if pending) before the scheduled service.
                </p>

                <br>

                <p>Thank you for using ServiceHub.</p>
            </div>
        `,
  };
};
