import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';

@NgModule({
  imports: [
    CommonModule,
    LandingRoutingModule,
    LandingPageComponent // Import the standalone component
  ]
})
export class LandingModule { }
