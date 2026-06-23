import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
}) => {
  const notification =  await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
  });
};
