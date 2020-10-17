import "dotenv/config";

export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: "e0863271be0c38",
    pass: "9fbe40d7b321e8",
  },
  default: { from: "Sistema <naoresponda@exemplo.com>" },
};
