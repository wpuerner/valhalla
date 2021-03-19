import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private stateChangeUrl: string = 'https://e912jlcdgc.execute-api.us-east-2.amazonaws.com/Prod/valhalla/state/';

  constructor(private http: HttpClient) {}

  public startServer() {
    return this.http.post(this.stateChangeUrl + 'start', null);
  }

  public stopServer() {
    return this.http.post(this.stateChangeUrl + 'stop', null);

  }
}
