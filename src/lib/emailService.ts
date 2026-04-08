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
      const errorMessage = typeof data.error === 'string' ? data.error : (data.error?.message || data.message || responseText.substring(0, 100) || 'Error al enviar el correo');
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}
