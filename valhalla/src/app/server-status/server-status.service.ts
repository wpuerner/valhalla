import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment }  from './../../environments/environment';
import { ServerStatus } from './server-status';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {

  statusUrlPostfix = '/state';

  constructor(private http: HttpClient) { }

  public getServerStatus(serverId: string) {
    return this.http.get(environment.apiUrl + '/valhalla/servers/' + serverId + '/state');
  }
}
