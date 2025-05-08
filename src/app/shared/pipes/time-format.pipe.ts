import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string, format: 'short' | 'long' | 'custom' = 'short', customFormat?: string): string {
    if (!value) return '';

    // Dividir el string en horas, minutos y segundos
    const timeParts = value.split(':');
    const hours = timeParts.length > 0 ? Number(timeParts[0]) : 0;
    const minutes = timeParts.length > 1 ? Number(timeParts[1]) : 0;

    // Validación
    if (isNaN(hours) || isNaN(minutes)) return value;

    switch (format) {
      case 'long':
        return this.formatLong(hours, minutes);
      case 'custom':
        return this.formatCustom(hours, minutes, customFormat);
      case 'short':
      default:
        return this.formatShort(hours, minutes);
    }
  }

  private formatShort(hours: number, minutes: number): string {
    const parts = [];
    if (hours > 0) parts.push(`${hours}H`);
    if (minutes > 0) parts.push(`${minutes}M`);

    return parts.length > 0 ? parts.join(' ') : '0M'; // Default para duración cero
  }

  private formatLong(hours: number, minutes: number): string {
    const parts = [];
    if (hours > 0) parts.push(`${hours} Hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} Minute${minutes !== 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(' ') : '0 Minutes'; // Default para duración cero
  }

  private formatCustom(hours: number, minutes: number,  format?: string): string {
    if (!format) return this.formatShort(hours, minutes);

    return format
      .replace('H', hours.toString())
      .replace('M', minutes.toString())
      .replace('Hours', `Hour${hours !== 1 ? 's' : ''}`)
      .replace('Minutes', `Minute${minutes !== 1 ? 's' : ''}`)
  }
}