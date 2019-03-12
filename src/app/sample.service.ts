import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class SampleService {

  constructor(private http: HttpClient, private userService: UserService, private endpointService: EndpointService) {}

  public createSample(sample: File, data: Object): Observable<any> {
    // add sample to form data
    const formData: FormData = new FormData();
    formData.append('sample', sample, sample.name);

    // for every data key, add to form data
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    // post data to api
    return this.http.post(this.endpointService.generateUrl('samples'), formData);
  }

  public getSample(id: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('sample', id));
  }

  public downloadSample(id: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('sample_download', id));
  }
}
