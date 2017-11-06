import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { GlobalService } from '../shared/global-service.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @ViewChild('songControl') songControlRef: ElementRef;
  @ViewChild('audioPlayer') audioPlayerRef: ElementRef;

  curSongInfo: Array<any> = [];
  frameID: any;
  trackTitle: string;
  trackFile: string;
  audioPlayer: HTMLAudioElement;
  playButton: HTMLElement;
  previousButton: HTMLElement;
  nextButton: HTMLElement;
  audioMP3Tag: HTMLElement;
  audioOGGTag: HTMLElement;
  progressPie: HTMLElement;
  progressBarLeft: HTMLElement;
  progressBarRight: HTMLElement;

  // for visualiser
  context: AudioContext = new AudioContext();
  audioSrc: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
  frequencyData: Uint8Array;
  // for visualiser
  
  constructor(
    private renderer: Renderer2, 
    private globalService: GlobalService
  ) { }

  ngOnInit() {
    this.playButton = this.songControlRef.nativeElement.querySelector('#play');
    this.previousButton = this.songControlRef.nativeElement.querySelector('#previousSong');
    this.nextButton = this.songControlRef.nativeElement.querySelector('#nextSong');
    this.progressPie = this.songControlRef.nativeElement.querySelector('.pie');
    this.progressBarLeft = this.songControlRef.nativeElement.querySelector('.left-side');
    this.progressBarRight = this.songControlRef.nativeElement.querySelector('.right-side');
    
    this.audioPlayer = this.audioPlayerRef.nativeElement;
    this.audioMP3Tag = <HTMLElement> this.audioPlayer.querySelector('#audioPlayerMP3');
    this.audioOGGTag = <HTMLElement> this.audioPlayer.querySelector('#audioPlayerOGG');

    this.audioSrc = this.context.createMediaElementSource(this.audioPlayer);
    this.analyser = this.context.createAnalyser();
    this.analyser.minDecibels = -150;
    this.analyser.maxDecibels = -20;
    this.analyser.fftSize = 512; // generate 256 bar

    this.audioSrc.connect(this.analyser);
    this.audioSrc.connect(this.context.destination);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.globalService.trackListLoaded$.subscribe(data => {
      if(data){
        this.initPlayer();
        this.resetPlayer();
      }
    });
    this.globalService.songSelected$.subscribe(data => {
      this.trackTitle = data;
      this.hasSound();
    });
    
  }

  initPlayer() {
    this.generateProgress(0);  
    // $('#previewAllLink').on('click', previewAllTracks);
  }
  
  navigateSong(e) {
    e.preventDefault();
    let target = e.currentTarget;
    if( target.classList.contains('disabled') ) 
      return;
    let dir = target.getAttribute('id');
    this.globalService.songNavigated$.emit(dir);
  }
  
  checkNextSong() {
    this.renderer.removeClass(this.playButton, 'playing');
    this.resetPlayer();
    if(this.globalService.curTrack < this.globalService.totalTrack) {
      this.nextButton.click();
    }
  }

  hasSound() {
    this.renderer.removeClass(this.songControlRef.nativeElement, 'no-sound');
    this.trackFile = this.globalService.songFolder + this.trackTitle;

    this.renderer.setAttribute(this.audioMP3Tag, 'src', this.trackFile + '.mp3');
    this.renderer.setAttribute(this.audioOGGTag, 'src', this.trackFile + '.ogg');

    this.audioPlayer.load();
    this.resetPlayer();
    this.playAudio(new MouseEvent('click'));
  }

  resetPlayer() {
    if(this.audioPlayer) this.audioPlayer.pause();
    cancelAnimationFrame(this.frameID);
    this.renderer.removeClass(this.playButton, 'playing');
    this.renderer.setStyle(this.progressPie, 'clip', 'rect(0, 100px, 100px, 50px)');
    this.renderer.setStyle(this.progressBarRight, 'display', 'none');
    this.renderer.setStyle(this.progressBarRight, 'transform', 'rotate(0deg)');
    this.renderer.setStyle(this.progressBarLeft, 'transform', 'rotate(0deg)');
    this.globalService.resetPlayer$.emit(true);
  }

  playAudio(e) {
    e.preventDefault();
    if( !this.playButton.classList.contains('playing') ) {
      this.renderer.addClass(this.playButton, 'playing');
      this.frameID = requestAnimationFrame(() => this.loopFrame());
      this.audioPlayer.play();
      this.populateSongInfo(+this.globalService.curTrack);
      setTimeout(() => this.globalService.songStarted$.emit(true), 100);
      
      if(this.globalService.curTrack > 1) 
        this.renderer.removeClass(this.previousButton, 'disabled');
      else
        this.renderer.addClass(this.previousButton, 'disabled');

      if(this.globalService.curTrack < this.globalService.totalTrack) 
        this.renderer.removeClass(this.nextButton, 'disabled');
      else
        this.renderer.addClass(this.nextButton, 'disabled');

    } else {
      this.audioPlayer.pause();
      cancelAnimationFrame(this.frameID);
      this.globalService.songStarted$.emit(false);
      
      this.renderer.removeClass(this.playButton, 'playing');   
      this.resetPlayer();
      this.populateSongInfo(false);
    }
  }

  loopFrame() { 
    let curAudioTime = this.audioPlayer.currentTime,
      totalAudioTime = this.audioPlayer.duration;
    let percentage = Math.round( (curAudioTime / totalAudioTime) * 100 );
    this.generateProgress(percentage);
    if( percentage >= 100 ) {
      cancelAnimationFrame(this.frameID);
      //reset play button will be done in ended listener
      return;
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.globalService.frequencyData = this.frequencyData;

    this.frameID = requestAnimationFrame(() => this.loopFrame());
  }

  generateProgress(n) {
    if(n <= 50) 
      this.renderer.setStyle(this.progressBarRight, 'display', 'none');
    if(n > 50) {
      this.renderer.setStyle(this.progressPie, 'clip', 'rect(auto, auto, auto, auto)');
      this.renderer.setStyle(this.progressBarRight, 'display', 'block');
      this.renderer.setStyle(this.progressBarRight, 'transform', 'rotate(180deg)');
    }
    var rot = n * 3.6;
    this.renderer.setStyle(this.progressBarLeft, 'transform', 'rotate(' + rot + 'deg)');
  }

  populateSongInfo(val: number | boolean) {
    if(typeof val == 'number') {
      this.curSongInfo = this.globalService.songsInfo[val-1];
      return;
    } 
    this.curSongInfo = [];
  }
}
