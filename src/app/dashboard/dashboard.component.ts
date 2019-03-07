import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  audio = new Audio();
  constructor() {
   }

  ngOnInit() {
    this.createSound();
    this.audio.load();
  }

  playNoise() {
    this.audio.play();
  }

  createSound() {
    this.audio.src = "../../assets/song.mp3";
  }

}
