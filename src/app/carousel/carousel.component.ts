import { Component, OnInit, Input } from '@angular/core';
import { Sample } from '../classes/sample';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  _displayCache;
  @Input()
  set inputCache(inputCache: Array<Sample>) {
    this._displayCache = inputCache;
  };

  constructor() {

  }

  ngOnInit() {

  }

}
