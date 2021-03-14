import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  private statusUrl: string = 'https://6ds7reiz2e.execute-api.us-east-2.amazonaws.com/Prod/valhalla/state';

  constructor(private http: HttpClient) { }

  public getServerStatus() {
    return this.http.get(this.statusUrl);
  }
}
