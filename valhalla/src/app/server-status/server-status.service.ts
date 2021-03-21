import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  statusUrlPrefix: string = 'http://localhost:3000/valhalla/servers/';

  statusUrlPostfix: string = "/state"

  constructor(private http: HttpClient) { }

  public getServerStatus(serverId: string) {
    return this.http.get(this.statusUrlPrefix + serverId + this.statusUrlPostfix);
  }
}
