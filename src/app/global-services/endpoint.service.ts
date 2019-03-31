import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {

  public baseUrl = environment.apiEndpoint;
  public endpoints: { [endpoint: string]: string } = {
    login: '/api/login',
    register: '/api/register',
    logout: '/api/logout',
    users: '/api/users',
    user: '/api/users/:id',
    user_samples: '/api/user/:id/samples',
    user_subscribers: '/api/user/:id/subscribers',
    user_subscriptions: '/api/user/:id/subscriptions',
    samples: '/api/samples',
    sample: '/api/samples/:id',
    user_subscriber: '/api/user/:id/subscribers/:id2',
    sample_download: '/api/samples/:id/audio'
  };

  constructor() {}

  generateUrl(endpoint: string, id?: number | string, id2?: number | string): string {
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
    if (!isNullOrUndefined(id2)) {
      if (url.indexOf(':id2') !== -1) {
        url = url.replace(':id2', id2.toString());
      } else {
        url = url + '/' + id2;
      }
    }
    return url;
  }
}
