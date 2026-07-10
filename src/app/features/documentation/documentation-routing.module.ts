import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentationHomeComponent } from './pages/documentation-home/documentation-home.component';
import { DocumentationLayoutComponent } from './pages/documentation-layout/documentation-layout.component';

const routes: Routes = [
  { path: '', component: DocumentationHomeComponent },
  // Nested section routes (read-only). Depth-limited explicit params.
  { path: ':level0', component: DocumentationLayoutComponent },
  { path: ':level0/:level1', component: DocumentationLayoutComponent },
  { path: ':level0/:level1/:level2', component: DocumentationLayoutComponent },
  { path: ':level0/:level1/:level2/:level3', component: DocumentationLayoutComponent },
  { path: ':level0/:level1/:level2/:level3/:level4', component: DocumentationLayoutComponent },
  { path: ':level0/:level1/:level2/:level3/:level4/:level5', component: DocumentationLayoutComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentationRoutingModule { }
