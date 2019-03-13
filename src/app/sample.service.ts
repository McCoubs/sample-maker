import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  public getSamples(limit?: number, tags?: Array<string>, genres?: Array<string>): Observable<any> {
    let params= new HttpParams();
    if (limit) {
      params = params.append('limit', limit.toString());
    }
    if (tags && tags.length > 0) {
      params = params.append('tags', tags.join(','));
    }
    if (genres && genres.length > 0) {
      params = params.append('genres', genres.join(','));
    }
    return this.http.get(this.endpointService.generateUrl('samples'), {params: params});
  }

  public downloadSample(id: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('sample_download', id));
  }
}
