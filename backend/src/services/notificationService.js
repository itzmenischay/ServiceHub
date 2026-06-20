import Message from "../models/Message.js";
import Notifications from "../models/Notification.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
}) => {
  return await Notificaiton.create({
    recipient,
    sender,
    type,
    title,
    message,
  });
};
