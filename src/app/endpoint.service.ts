import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {

  public baseUrl = environment.apiEndpoint;
  public endpoints: { [endpoint: string]: string } = {
    login: '/api/login',
    register: '/api/register',
    users: '/api/users',
    user: '/api/users/:id',
    samples: '/api/samples',
    sample: '/api/samples/:id',
    sample_download: '/api/samples/:id/audio'
  };

  constructor() {}

  generateUrl(endpoint: string, id?: number | string): string {
    // generate base url
    let url = this.baseUrl + this.endpoints[endpoint];
    // if id provided, find and replace it
    if (!isNullOrUndefined(id)) {
      if (url.indexOf(':id') !== -1) {
        url = url.replace(':id', id.toString());
      } else {
        url = url + '/' + id;
      }
    }
    return url;
  }
}
