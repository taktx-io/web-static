import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentationRoutingModule } from './documentation-routing.module';
import { DocumentationHomeComponent } from './pages/documentation-home/documentation-home.component';
import { DocumentationLayoutComponent } from './pages/documentation-layout/documentation-layout.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    SharedModule,
    DocumentationHomeComponent,
    DocumentationLayoutComponent
  ]
})
export class DocumentationModule { }
