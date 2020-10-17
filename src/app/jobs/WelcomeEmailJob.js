import Mail from "../../lib/Mailer";

class WelcomeEmailJob {
  get key() {
    return "WelcomeEmail";
  }

  async handle({ data }) {
    const { email, name } = data;

    Mail.send({
      to: email,
      subject: "Bem-vindo(a)",
      text: `Olá ${name}, seja bem-vindo(a) ao nosso sistema`,
    });
  }
}
export default new WelcomeEmailJob();