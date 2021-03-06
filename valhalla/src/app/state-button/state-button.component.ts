import { Component, Input, OnInit } from '@angular/core';
import { StateService } from './state.service';

@Component({
  selector: 'app-state-button',
  templateUrl: './state-button.component.html',
  styleUrls: ['./state-button.component.css'],
  providers: [ StateService ]
})
export class StateButtonComponent implements OnInit {
  @Input() isServerAvailable: boolean;

  @Input() serverId: string;

  constructor(private stateService: StateService) { }

  ngOnInit() {
  }

  startServer() {
    this.stateService.startServer(this.serverId).subscribe();
  }

  stopServer() {
    this.stateService.stopServer(this.serverId).subscribe();
  }

}
