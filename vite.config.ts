import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'handle-email-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/sendEmail' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              
              req.on('end', async () => {
                try {
                  const { email, playerName, amount, period, paymentId, status, dueDate, pdfBase64 } = JSON.parse(body);

                  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
                    throw new Error('Faltan las credenciales de correo (EMAIL_USER o EMAIL_PASS) en el archivo .env');
                  }

                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: env.EMAIL_USER,
                      pass: env.EMAIL_PASS,
                    },
                  });

                  const mailOptions = {
                    from: `"KIBA Volleyball" <${env.EMAIL_USER}>`,
                    to: email,
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

                  const info = await transporter.sendMail(mailOptions);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ data: info }));
                } catch (error: any) {
                  console.error('Error enviando email desde Vite:', error);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: error.message }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
