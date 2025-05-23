import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';

import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { ConfigService } from '../config/config.service';
import { Enrollment } from '../../models/user-course.models';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private readonly timeFmt: TimeFormatPipe = inject(TimeFormatPipe);
  private readonly dateFmt: DateFormatPipe = inject(DateFormatPipe);
  private readonly config: ConfigService = inject(ConfigService);

  protected readonly apiUrl: string = this.config.getApiUrl();

  logoUrl: string = 'https://res.cloudinary.com/duu4u98gb/image/upload/v1747091207/academiq-logo_gyofsk.png';
  signatureUrl: string = 'https://res.cloudinary.com/duu4u98gb/image/upload/v1747091208/academiq-ceo-signature_uqqjic.png';
  watermarkText: string = 'IQ.';

  async generate(data: {
    userName: string;
    userDni: string;
    enrollment: Enrollment;
  }): Promise<void> {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const logoImage = await fetch(this.logoUrl);
    const logoBlob = await logoImage.blob();
    const logoImageBase64 = await this.blobToBase64(logoBlob);

    const signatureImage = await fetch(this.signatureUrl);
    const signatureBlob = await signatureImage.blob();
    const signatureImageBase64 = await this.blobToBase64(signatureBlob);

    const pageWidth = 297;
    const pageHeight = 210;
    const navyColor = [15, 23, 42];

    // ! Fondo blanco
    doc.setFillColor(255, 255, 255);

    doc.rect(0, 0, 297, 210, 'F');

    // ! Recuadro arriba izquierda
    let frameSize = 70;
    let borderWidth = 7

    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(navyColor[0], navyColor[1], navyColor[2]);
    doc.setLineWidth(borderWidth);

    doc.rect((borderWidth / 2), (borderWidth / 2), frameSize, frameSize);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(borderWidth + 1);
    frameSize = (frameSize - borderWidth);

    doc.rect((borderWidth + (borderWidth / 2)), (borderWidth + (borderWidth / 2)), frameSize, frameSize);

    // ! Recuadro abajo derecha
    frameSize = 70
    borderWidth = 7
    doc.setLineWidth(borderWidth);
    doc.setDrawColor(navyColor[0], navyColor[1], navyColor[2]);

    doc.rect(pageWidth - (frameSize + borderWidth / 2), pageHeight - (frameSize + borderWidth / 2), frameSize, frameSize);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(borderWidth + 1);
    frameSize = frameSize - borderWidth;

    doc.rect(pageWidth - (frameSize + (borderWidth + (borderWidth / 2))), pageHeight - (frameSize + (borderWidth + (borderWidth / 2))), frameSize, frameSize);

    // ! Logo y Nombre de la empresa
    let currentY = 25;
    let currentX = 35;

    if (this.logoUrl)
      doc.addImage(logoImageBase64, 'PNG', currentX, currentY, 32, 32);

    currentY += 20;
    currentX += 40;

    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Academ-IQ', currentX, currentY, { align: 'left' });

    // ! Detalles del usuario
    currentY += 30;
    currentX = 30;

    doc.setFontSize(16);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');

    doc.text(`Academ-IQ certifies that`, currentX, currentY, { align: 'left' });

    currentY += 14;

    doc.setFontSize(26);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');

    doc.text(data.userName, currentX, currentY, { align: 'left' });

    currentY += 10;

    doc.setFontSize(18);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');

    doc.text('DNI', currentX, currentY, { align: 'left' });

    const dniTextWidth = doc.getTextWidth('DNI');

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');

    doc.text(data.userDni, currentX + (dniTextWidth + 5), currentY, { align: 'left' });

    currentY += 16;

    doc.setFontSize(16);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');

    doc.text(`Has successfully completed the course`, currentX, currentY, { align: 'left' });

    currentY += 16;

    doc.setFontSize(26);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');

    doc.text(data.enrollment.course.title, currentX, currentY, { align: 'left' });

    // ! Marca de agua

    doc.setFontSize(300);
    doc.setTextColor(245, 245, 245);
    doc.text(this.watermarkText, pageWidth - 20, currentY + 80, { align: 'center', angle: 45 });

    // ! Fila del footer
    let footerY = pageHeight - 40;

    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('Course duration', 30, footerY, { align: 'left' });
    doc.text('Completion date', 80, footerY, { align: 'left' });

    if (this.signatureUrl)
      doc.addImage(signatureImageBase64, 'PNG', pageWidth - 96, footerY - 48, 72, 72);

    doc.text('Academ-IQ CEO', pageWidth - 80, footerY, { align: 'left' });

    footerY += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(this.timeFmt.transform(data.enrollment.course.duration, 'custom', 'H Hours'), 32, footerY, { align: 'left' });
    doc.text(this.dateFmt.transform(data.enrollment.completedAt, 'custom4'), 82, footerY, { align: 'left' });
    doc.text('Luis Carlos Caicedo', pageWidth - 78, footerY, { align: 'left' });

    // ! Contenido del curso
    //doc.addPage('a4', 'portrait');

    doc.save(`certificate_iq_${data.enrollment.course.title.toLowerCase().replace(' ', '_')}.pdf`);
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

}
