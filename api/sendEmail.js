import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, playerName, amount, period, paymentId, status, dueDate, pdfBase64 } = req.body;

    // Configuración del servidor de salida de correo (SMTP Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Tu correo en .env
        pass: process.env.EMAIL_PASS, // Tu contraseña de app en .env
      },
    });

    // Opciones del correo
    const mailOptions = {
      from: `"KIBA Volleyball" <${process.env.EMAIL_USER}>`,
      to: email, // El correo de cualquier jugador enviado desde el cliente
      subject: `Comprobante de Pago - ${period} - KIBA Volleyball`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #7c3aed;">Hola ${playerName},</h2>
          <p>Adjuntamos el comprobante de pago correspondiente al per&iacute;odo <strong>${period}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px;"><strong>Recibo No.:</strong> #${paymentId.slice(-8).toUpperCase()}</li>
              <li style="margin-bottom: 8px;"><strong>Monto:</strong> $${amount.toLocaleString('es-CO')}</li>
              <li style="margin-bottom: 8px;"><strong>Vencimiento:</strong> ${new Date(dueDate).toLocaleDateString('es-CO')}</li>
              <li><strong>Estado:</strong> <span style="background-color: ${status === 'paid' ? '#dcfce7' : '#fef08a'}; color: ${status === 'paid' ? '#166534' : '#854d0e'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${status === 'paid' ? 'PAGADO' : 'PENDIENTE'}</span></li>
            </ul>
          </div>
          <p>Encuentra el detalle completo en el documento PDF adjunto.</p>
          <br/>
          <p style="font-size: 14px; color: #666;">Atentamente,<br/><strong>Equipo KIBA Volleyball</strong></p>
        </div>
      `,
      attachments: pdfBase64 ? [
        {
          filename: `comprobante_${paymentId.slice(-8)}.pdf`,
          content: pdfBase64,
          encoding: 'base64'
        }
      ] : []
    };

    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ data: info });

  } catch (error) {
    console.error('Error in nodemailer:', error);
    return res.status(500).json({ error: error.message });
  }
}
