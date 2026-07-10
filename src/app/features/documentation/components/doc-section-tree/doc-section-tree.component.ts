import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DocSection } from '../../models/documentation-section.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doc-section-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-section-tree.component.html',
  styleUrls: ['./doc-section-tree.component.scss'],
  // Use OnPush strategy to prevent unwanted rerenders
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocSectionTreeComponent implements OnInit, OnChanges {
  @Input() sections: DocSection[] = [];
  @Input() level: number = 0;
  @Input() selectedSectionPath: string[] = [];
  @Input() parentPath: string[] = [];
  @Input() isAdmin: boolean = false;
  private _selectedSectionId: string | null = null;

  @Input() set selectedSectionId(value: string | null) {
    console.log('selectedSectionId changed from', this._selectedSectionId, 'to', value);
    this._selectedSectionId = value;
  }
  get selectedSectionId(): string | null {
    return this._selectedSectionId;
  }

  @Input() sectionPaths: string[] = [];
  @Input() expandedSections: Set<string> = new Set<string>();

  @Output() select = new EventEmitter<{ section: DocSection, path: string[] }>();
  @Output() addSection = new EventEmitter<{ parentSection: DocSection, parentPath: string[] }>();
  @Output() editSection = new EventEmitter<{ section: DocSection, path: string[] }>();
  @Output() toggleExpand = new EventEmitter<{ sectionId: string, expanded: boolean }>();

  getSectionIdAsString(id: string | number | undefined): string {
    if (id === undefined) return '';
    return id.toString();
  }

  ngOnInit(): void {
    // No longer automatically expand to selected section on initialization
    // Commenting out previous code that would auto-expand when component initializes
    /*
    if (this.selectedSectionId) {
      this.expandPathToSelected(this.sections, this.selectedSectionId);
    }
    */
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);

    // Don't lose expanded state when changes happen
    if (changes['sections'] && !changes['sections'].firstChange) {
      console.log('Sections changed, preserving expanded state');
    }
  }

  isSectionExpanded(sectionId: string | number | undefined): boolean {
    if (!sectionId) return false;
    const idStr = this.getSectionIdAsString(sectionId);
    const result = this.expandedSections.has(idStr);
    // console.log('isSectionExpanded', sectionId, result); // Too verbose
    return result;
  }

  private expandPathToSelected(sections: DocSection[], selectedId: string, path: string[] = []): boolean {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const currentPath = [...path, i.toString()];

      if (section.id && section.id.toString() === selectedId) {
        return true;
      }

      if (section.subsections && section.subsections.length > 0) {
        if (this.expandPathToSelected(section.subsections, selectedId, currentPath)) {
          if (section.id) {
            const sectionIdStr = section.id.toString();
            this.expandedSections.add(sectionIdStr);
            this.toggleExpand.emit({ sectionId: sectionIdStr, expanded: true });
          }
          return true;
        }
      }
    }

    return false;
  }

  onSelect(section: DocSection, index: number, path: string[]): void {
    console.log('Section selected:', section);
    console.log('Selected section ID:', section.id);
    console.log('Current selectedSectionId:', this.selectedSectionId);
    console.log('Are they equal?', section.id?.toString() === this.selectedSectionId);

    // Emit the selection event with the section and its path
    this.select.emit({
      section,
      path
    });
  }

  toggleExpanded(section: DocSection): void {
    if (section.subsections && section.subsections.length > 0 && section.id) {
      const sectionIdStr = section.id.toString();
      const isExpanded = this.isSectionExpanded(section.id);

      if (isExpanded) {
        this.expandedSections.delete(sectionIdStr);
        this.toggleExpand.emit({ sectionId: sectionIdStr, expanded: false });
      } else {
        this.expandedSections.add(sectionIdStr);
        this.toggleExpand.emit({ sectionId: sectionIdStr, expanded: true });
      }
    }
  }

  onAddSection(event: Event, section: DocSection, path: string[]): void {
    event.stopPropagation();
    this.addSection.emit({ parentSection: section, parentPath: path });
  }

  onEditSection(event: Event, section: DocSection, path: string[]): void {
    event.stopPropagation();
    this.editSection.emit({ section, path });
  }

  onNestedSelect(event: { section: DocSection, path: string[] }): void {
    this.select.emit(event);
  }

  onNestedAddSection(event: { parentSection: DocSection, parentPath: string[] }): void {
    this.addSection.emit(event);
  }

  onNestedEditSection(event: { section: DocSection, path: string[] }): void {
    this.editSection.emit(event);
  }
}
