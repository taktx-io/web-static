import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Static-site contact service.
 *
 * There is no backend to receive form submissions, so instead of POSTing to an
 * API we compose a pre-filled email and hand it off to the visitor's mail
 * client via a `mailto:` link. The public signature is unchanged so the
 * contact component keeps working without modification.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly recipient = 'eric.hendriks@taktx.io';

  sendMessage(payload: ContactMessage): Observable<void> {
    const subject = payload.subject?.trim() || 'Website contact';
    const lines = [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      '',
      payload.message
    ].filter(l => l !== null) as string[];

    const href =
      `mailto:${this.recipient}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(lines.join('\n'))}`;

    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
    return of(void 0);
  }
}
