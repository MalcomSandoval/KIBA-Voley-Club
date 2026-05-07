export async function sendPaymentEmail(payment: any, player: any, pdfBase64: string) {
  try {
    const response = await fetch('/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: player.email,
        playerName: player.name,
        amount: payment.amount,
        period: `${payment.month} ${payment.year}`,
        paymentId: payment.id,
        status: payment.status,
        dueDate: payment.due_date,
        pdfBase64: pdfBase64
      }),
    });

    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Si no es JSON, guardar el texto tal cual
      data = { error: responseText };
    }

    if (!response.ok) {
      const errorMessage = data.error || responseText.substring(0, 100) || 'Error al enviar el correo';
      if (errorMessage.includes('Faltan las credenciales')) {
        throw new Error('Configuración incompleta: Por favor, configura tu correo y contraseña en el archivo .env');
      }
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error enviando email:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor de correos. Asegúrate de que el servidor de desarrollo esté corriendo.');
    }
    throw error;
  }
}
