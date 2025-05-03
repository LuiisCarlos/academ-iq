import { Pipe, PipeTransform } from '@angular/core';
import { Rating } from '../../core/models/course.models';

@Pipe({
  name: 'ratingStats',
  standalone: true
})
export class RatingStatsPipe implements PipeTransform {
  transform(ratings: Rating[]): {
    average : number,
    total   : number,
    distribution: {
      stars      : number,
      count      : number,
      percentage : number }[]
  } {
    if (!ratings || ratings.length === 0) {
      return {
        average : 0,
        total   : 0,
        distribution: Array(5).fill(0).map((_, i) => ({
          stars      : 5 - i,
          count      : 0,
          percentage : 0
        }))
      };
    }

    const total   : number = ratings.length;
    const sum     : number = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const average : number = sum / total;

    // Calcular distribución por estrellas
    const distribution = Array(5).fill(0).map((_, i) => {
      const stars = 5 - i;
      const count = ratings.filter(r => r.rating === stars).length;
      return {
        stars,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });

    return { average, total, distribution };
  }
}