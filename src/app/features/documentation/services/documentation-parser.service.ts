import { Injectable } from '@angular/core';
import { DocSection } from '../models/documentation-section.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentationParserService {

  constructor() { }

  /**
   * Parse HTML content to extract sections based on heading tags
   * @param content HTML content to parse
   * @returns Array of DocSection objects
   */
  parseContentToSections(content: string): DocSection[] {
    if (!content) return [];

    // Create a temporary DOM element to parse the HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;

    // Get all headings (h1, h2, h3, h4, h5, h6)
    const headings = tempElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return [];

    // Create a root sections array
    const rootSections: DocSection[] = [];

    // Process each heading
    let currentSection: DocSection | null = null;
    let sectionStack: DocSection[] = [];
    let lastLevel = 0;

    headings.forEach((heading, index) => {
      // Get heading level (1 for h1, 2 for h2, etc.)
      const level = parseInt(heading.tagName.substring(1));

      // Get the heading text as section title
      const title = heading.textContent || `Section ${index + 1}`;

      // Generate slug from title
      const slug = this.generateSlug(title);

      // Extract content between this heading and the next heading
      const content = this.extractContentBetweenHeadings(heading);

      // Create a new section
      const newSection: DocSection = {
        id: null,
        title,
        order: 1,
        description: '',
        slug,
        content,
        subsections: [],
        parentSectionId: null
      };

      // Determine where to add this section based on its level
      if (level === 1 || sectionStack.length === 0) {
        // Top level section
        rootSections.push(newSection);
        sectionStack = [newSection];
        lastLevel = level;
      } else if (level > lastLevel) {
        // Child section of the last section we processed
        const parentSection = sectionStack[sectionStack.length - 1];
        if (!parentSection.subsections) {
          parentSection.subsections = [];
        }
        parentSection.subsections.push(newSection);
        sectionStack.push(newSection);
        lastLevel = level;
      } else if (level === lastLevel) {
        // Sibling section
        sectionStack.pop(); // Remove the last section from the stack
        const parentSection = sectionStack[sectionStack.length - 1];
        if (!parentSection.subsections) {
          parentSection.subsections = [];
        }
        parentSection.subsections.push(newSection);
        sectionStack.push(newSection);
      } else {
        // Parent level section (level < lastLevel)
        // Pop from stack until we find the right level
        while (sectionStack.length > 0 && lastLevel >= level) {
          sectionStack.pop();
          lastLevel--;
        }

        if (sectionStack.length === 0) {
          // If we've popped everything, this is a root section
          rootSections.push(newSection);
          sectionStack = [newSection];
        } else {
          // Add to the parent at the appropriate level
          const parentSection = sectionStack[sectionStack.length - 1];
          if (!parentSection.subsections) {
            parentSection.subsections = [];
          }
          parentSection.subsections.push(newSection);
          sectionStack.push(newSection);
        }
        lastLevel = level;
      }
    });

    return rootSections;
  }

  /**
   * Generate a slug from a title
   * @param title The title to convert to a slug
   * @returns A URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Remove consecutive hyphens
      .trim();                  // Trim start/end
  }

  /**
   * Extract content between this heading and the next heading
   * @param heading The heading element
   * @returns HTML content as string
   */
  private extractContentBetweenHeadings(heading: Element): string {
    let content = '';
    let currentNode = heading.nextSibling;

    // Collect all nodes until the next heading
    while (currentNode) {
      const nodeType = currentNode.nodeType;

      // Check if this is an element node and it's a heading
      if (nodeType === Node.ELEMENT_NODE &&
        /^H[1-6]$/i.test((currentNode as Element).tagName)) {
        break; // Stop at next heading
      }

      // Clone the node to extract its HTML
      const clonedNode = currentNode.cloneNode(true);
      if (clonedNode instanceof Element) {
        content += clonedNode.outerHTML;
      } else if (nodeType === Node.TEXT_NODE) {
        content += clonedNode.textContent;
      }

      currentNode = currentNode.nextSibling;
    }

    return content;
  }
}
