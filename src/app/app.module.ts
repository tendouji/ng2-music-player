import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { GlobalService } from './shared/global-service.service';

import { AppComponent } from './app.component';
import { SongListComponent } from './song-list/song-list.component';
import { PlayerComponent } from './player/player.component';
import { TimeConverterPipe } from './shared/time-converter/time-converter.pipe';
import { VisualiserComponent } from './visualiser/visualiser.component';

@NgModule({
  declarations: [
    AppComponent,
    SongListComponent,
    PlayerComponent,
    TimeConverterPipe,
    VisualiserComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [GlobalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
