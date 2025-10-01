import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verificación de cuenta - Trivia App",
    text: `Tu código de verificación es: ${code}`,
    html: `
      <h2>Verificación de cuenta - Trivia App</h2>
      <p>Tu código de verificación es:</p>
      <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 24px;">${code}</h3>
      <p>Este código expirará en 10 minutos.</p>
    `,
  });
}
