import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  returnUrl;
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { 
    
  }

  ngOnInit() {
    
  }

  navigate(url) {
    this.returnUrl = this.route.snapshot.queryParams[url] || '/dashboard';
    this.router.navigateByUrl(url);
  }
}
