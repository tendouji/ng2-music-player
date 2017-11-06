import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { GlobalService } from '../shared/global-service.service';
import { Http } from '@angular/http';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss']
})
export class SongListComponent implements OnInit {
  @ViewChild('songList') songListComponent: ElementRef;

  songListArr: Array<any> = [];
  totalTrack: number = 0;
  curTrack: number = 0;
  
  constructor(
    private globalService: GlobalService, 
    private http: Http,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.globalService.resetPlayer$.subscribe(data => {
      this.removeActiveTracks();
    });
    this.globalService.songNavigated$.subscribe(data => {
      this.navigateSong(data);
    });
    this.loadTrackList();
  }
  
  loadTrackList() {
    this.http.get(this.globalService.jsonFile)
      .subscribe(success => {
        this.songListArr = success.json().songs;
        this.globalService.songsInfo = this.songListArr;
        let songListData = this.songListArr;
    
          for(let i in songListData) {
            let srcUrl = this.globalService.songFolder + songListData[i]['track-file'] + '.mp3';
            this.getDuration(srcUrl, length => {
              songListData[i].duration = length;
            });
          }
    
          this.totalTrack = songListData.length;
          this.globalService.totalTrack = this.totalTrack;
          this.globalService.trackListLoaded$.emit(true);
      });
  }

  getDuration(src, cb) {
    var audio = new Audio();
    if(audio.readyState >= 2) {
      cb(audio.duration);
    } else {
      audio.addEventListener('loadedmetadata', () => cb(audio.duration));
    }
    audio.src = src;
  }
  
  selectSong(e) {
    e.preventDefault();
    let target = e.target, 
      trackTitle = target.dataset.track,
      curList = target.parentNode;
    
    this.curTrack = (target.getAttribute('href')).replace('#','');

    this.globalService.curTrack = this.curTrack;
    this.globalService.songSelected$.emit(trackTitle);

    this.highlightTrack(curList);
  }

  navigateSong(dir) {
    if(dir == 'nextSong') {
      if(+this.globalService.curTrack + 1 <= +this.globalService.totalTrack) {
        this.curTrack = +this.globalService.curTrack + 1;
      }
    }
    if(dir == 'previousSong') {
      if(+this.globalService.curTrack - 1 > 0) {
        this.curTrack = +this.globalService.curTrack - 1;
      }
    }
    
    let target = this.songListComponent.nativeElement.querySelector('a[href="#' + this.curTrack + '"]'),
      trackTitle = target.dataset.track,
      curList = target.parentNode;
  
    this.globalService.curTrack = this.curTrack;
    this.globalService.songSelected$.emit(trackTitle);

    this.highlightTrack(curList);
  }

  removeActiveTracks() {
    let activeList = this.songListComponent.nativeElement.querySelectorAll('.active');
    
    if(activeList.length > 0) {
      for(let i=0; i<activeList.length; i++) {
        this.renderer.removeClass(activeList[i], 'active');
      }
    }
  }

  highlightTrack(list: HTMLElement) {
    this.removeActiveTracks();
    this.renderer.addClass(list, 'active');
  }  
}
