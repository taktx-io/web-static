import { Routes, CanActivateFn } from '@angular/router';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

/** Redirects /blog to the Medium publication instead of serving stub pages. */
const mediumRedirectGuard: CanActivateFn = () => {
  window.location.href = 'https://medium.com/@eric.hendriks';
  return false;
};

export const routes: Routes = [
  // Landing page (public)
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule)
  },

  // Features page (public)
  {
    path: 'features',
    loadChildren: () => import('./features/features/features.module').then(m => m.FeaturesModule)
  },

  // Documentation section (public, read-only)
  {
    path: 'documentation',
    loadChildren: () => import('./features/documentation/documentation.module').then(m => m.DocumentationModule)
  },

  // Blog — published on Medium; redirect external visitors
  {
    path: 'blog',
    component: PageNotFoundComponent, // never rendered, guard fires first
    canActivate: [mediumRedirectGuard]
  },


  // About page (public)
  {
    path: 'about',
    loadComponent: () => import('./features/about/pages/about/about.component').then(c => c.AboutComponent)
  },

  // Case studies (public)
  {
    path: 'case-studies/dutch-financial-poc',
    loadComponent: () => import('./features/case-studies/pages/dutch-financial-poc/dutch-financial-poc.component').then(c => c.DutchFinancialPocComponent)
  },

  // Contact page (public)
  {
    path: 'contact',
    loadChildren: () => import('./features/contact/contact.module').then(m => m.ContactModule)
  },

  // Cookie policy page (public)
  {
    path: 'cookies',
    loadComponent: () => import('./features/legal/pages/cookie-policy/cookie-policy.component').then(c => c.CookiePolicyComponent)
  },

  // Privacy policy page (public)
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/pages/privacy-policy/privacy-policy.component').then(c => c.PrivacyPolicyComponent)
  },

  // Terms of Service page (public)
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/pages/terms-of-service/terms-of-service.component').then(c => c.TermsOfServiceComponent)
  },


  // Why TaktX page (public)
  {
    path: 'why-taktx',
    loadComponent: () => import('./features/why-taktx/pages/why-taktx/why-taktx.component').then(c => c.WhyTaktxComponent)
  },

  // Decisions / DMN page (public)
  {
    path: 'decisions',
    loadComponent: () => import('./features/decisions/pages/decisions/decisions.component').then(c => c.DecisionsComponent)
  },

  // License page (public)
  {
    path: 'license',
    loadComponent: () => import('./features/legal/pages/license/license.component').then(c => c.LicenseComponent)
  },


  // Retired pages → product home
  { path: 'beta', redirectTo: '', pathMatch: 'full' },
  { path: 'pricing', redirectTo: '', pathMatch: 'full' },
  { path: 'qr', redirectTo: '', pathMatch: 'full' },

  // Wildcard route for 404
  { path: '**', component: PageNotFoundComponent }
];
