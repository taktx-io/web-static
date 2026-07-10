import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService, ContactMessage } from '../../services/contact.service';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;
  isSending = false;
  sendSuccess = false;
  sendError = '';
  private formStartTs = Date.now();

  constructor(private fb: FormBuilder, private contactService: ContactService, private readonly seo: SeoService) {
    this.seo.update({
      title: 'Contact TaktX — Get in Touch',
      description: 'Contact the TaktX team with questions, support requests, or partnership inquiries. We respond within one business day.',
      url: '/contact'
    });
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$')]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      // Honeypot (should remain empty)
      hp: ['']
    });
  }

  ngOnInit(): void {
    this.formStartTs = Date.now();
  }

  onSubmit() {
    this.submitted = true;
    this.sendSuccess = false;
    this.sendError = '';

    if (this.contactForm.invalid) return;

    const payload: any = { ...(this.contactForm.value as any) };
    payload.elapsedMs = Date.now() - this.formStartTs;
    this.isSending = true;
    this.contactService.sendMessage(payload).subscribe({
      next: () => {
        this.sendSuccess = true;
        this.isSending = false;
        this.contactForm.reset();
        this.submitted = false;
        this.formStartTs = Date.now();
      },
      error: (err) => {
        console.error('Contact send failed', err);
        this.sendError = 'Failed to send your message. Please try again later.';
        this.isSending = false;
      }
    });
  }

  get f() {
    return this.contactForm.controls;
  }
}
