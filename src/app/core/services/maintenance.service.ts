import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Static-build stub. There is no backend maintenance flag, so the site is
 * always "live". Kept with the same public surface for compatibility.
 */
@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly enabled$ = new BehaviorSubject<boolean>(false);

  get maintenanceEnabled$() { return this.enabled$.asObservable(); }
  async refreshStatus(): Promise<boolean> { return false; }
  async setEnabled(_enabled: boolean): Promise<void> { /* no-op */ }
}
