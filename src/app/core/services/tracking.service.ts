import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { CookieService } from '../../shared/services/cookie.service';

/**
 * TrackingService - Handles tracking of user interactions across the application
 * Only tracks events when analytics cookies are enabled
 */
@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  constructor(
    private analyticsService: AnalyticsService,
    private cookieService: CookieService
  ) {
    // Listen for consent changes to handle enabling/disabling tracking
    this.cookieService.getConsentChanges().subscribe(consent => {
      if (consent) {
        // If analytics is newly enabled, update GA
        this.analyticsService.updateConsent();
      }
    });
  }

  /**
   * Track page views in documentation
   */
  trackDocumentationView(sectionName: string, sectionId: string): void {
    if (!this.cookieService.isAllowed('analytics')) return;
    
    this.analyticsService.sendEvent('documentation_view', {
      section_name: sectionName,
      section_id: sectionId
    });
  }

  /**
   * Track navigation between sections
   */
  trackSectionNavigation(fromSection: string, toSection: string): void {
    if (!this.cookieService.isAllowed('analytics')) return;
    
    this.analyticsService.sendEvent('section_navigation', {
      from_section: fromSection,
      to_section: toSection
    });
  }

  /**
   * Track document searches
   */
  trackSearch(query: string, resultsCount: number): void {
    if (!this.cookieService.isAllowed('analytics')) return;
    
    this.analyticsService.sendEvent('documentation_search', {
      search_term: query,
      results_count: resultsCount
    });
  }

  /**
   * Track section expansions/collapses
   */
  trackSectionToggle(sectionName: string, expanded: boolean): void {
    if (!this.cookieService.isAllowed('analytics')) return;
    
    this.analyticsService.sendEvent('section_toggle', {
      section_name: sectionName,
      action: expanded ? 'expand' : 'collapse'
    });
  }

  /**
   * Track file/document downloads
   */
  trackDownload(fileName: string, fileType: string): void {
    if (!this.cookieService.isAllowed('analytics')) return;
    
    this.analyticsService.sendEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    });
  }
  
  /**
   * Track user login/logout
   */
  trackAuthentication(action: 'login' | 'logout', userRole?: string): void {
    if (!this.cookieService.isAllowed('analytics')) return;
    
    this.analyticsService.sendEvent('authentication', {
      action,
      user_role: userRole || 'standard'
    });
  }
  
  /**
   * Track form interactions (submissions, validations, etc.)
   */
  trackFormInteraction(formName: string, action: string, success: boolean): void {
    if (!this.cookieService.isAllowed('analytics')) return;
    
    this.analyticsService.sendEvent('form_interaction', {
      form_name: formName,
      action,
      success
    });
  }
}
