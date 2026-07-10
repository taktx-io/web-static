import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Minimal, Keycloak-free profile shape kept for template compatibility. */
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Static-build stub for the former Keycloak-backed AuthService.
 * The static site has no auth server, so everything resolves to the
 * "logged-out, non-admin" state and login/logout are no-ops.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userProfile = new BehaviorSubject<UserProfile | null>(null);

  public async init(): Promise<boolean> { return true; }
  public getUserProfile(): Observable<UserProfile | null> { return this.userProfile.asObservable(); }
  public login(_redirectUri?: string): void { /* no-op */ }
  public loginWithProvider(_p: string, _r?: string): void { /* no-op */ }
  public register(_redirectUri?: string): void { /* no-op */ }
  public logout(_redirectUri?: string): void { /* no-op */ }
  public isLoggedIn(): Promise<boolean> { return Promise.resolve(false); }
  public hasRole(_role: string): Promise<boolean> { return Promise.resolve(false); }
  public isAdmin(): Promise<boolean> { return Promise.resolve(false); }
  public async getToken(): Promise<string | null> { return null; }
}
