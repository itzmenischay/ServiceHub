export const bookingRejectedEmailTemplate = ({
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  return {
    subject: "Booking Request Rejected",
    html: `
            <div style="font-family: Arial, sans-serif, line-height: 1.6;">
                <h2>Booking Request Rejected</h2>

                <p>Hello <strong>${customerName}</strong>,</p>

                <p>
                    Unfortunately, <strong>${providerName}</strong> was unable to accept your booking request.
                </p>
                
                <hr>

                <h3>Booking Details</h3>

                <ul>
                    <li><strong>Provider:</strong> ${providerName}</li>
                    <li><strong>Date:</strong> ${serviceDate}</li>
                    <li><strong>Start Time:</strong> ${startTime}</li>
                    <li><strong>Duration:</strong> ${hours} hour(s)</li>
                </ul>

                <p>
                    You can explore other providers on ServiceHub and submit another booking request.
                </p>


                <p>Thank you for using ServiceHub</p>
            </div>
        `,
  };
};
