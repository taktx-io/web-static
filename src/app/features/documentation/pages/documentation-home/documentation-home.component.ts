import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DocumentationService, SearchResult } from '../../services/documentation.service';
import { DocSection } from '../../models/documentation-section.model';
import { AuthService } from '@core/services/auth.service';
import { SeoService } from '@core/services/seo.service';
import { Observable, map } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-documentation-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './documentation-home.component.html',
  styleUrls: ['./documentation-home.component.scss']
})
export class DocumentationHomeComponent implements OnInit {
  rootSections: DocSection[] = [];
  isAdmin = false;
  isLoading = true;
  deletingRootSectionId: number | null = null;

  // Search related properties
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  searching: boolean = false;

  constructor(
    private readonly documentationService: DocumentationService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly seo: SeoService
  ) { }

  ngOnInit(): void {
    this.seo.update({
      title: 'Documentation — TaktX',
      description: 'Browse the TaktX documentation: quickstart guides, BPMN engine reference, worker SDK, deployment, and operational control.',
      url: '/documentation',
      keywords: 'TaktX docs, BPMN documentation, workflow engine guide, TaktX quickstart'
    });
    this.loadCategories();
    this.checkAdminRole();
    this.checkAuthStatus();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.documentationService.getRootSections().subscribe({
      next: rootSections => {
        this.rootSections = rootSections.sort((a, b) => a.order - b.order);
        this.isLoading = false;
      },
      error: error => {
        console.error('Error loading documentation categories:', error);
        this.isLoading = false;
      }
    });
  }

  // Method to get active categories
  getActiveRootSections(): Observable<DocSection[]> {
    return this.documentationService.getRootSections().pipe(
      map(rootSections => rootSections.filter(section => section.isActive).sort((a, b) => a.order - b.order))
    );
  }

  async checkAdminRole(): Promise<void> {
    console.log('Checking admin role...');

    // Check if user is logged in
    const isLoggedIn = await this.authService.isLoggedIn();
    console.log('User is logged in:', isLoggedIn);

    // Check admin role
    const isAdmin = await this.authService.isAdmin();
    console.log('User is admin:', isAdmin);

    // Check for the specific administrator role
    const hasAdminRole = await this.authService.hasRole('administrator');
    console.log('User has administrator role:', hasAdminRole);

    this.isAdmin = isAdmin;
    console.log('isAdmin flag set to:', this.isAdmin);
  }

  private async checkAuthStatus() {
    const isLoggedIn = await this.authService.isLoggedIn();
    const isAdmin = await this.authService.isAdmin();
    console.log('Auth status:', { isLoggedIn, isAdmin });
  }

  loginToKeycloak() {
    this.authService.login();
  }

  navigateToEdit(rootSectionId: number | null): void {
    if (!rootSectionId) {
      console.error('No root section ID provided');
      return;
    }
    console.log('Navigating to edit page for root section:', rootSectionId);
    this.router.navigate(['/documentation/section/edit', rootSectionId]);
  }

  navigateToCreateRootSection(): void {
    console.log('Navigating to create new root section page');
    this.router.navigate(['/documentation/section/new']);
  }

  confirmDeleteRootSection(rootSectionId: number | null, event: Event): void {
    if (!rootSectionId) {
      console.error('No root section ID provided');
      return;
    }
    // Prevent event bubbling
    event.stopPropagation();

    // Set the section to be deleted
    this.deletingRootSectionId = rootSectionId;
  }

  cancelDelete(event: Event): void {
    // Prevent event bubbling
    event.stopPropagation();

    // Clear the section to be deleted
    this.deletingRootSectionId = null;
  }

  deleteRootSection(rootSectionId: number | null, event: Event): void {
    if (!rootSectionId) {
      console.error('No root section ID provided');
      return;
    }

    // Prevent event bubbling
    event.stopPropagation();

    if (!this.isAdmin) {
      console.warn('Unauthorized deletion attempt');
      return;
    }

    // Reset the deleting state
    this.deletingRootSectionId = null;

    // Call the service to delete the section
    this.documentationService.deleteRootSection(rootSectionId).subscribe({
      next: () => {
        console.log('Section deleted successfully');
        // Explicitly reload the sections to update the UI
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting section:', error);
      }
    });
  }

  // Search methods
  performSearch(): void {
    if (!this.searchQuery || this.searchQuery.trim().length < 1) {
      this.clearSearch();
      return;
    }

    console.log('Home: Performing search for:', this.searchQuery);
    this.searching = true;
    this.documentationService.searchDocumentation(this.searchQuery).subscribe({
      next: (results: SearchResult[]) => {
        this.searchResults = results;
        this.searching = false;
        console.log('Home: Search results received:', results.length, 'items');
        console.log('Home: Search results details:', results);
      },
      error: (error: any) => {
        console.error('Home: Error searching documentation:', error);
        this.searching = false;
        this.searchResults = [];
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }

  navigateToSearchResult(result: SearchResult): void {
    if (result.section) {
      // Find the section to navigate to
      const section = result.section;

      // Navigate to the section
      if (section.parentSectionId === null) {
        // Root level section
        this.router.navigate(['/documentation', section.slug]);
      } else {
        // Subsection - need to find the full path
        this.findAndNavigateToSection(section);
      }
    }
  }

  // Helper to find and navigate to a section
  private findAndNavigateToSection(section: DocSection): void {
    if (section.parentSectionId === null) {
      // This is a root section
      this.router.navigate(['/documentation', section.slug]);
      return;
    }

    // For subsections, we need to get the parent to build the path
    this.documentationService.getSectionById(section.parentSectionId.toString()).subscribe({
      next: (parentSection) => {
        if (parentSection && parentSection.slug) {
          if (parentSection.parentSectionId === null) {
            // Parent is root level, simple path
            this.router.navigate(['/documentation', parentSection.slug, section.slug]);
          } else {
            // Need to recursively find the full path
            this.findSectionPathRecursively(section, parentSection);
          }
        }
      },
      error: (error) => {
        console.error('Error finding parent section:', error);
        // Fallback to direct navigation if possible
        this.router.navigate(['/documentation', section.slug]);
      }
    });
  }

  // Recursively find the path to a section
  private findSectionPathRecursively(targetSection: DocSection, parentSection: DocSection): void {
    if (parentSection.parentSectionId === null) {
      // We've found the root, now we can navigate
      this.router.navigate(['/documentation', parentSection.slug, targetSection.slug]);
    } else {
      // Need to go up one more level
      this.documentationService.getSectionById(parentSection.parentSectionId.toString()).subscribe({
        next: (grandparentSection) => {
          if (grandparentSection && grandparentSection.slug) {
            if (grandparentSection.parentSectionId === null) {
              // Grandparent is root level
              this.router.navigate(['/documentation', grandparentSection.slug, parentSection.slug, targetSection.slug]);
            } else {
              // Need to go deeper in the hierarchy
              console.warn('Deep nesting detected, defaulting to simpler navigation');
              this.router.navigate(['/documentation', targetSection.slug]);
            }
          }
        },
        error: () => {
          // Fallback to simpler navigation
          this.router.navigate(['/documentation', targetSection.slug]);
        }
      });
    }
  }
}
