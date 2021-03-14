import { Component, OnInit } from '@angular/core';
import { ServerStatus } from './server-status';
import { ServerStatusService } from './server-status.service';

@Component({
  selector: 'app-server-status',
  templateUrl: './server-status.component.html',
  styleUrls: ['./server-status.component.css'],
  providers: [ ServerStatusService ]
})
export class ServerStatusComponent implements OnInit {
  private isServerAvailable: boolean = false;

  constructor(private serverStatusService: ServerStatusService) { }

  ngOnInit() {
    this.serverStatusService.getServerStatus().subscribe((data: ServerStatus) => {
      this.isServerAvailable = data.isServerAvailable;
    });
  }

}
