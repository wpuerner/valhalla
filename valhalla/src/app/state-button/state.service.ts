import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(private http: HttpClient) {}

  public startServer(serverId: string) {
    return this.http.post(environment.apiUrl + "/valhalla/servers/" + serverId + "/state/start", null);
  }

  public stopServer(serverId: string) {
    return this.http.post(environment.apiUrl + "/valhalla/servers/" + serverId + "/state/stop", null);

  }
}
