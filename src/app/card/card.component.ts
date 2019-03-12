import { Component, OnInit } from '@angular/core';
import { Sample } from '../classes/sample';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() sample: Sample;

  constructor() { }

  ngOnInit() {
  }

}
