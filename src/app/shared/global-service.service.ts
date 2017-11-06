import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class GlobalService {
  public jsonFile: string = 'assets/site.json';
  public songFolder: string = 'assets/sounds/';
  
  public trackListLoaded$: EventEmitter<boolean> = new EventEmitter();
  public songSelected$: EventEmitter<any> = new EventEmitter();
  public songNavigated$: EventEmitter<string> = new EventEmitter();
  public songStarted$: EventEmitter<boolean> = new EventEmitter();
  public resetPlayer$: EventEmitter<boolean> = new EventEmitter();
  
  public songsInfo: Array<any> = [];
  public curTrack: number = 0;
  public totalTrack: number = 0;
  public frequencyData: Uint8Array; // for visualiser

  constructor() { }

  requestInterval(callback, delay) {
    let dateNow = Date.now,
      requestAnimation = window.requestAnimationFrame,
      start = dateNow(),
      stop,
      intervalFunc = function() {
        dateNow()-start < delay || (start+=delay, callback());
        stop || requestAnimation(intervalFunc)
      }
    requestAnimation(intervalFunc);
    return {
      clear: function() { stop = 1 }
    }
  }

}
