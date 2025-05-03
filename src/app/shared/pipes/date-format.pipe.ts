import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | undefined, format: string = 'medium'): string {
    if (!value) return '';
    if (value === undefined) return '';

    try {
      const [datePart, timePart] = value.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);

      const date = new Date(year, month - 1, day, hours, minutes, seconds);

      if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
      }

      switch (format.toLowerCase()) {
        case 'short':
          return this.formatDate(date, { dateStyle: 'short', timeStyle: 'short' });
        case 'medium':
          return this.formatDate(date, { dateStyle: 'medium', timeStyle: 'medium' });
        case 'long':
          return this.formatDate(date, { dateStyle: 'long', timeStyle: 'long' });
        case 'full':
          return this.formatDate(date, { dateStyle: 'full', timeStyle: 'full' });
        case 'iso':
          return date.toISOString();
        case 'date':
          return this.formatDate(date, { dateStyle: 'long' });
        case 'time':
          return this.formatDate(date, { timeStyle: 'medium' });
        case 'custom1':
          return this.formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' }, 'es-ES').replace(/\//g, '-');
        case 'custom2':
          return this.formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }, 'en-US').replace(/,/g, '');
        case 'custom3':
          return this.formatDate(date, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }, 'en-US');
        case 'custom4':
          return this.formatDate(date, { month: 'long', day: 'numeric', year: 'numeric' }, 'en-US');
        default:
          return this.formatDate(date, { dateStyle: 'medium', timeStyle: 'medium' });
      }
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return value;
    }
  }

  private formatDate(date: Date, options: Intl.DateTimeFormatOptions, locale: string = 'en-US'): string {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

}