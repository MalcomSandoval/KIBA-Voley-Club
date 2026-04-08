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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al enviar el correo');
    }
    
    return data;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}
