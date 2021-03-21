import { Component, Input, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { ServerStatus } from './server-status';
import { ServerStatusService } from './server-status.service';

@Component({
  selector: 'app-server-status',
  templateUrl: './server-status.component.html',
  styleUrls: ['./server-status.component.css'],
  providers: [ ServerStatusService ]
})
export class ServerStatusComponent implements OnInit {
  @Input() serverId: string;
  
  isServerAvailable: boolean = false;

  serverIp: string = '';

  numPlayers: number = 0;

  serverName: string = '';

  mapName: string = '';

  constructor(private serverStatusService: ServerStatusService) { }

  ngOnInit() {
    this.serverStatusService.getServerStatus(this.serverId).subscribe((data: ServerStatus) => {
      this.isServerAvailable = data.isServerAvailable;
      if (this.isServerAvailable) {
        this.serverIp = data.serverIp;
        this.numPlayers = data.numPlayers;
        this.serverName = data.name;
        this.mapName = data.map;
      }
    });
  }

}
