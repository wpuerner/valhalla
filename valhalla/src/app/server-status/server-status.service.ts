import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment }  from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  
  statusUrlPostfix: string = "/state"

  constructor(private http: HttpClient) { }

  public getServerStatus(serverId: string) {
    return this.http.get(environment.apiUrl + "/valhalla/servers/" + serverId + "/state");
  }
}
