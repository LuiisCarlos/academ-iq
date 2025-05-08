import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-course-player',
  templateUrl: 'course-player.component.html'
})
export class CoursePlayerComponent implements OnChanges {
  @Input() videoSrc : string | null = null;
  @Input() autoplay : boolean       = false;
  isLoading : boolean       = false;
  error     : string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc']) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.error = null;

    if (!this.videoSrc) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Forzar recarga del elemento de video
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  onVideoLoaded(): void {
    this.isLoading = false;
    this.error = null;
  }

  onVideoError(): void {
    this.isLoading = false;
    this.error = 'Failed to load the video. Check the URL.';
  }

  reloadVideo(): void {
    this.loadData();
  }

}