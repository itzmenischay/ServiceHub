import { Resend } from "resend";
import "../config/env.js";

// Email templates imports
import { otpEmailTemplate } from "../templates/otpEmail.js";
import { bookingCreatedEmailTemplate } from "../templates/bookingCreatedEmail.js";
import { bookingAcceptedEmailTemplate } from "../templates/bookingAcceptedEmail.js";
import { bookingRejectedEmailTemplate } from "../templates/bookingRejectedEmail.js";
import { bookingCancelledEmailTemplate } from "../templates/bookingCancelledEmail.js";
import { bookingCancelledCustomerEmailTemplate } from "../templates/bookingCancelledCustomerEmail.js";
import { serviceCompletedEmailTemplate } from "../templates/serviceCompletedEmail.js";
import { paymentSuccessEmailTemplate } from "../templates/paymentSuccessEmail.js";
import { refundProcessedEmailTemplate } from "../templates/refundProcessedEmail.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generic Email Sender
export const sendEmail = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
};

// OTP Email
export const sendOTPEmail = async (email, otp, purpose = "verification") => {
  let subject;
  let heading;
  let message;

  if (purpose === "verification") {
    subject = "Verify Your ServiceHub Account";
    heading = "Email Verification";
    message = "Use the OTP below to verify your ServiceHub account.";
  } else if (purpose === "passwordReset") {
    subject = "Reset Your ServiceHub Password";
    heading = "Password Reset";
    message = "Use the OTP below to reset your ServiceHub account password.";
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>${heading}</h2>

      <p>${message}</p>

      <h1 style="
        letter-spacing: 8px;
        background:#f4f4f4;
        padding:20px;
        text-align:center;
      ">
        ${otp}
      </h1>

      <p>This OTP will expire in <strong>10 minutes</strong>.</p>

      <p>If you didn't request this, you can safely ignore this email.</p>

      <hr>

      <small>ServiceHub Team</small>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Booking Created Email
export const sendBookingCreatedEmail = async ({
  email,
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  const { subject, html } = bookingCreatedEmailTemplate({
    customerName,
    providerName,
    serviceDate,
    startTime,
    hours,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Booking Accepted Email
export const sendBookingAcceptedEmail = async ({
  email,
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  const { subject, html } = bookingAcceptedEmailTemplate({
    customerName,
    providerName,
    serviceDate,
    startTime,
    hours,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Booking Rejected Email
export const sendBookingRejectedEmail = async ({
  email,
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  const { subject, html } = bookingRejectedEmailTemplate({
    customerName,
    providerName,
    serviceDate,
    startTime,
    hours,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Booking Cancelled Email
export const sendBookingCancelledProviderEmail = async ({
  email,
  providerName,
  customerName,
  serviceDate,
  startTime,
  hours,
}) => {
  const { subject, html } = bookingCancelledEmailTemplate({
    providerName,
    customerName,
    serviceDate,
    startTime,
    hours,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export const sendBookingCancelledCustomerEmail = async ({
  email,
  providerName,
  customerName,
  serviceDate,
  startTime,
  hours,
}) => {
  const { subject, html } = bookingCancelledCustomerEmailTemplate({
    providerName,
    customerName,
    serviceDate,
    startTime,
    hours,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Service Completed Email
export const sendServiceCompletedEmail = async ({
  email,
  customerName,
  providerName,
  serviceDate,
  startTime,
  hours,
}) => {
  const { subject, html } = serviceCompletedEmailTemplate({
    customerName,
    providerName,
    serviceDate,
    startTime,
    hours,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Payment Success Email
export const sendPaymentSuccessEmail = async ({
  email,
  customerName,
  providerName,
  amount,
  serviceDate,
  startTime,
}) => {
  const { subject, html } = paymentSuccessEmailTemplate({
    customerName,
    providerName,
    amount,
    serviceDate,
    startTime,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Refund Processed Email
export const sendRefundProcessedEmail = async ({
  email,
  customerName,
  providerName,
  refundAmount,
  serviceDate,
  startTime,
}) => {
  const { subject, html } = refundProcessedEmailTemplate({
    customerName,
    providerName,
    refundAmount,
    serviceDate,
    startTime,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
