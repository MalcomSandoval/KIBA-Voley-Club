import { useState } from 'react';

interface PaymentReportData {
  payment: any;
  player: any;
}

export function usePaymentReport() {
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<PaymentReportData | null>(null);

  const generateReport = (payment: any, player: any) => {
    setReportData({ payment, player });
    setShowReport(true);
  };

  const closeReport = () => {
    setShowReport(false);
    setReportData(null);
  };

  const downloadPDF = async () => {
    if (!reportData) return;

    try {
      // Importar dinámicamente las librerías
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      const element = document.getElementById('payment-report');
      if (!element) return;

      // Configurar opciones para mejor calidad
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Agregar primera página
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generar nombre del archivo
      const fileName = `Recibo_${reportData.player.name.replace(/\s+/g, '_')}_${reportData.payment.month}_${reportData.payment.year}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Intente usar la opción de imprimir.');
    }
  };

  const getPdfBase64 = async (): Promise<string | null> => {
    if (!reportData) return null;

    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Obtener el elemento que queremos renderizar a PDF
      const element = document.getElementById('payment-report');
      if (!element) return null;

      // Configurar html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; 
      const pageHeight = 295; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Convertir PDF a string en formato base64 sin prefijos URI
      const dataUri = pdf.output('datauristring');
      return dataUri.split('base64,')[1];
    } catch (error) {
      console.error('Error generating PDF Base64:', error);
      return null;
    }
  };

  return {
    showReport,
    reportData,
    generateReport,
    closeReport,
    downloadPDF,
    getPdfBase64
  };
}