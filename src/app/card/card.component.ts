import { Component, OnInit, Input } from '@angular/core';
import { Sample } from '../classes/sample';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  _name;
  _sample;
  @Input()
  set sample(sample: Sample) {
    this._sample = sample;
  }

  constructor() { }

  ngOnInit() {
    this._name = this._sample.name;
  }

}
