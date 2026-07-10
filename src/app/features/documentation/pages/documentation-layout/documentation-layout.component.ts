import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentationService, SearchResult } from '../../services/documentation.service';
import { DocSection } from '../../models/documentation-section.model';
import { SectionContent } from '../../models/section-content.model';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';
import { DocSectionTreeComponent } from '../../components/doc-section-tree/doc-section-tree.component';
import { DocumentationParserService } from '../../services/documentation-parser.service';
import { AuthService } from '@core/services/auth.service';
import { CookieService } from '../../../../shared/services/cookie.service';
import { TrackingService } from '../../../../core/services/tracking.service';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-documentation-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SafeHtmlPipe, DocSectionTreeComponent],
  templateUrl: './documentation-layout.component.html',
  styleUrls: ['./documentation-layout.component.scss']
})
export class DocumentationLayoutComponent implements OnInit {
  rootSection: DocSection | undefined;
  rootSectionSlug: string | null = null;
  sectionSlugs: string[] = [];
  loading = true;
  notFound = false;

  // Section handling
  sections: DocSection[] = [];
  selectedSection: DocSection | null = null;
  selectedSectionPath: string[] = [];
  showRootSectionContent = true; // Flag to show root section content

  // Content handling
  sectionContent: SectionContent | null = null;
  loadingSectionContent = false;
  rootSectionContent: SectionContent | null = null;
  loadingRootSectionContent = false;

  // Admin functionality
  isAdmin = false; // Will be set based on the authentication service

  // Store which sections are expanded to maintain the tree state
  expandedSections = new Set<string>();

  // Flag to indicate when functional cookies are disabled
  functionalCookiesDisabled = false;

  // Search-related properties
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  searching = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly documentationService: DocumentationService,
    private readonly parserService: DocumentationParserService,
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
    private readonly trackingService: TrackingService,
    private readonly seo: SeoService
  ) { }

  ngOnInit(): void {
    // Use route params to get root section and section information
    this.route.paramMap.subscribe(params => {
      // Always get the root section slug
      this.rootSectionSlug = params.get('level0');

      // Reset section slugs
      this.sectionSlugs = [];

      // Get all possible level parameters
      const level1 = params.get('level1');
      const level2 = params.get('level2');
      const level3 = params.get('level3');
      const level4 = params.get('level4');
      const level5 = params.get('level5');

      // Add all non-null levels to the section slugs array
      if (level1) this.sectionSlugs.push(level1);
      if (level2) this.sectionSlugs.push(level2);
      if (level3) this.sectionSlugs.push(level3);
      if (level4) this.sectionSlugs.push(level4);
      if (level5) this.sectionSlugs.push(level5);

      console.log('Root section slug:', this.rootSectionSlug);
      console.log('Section slugs:', this.sectionSlugs);

      // Load the root section if we have a slug
      if (this.rootSectionSlug) {
        this.loadRootSection(this.rootSectionSlug);
      }
    });

    // Check if functional cookies are allowed
    this.functionalCookiesDisabled = !this.cookieService.isAllowed('functional');

    // Load expanded sections from localStorage or sessionStorage based on cookie preferences
    this.loadExpandedState();

    // Set isAdmin based on the authentication service
    this.authService.isAdmin().then(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  /** Update <title> and meta tags to reflect the currently visible section. */
  private updateDocSeo(section: DocSection | null): void {
    if (!this.rootSection) return;
    if (!section) {
      this.seo.update({
        title: `${this.rootSection.title} — Documentation`,
        description: this.rootSection.description || `TaktX documentation: ${this.rootSection.title}`,
        url: `/documentation/${this.rootSection.slug}`
      });
    } else {
      this.seo.update({
        title: `${section.title} — ${this.rootSection.title} — Documentation`,
        description: section.description || `TaktX documentation: ${section.title}`,
        url: this.router.url
      });
    }
  }

  loadRootSection(slug: string): void {
    this.loading = true;
    this.notFound = false;
    this.selectedSection = null;
    this.selectedSectionPath = [];
    this.showRootSectionContent = this.sectionSlugs.length === 0; // Only show root section content if no section is specified

    this.documentationService.getSectionBySlug(slug).subscribe({
      next: (rootSection) => {
        this.rootSection = rootSection;
        this.loading = false;
        this.notFound = !rootSection;

        if (rootSection) {
          // Check if we have sections from the backend
          if (rootSection.subsections && rootSection.subsections.length > 0) {
            console.log('Using sections from API:', rootSection.subsections);
            this.sections = rootSection.subsections;
          } else {
            // Fallback to parsing content
            console.log('No sections from API, parsing from content');

            // If we still have content in the rootSection (for backward compatibility),
            // use it to generate subsections
            if (rootSection.content) {
              this.sections = this.parserService.parseContentToSections(rootSection.content);
            } else {
              this.sections = [];
            }
          }

          // Make sure all sections have slugs
          this.ensureAllSectionsHaveSlugs(this.sections);

          // Load expanded sections from localStorage or sessionStorage based on cookie preferences
          this.loadExpandedState();

          // If section slugs are in URL, try to find and select that section
          if (this.sectionSlugs.length > 0) {
            this.findAndSelectSectionByPathSlugs(this.sectionSlugs);
          } else {
            // Show root section content when no section is specified
            this.showRootSection();
          }

          // Load root section content if it's being shown and doesn't have content already
          if (this.showRootSectionContent && !rootSection.content && rootSection.id !== null) {
            this.loadRootSectionContent(rootSection.id);
          }
        }
      },
      error: (error) => {
        console.error('Error loading root section:', error);
        this.loading = false;
        this.notFound = true;
      }
    });
  }

  /**
   * Load content for the root section
   */
  loadRootSectionContent(sectionId: number): void {
    this.loadingRootSectionContent = true;

    this.documentationService.getSectionContent(sectionId).subscribe({
      next: (content) => {
        this.rootSectionContent = content;
        this.loadingRootSectionContent = false;
      },
      error: (error) => {
        console.error('Error loading root section content:', error);
        this.loadingRootSectionContent = false;
      }
    });
  }

  // Make sure all sections have slugs
  ensureAllSectionsHaveSlugs(sections: DocSection[]): void {
    if (!sections || !sections.length) return;

    for (const section of sections) {
      if (!section.slug) {
        section.slug = this.generateSlug(section.title);
      }

      if (section.subsections && section.subsections.length) {
        this.ensureAllSectionsHaveSlugs(section.subsections);
      }
    }
  }

  // Generate a slug from a title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Remove consecutive hyphens
      .trim();                  // Trim start/end
  }

  // Find and select section by array of slugs (representing the path)
  findAndSelectSectionByPathSlugs(slugs: string[]): void {
    if (!slugs.length || !this.sections.length) return;

    console.log('Finding section by slugs:', slugs);

    // Recursive function to find section by following the slug path
    const findSection = (sections: DocSection[], slugIndex: number, currentPath: string[] = []): { section: DocSection, path: string[] } | null => {
      // Check each section at this level
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const newPath = [...currentPath, i.toString()];

        // Skip sections without slugs (should not happen due to ensureAllSectionsHaveSlugs)
        if (!section.slug) continue;

        // Debug info
        console.log(`Checking section "${section.title}" (slug: ${section.slug}) against "${slugs[slugIndex]}"`);

        // If this section's slug matches the current slug we're looking for
        if (section.slug === slugs[slugIndex]) {
          console.log(`Found match for "${slugs[slugIndex]}" in section "${section.title}"`);

          // If this is the last slug in our path, we found our target section
          if (slugIndex === slugs.length - 1) {
            console.log('Final section found:', section.title);
            return { section, path: newPath };
          }

          // Otherwise, continue searching in subsections if they exist
          if (section.subsections && section.subsections.length > 0) {
            const result = findSection(section.subsections, slugIndex + 1, newPath);
            if (result) {
              return result;
            }
          }
        }

        // If this section didn't match but has subsections, check them too
        if (section.subsections && section.subsections.length > 0) {
          const result = findSection(section.subsections, slugIndex, newPath);
          if (result) {
            return result;
          }
        }
      }

      return null;
    };

    // Start the search from the root sections with the first slug
    const result = findSection(this.sections, 0);

    if (result) {
      // Directly update state rather than calling selectSection to avoid circular navigation
      this.selectedSection = result.section;
      this.selectedSectionPath = result.path;
      this.showRootSectionContent = false;
      console.log('Selected section path:', this.selectedSectionPath);

      // Update SEO for the selected section
      this.updateDocSeo(result.section);

      // Load section content if not already loaded (similar to selectSection method)
      if (!this.selectedSection.content && this.selectedSection.id !== null) {
        this.loadingSectionContent = true;

        this.documentationService.getSectionContent(this.selectedSection.id).subscribe({
          next: (content) => {
            this.sectionContent = content;
            this.loadingSectionContent = false;
          },
          error: (error) => {
            console.error('Error loading section content:', error);
            this.loadingSectionContent = false;
          }
        });
      }
    } else {
      // If section not found, show root section content
      console.log('No section found for slugs:', slugs);
      this.showRootSection();
    }
  }

  // Handle section selection from the section tree
  selectSection(event: { section: DocSection, path: string[] }): void {
    console.log('Selecting section:', event.section.title);

    // Track navigation from previous section to new section if analytics is allowed
    if (this.selectedSection) {
      this.trackingService.trackSectionNavigation(
        this.selectedSection.title,
        event.section.title
      );
    } else {
      // First navigation from root
      this.trackingService.trackDocumentationView(
        event.section.title,
        event.section.id?.toString() || 'unknown'
      );
    }

    this.selectedSection = event.section;
    this.selectedSectionPath = event.path;
    this.showRootSectionContent = false;

    // Update SEO for the selected section
    this.updateDocSeo(event.section);

    // Reset content state
    this.sectionContent = null;

    // Get section content if the section doesn't already have content
    if (!this.selectedSection.content && this.selectedSection.id !== null) {
      this.loadingSectionContent = true;

      this.documentationService.getSectionContent(this.selectedSection.id).subscribe({
        next: (content) => {
          this.sectionContent = content;
          this.loadingSectionContent = false;
        },
        error: (error) => {
          console.error('Error loading section content:', error);
          this.loadingSectionContent = false;
        }
      });
    }

    // Expand this section and all its parents
    if (event.path && event.path.length > 0) {
      event.path.forEach(pathItem => {
        this.expandedSections.add(pathItem);
      });
    }

    // Save expanded sections to localStorage or sessionStorage based on cookie preferences
    this.saveExpandedState();

    // If it's a nested section, update URL without reloading the page
    this.updateUrlToReflectPath(event.path);
  }

  // Track expanded sections at the layout level
  onSectionToggled(event: { sectionId: string, expanded: boolean }): void {
    if (event.expanded) {
      this.expandedSections.add(event.sectionId);
      this.saveExpandedState();
    } else {
      this.expandedSections.delete(event.sectionId);
      this.saveExpandedState();
    }

    // Track section toggling for analytics
    const section = this.getSectionById(event.sectionId);
    if (section) {
      this.trackingService.trackSectionToggle(section.title, event.expanded);
    }
  }

  // Save expanded sections to localStorage or sessionStorage based on cookie preferences
  private saveExpandedState(): void {
    try {
      if (this.rootSection && this.rootSection.id) {
        const expandedArray = Array.from(this.expandedSections);
        const storageKey = `expanded_sections_${this.rootSection.id}`;

        if (this.functionalCookiesDisabled) {
          // Use sessionStorage when functional cookies are disabled
          sessionStorage.setItem(storageKey, JSON.stringify(expandedArray));
        } else {
          // Use localStorage when functional cookies are allowed
          localStorage.setItem(storageKey, JSON.stringify(expandedArray));
        }
      }
    } catch (error) {
      console.error('Error saving expanded state:', error);
    }
  }

  // Load expanded sections from localStorage or sessionStorage based on cookie preferences
  private loadExpandedState(): void {
    try {
      if (this.rootSection && this.rootSection.id) {
        const storageKey = `expanded_sections_${this.rootSection.id}`;
        let savedState = null;

        if (this.functionalCookiesDisabled) {
          // Try sessionStorage first when functional cookies are disabled
          savedState = sessionStorage.getItem(storageKey);
        } else {
          // Try localStorage when functional cookies are allowed
          savedState = localStorage.getItem(storageKey);
        }

        if (savedState) {
          const expandedArray = JSON.parse(savedState);
          this.expandedSections = new Set(expandedArray);
        }
      }
    } catch (error) {
      console.error('Error loading expanded state:', error);
    }
  }

  // Update the URL based on the full section path
  updateUrlToReflectPath(path: string[]): void {
    if (!this.rootSection || !this.rootSection.slug) return;

    // Get all the sections in the path
    const pathSections = this.getSectionsByPath(path);

    // Add section slugs to the URL (supports unlimited depth)
    const sectionSlugs = pathSections
      .filter(section => section && section.slug)
      .map(section => section.slug as string);

    // Build URL parts array, starting with the base path
    const urlParts = ['/documentation', this.rootSection.slug];

    // Add each section slug as a separate URL segment, up to the defined limit
    // If we have more sections than our routing can handle, we'll have to truncate
    // This is a limitation we need to live with for now
    const maxDepth = 5; // Match the number of levels defined in routes
    const slugsToInclude = sectionSlugs.slice(0, maxDepth);
    urlParts.push(...slugsToInclude);

    console.log('Navigating to:', urlParts.join('/'));

    // Use router navigate
    this.router.navigate(urlParts);
  }

  // Get an array of all sections in a path
  getSectionsByPath(path: string[]): DocSection[] {
    const result: DocSection[] = [];

    let currentSections = this.sections;
    let currentSection: DocSection | null = null;

    // Traverse the path to build the section array
    for (let i = 0; i < path.length; i++) {
      const index = parseInt(path[i]);
      if (isNaN(index) || index < 0 || index >= currentSections.length) {
        break; // Invalid index, stop processing
      }

      currentSection = currentSections[index];
      result.push(currentSection);

      // Move to subsections for the next iteration
      if (currentSection.subsections && i < path.length - 1) {
        currentSections = currentSection.subsections;
      } else if (i < path.length - 1) {
        // We have more path elements but no more subsections
        break;
      }
    }

    return result;
  }

  // Show root section content
  showRootSection(): void {
    this.selectedSection = null;
    this.selectedSectionPath = [];
    this.showRootSectionContent = true;
    this.sectionSlugs = [];

    // Update SEO for root section
    this.updateDocSeo(null);

    // Update URL to only show root section
    if (this.rootSection && this.rootSection.slug) {
      this.router.navigate(['/documentation', this.rootSection.slug]);
    }
  }

  // Function to get a section by path
  getSectionByPath(path: string[]): DocSection | null {
    if (!path.length || !this.sections.length) return null;

    let currentSections = this.sections;
    let currentSection: DocSection | null = null;

    for (const index of path) {
      const i = parseInt(index);
      if (isNaN(i) || i < 0 || i >= currentSections.length) {
        return null; // Invalid index
      }

      currentSection = currentSections[i];
      if (!currentSection) return null;

      currentSections = currentSection.subsections || [];
    }

    return currentSection;
  }

  // Helper to find and navigate to a section
  findAndNavigateToSection(section: DocSection): void {
    if (!section || !section.id) {
      console.error('Invalid section provided to findAndNavigateToSection');
      return;
    }

    console.log('Finding path to section:', section);

    // Build navigation path
    this.selectedSectionPath = [];
    let currentSection: DocSection | null = section;

    // First, find all parent sections to build the full path
    while (currentSection && currentSection.parentSectionId) {
      // Find the parent section
      const parentId = currentSection.parentSectionId;
      const parent = this.findSectionById(this.sections, parentId);

      if (!parent) {
        break; // Parent not found, stop here
      }

      // Move up to parent for next iteration
      currentSection = parent;
    }

    // Update the URL to the selected section's slug
    if (section.slug) {
      this.router.navigate(['/documentation', section.slug]);
    }
  }

  // Handle adding a new section
  onAddSection(event: { parentSection: DocSection, parentPath: string[] }): void {
    console.log('Adding section to:', event.parentSection);
    console.log('Path:', event.parentPath);

    // Navigate to section-edit component with parent section ID
    if (event.parentSection && event.parentSection.id) {
      // Navigate to the new section form with parent section ID
      this.router.navigate(['/documentation/section/new'], {
        queryParams: {
          parentId: event.parentSection.id
        }
      });
    }
  }

  // Handle editing an existing section
  onEditSection(event: { section: DocSection, path: string[] }): void {
    console.log('Editing section:', event.section);
    console.log('Path:', event.path);

    // Navigate to section edit page with the section's ID
    if (event.section && event.section.id) {
      this.router.navigate(['/documentation/section/edit', event.section.id]);
    }
  }

  // Handle adding a new root-level section
  onAddRootSection(event: Event): void {
    event.stopPropagation();
    console.log('Adding new section to root section:', this.rootSection);

    // Navigate to section creation page with root section as parent
    if (this.rootSection && this.rootSection.id) {
      this.router.navigate(['/documentation/section/new'], {
        queryParams: {
          parentId: this.rootSection.id
        }
      });
    } else {
      // Fallback if no root section is selected
      this.router.navigate(['/documentation/section/new']);
    }
  }

  // Reset the expanded sections state to default (empty)
  resetExpandedSections(): void {
    this.expandedSections = new Set<string>();
    this.saveExpandedState();
  }

  // Collapse all sections
  collapseAllSections(): void {
    this.resetExpandedSections();
  }

  // Expand all sections
  expandAllSections(): void {
    this.expandAllSectionsRecursive(this.sections);
    this.saveExpandedState();
  }

  // Recursively add all section IDs to expanded set
  private expandAllSectionsRecursive(sections: DocSection[]): void {
    for (const section of sections) {
      if (section.id) {
        this.expandedSections.add(section.id.toString());
      }
      if (section.subsections && section.subsections.length > 0) {
        this.expandAllSectionsRecursive(section.subsections);
      }
    }
  }

  // Expand the path to the currently selected section
  expandToSelectedSection(): void {
    if (!this.selectedSection || !this.selectedSection.id) return;

    // Find the path to the selected section
    this.findPathToSection(this.sections, this.selectedSection.id.toString(), []);
  }

  // Recursively find the path to a section and expand all parent sections
  private findPathToSection(sections: DocSection[], targetId: string, path: string[] = []): boolean {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const currentPath = [...path, i.toString()];

      // Found the section
      if (section.id && section.id.toString() === targetId) {
        return true;
      }

      // Check subsections
      if (section.subsections && section.subsections.length > 0) {
        if (this.findPathToSection(section.subsections, targetId, currentPath)) {
          // If section is in this branch, expand this section
          if (section.id) {
            const sectionIdStr = section.id.toString();
            this.expandedSections.add(sectionIdStr);
          }
          return true;
        }
      }
    }

    return false;
  }

  // Handle searching the documentation
  searchDocumentation(): void {
    if (!this.searchQuery.trim()) {
      this.clearSearch();
      return;
    }

    this.searching = true;
    this.searchResults = [];

    this.documentationService.searchDocumentation(this.searchQuery).subscribe({
      next: (results: SearchResult[]) => {
        this.searchResults = results;
        this.searching = false;

        // Track search for analytics
        this.trackingService.trackSearch(this.searchQuery, results.length);
      },
      error: (error: any) => {
        console.error('Error searching documentation:', error);
        this.searching = false;
      }
    });
  }

  // Clear the search and return to normal navigation
  clearSearch(): void {
    console.log('Clearing search');
    this.searchQuery = '';
    this.searchResults = [];
  }

  // Select a search result
  selectSearchResult(result: SearchResult): void {
    console.log('Selecting search result:', result);

    // Set selected section and clear search state
    this.selectedSection = result.section;
    this.showRootSectionContent = false;
    this.searchResults = [];
    this.searchQuery = '';

    // Reset content state
    this.sectionContent = null;

    // Load content since search results don't include content
    if (this.selectedSection.id !== null) {
      this.loadingSectionContent = true;

      this.documentationService.getSectionContent(this.selectedSection.id).subscribe({
        next: (content) => {
          this.sectionContent = content;
          this.loadingSectionContent = false;
        },
        error: (error) => {
          console.error('Error loading section content:', error);
          this.loadingSectionContent = false;
        }
      });
    }

    // Find the path to the section by traversing the section hierarchy
    this.findAndNavigateToSection(result.section);
  }

  // Helper to find a section by ID
  findSectionById(sections: DocSection[], id: number): DocSection | null {
    for (const section of sections) {
      if (section.id === id) {
        return section;
      }

      if (section.subsections && section.subsections.length > 0) {
        const subsection = this.findSectionById(section.subsections, id);
        if (subsection) {
          return subsection;
        }
      }
    }

    return null;
  }

  // Helper method to get a section by ID
  private getSectionById(sectionId: string): DocSection | null {
    // Extract the numeric ID from the path ID if needed
    const id = parseInt(sectionId);
    if (isNaN(id)) return null;

    // Recursive function to search for a section by ID
    const findSection = (sections: DocSection[]): DocSection | null => {
      for (const section of sections) {
        if (section.id === id) {
          return section;
        }

        if (section.subsections && section.subsections.length > 0) {
          const found = findSection(section.subsections);
          if (found) return found;
        }
      }
      return null;
    };

    return findSection(this.sections);
  }
}
