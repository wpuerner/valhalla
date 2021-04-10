import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ServerStatus } from './server-status';
import { ServerStatusService } from './server-status.service';

@Component({
  selector: 'app-server-status',
  templateUrl: './server-status.component.html',
  styleUrls: ['./server-status.component.css'],
  providers: [ ServerStatusService ]
})
export class ServerStatusComponent {
  serverStatus$: Observable<ServerStatus>;

  serverId$: Observable<string>;

  form: FormGroup;

  servers = [
    {
      name: 'MikeJohnstonsHouse',
      serverId: '1'
    }, {
      name: 'Test Server',
      serverId: '2'
    }
  ];

  constructor(private serverStatusService: ServerStatusService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      selected: ''
    });
    this.form.controls.selected.setValue('1', {onlySelf: true});

    this.serverId$ = this.form.controls.selected.valueChanges.pipe(startWith(this.form.controls.selected.value));

    this.serverStatus$ = this.serverId$.pipe(
      switchMap((serverId) => this.serverStatusService.getServerStatus(serverId)),
      map((data) => data as ServerStatus)
    );
  }
}
