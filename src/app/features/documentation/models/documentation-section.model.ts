export interface DocSection {
  id: number | null;
  title: string;
  description: string;
  slug?: string;
  // content field removed and moved to SectionContent model
  order: number;
  icon?: string;
  parentSectionId: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subsections: DocSection[]; // Always initialize as an array in implementation
  
  // Optional content field for backwards compatibility during transition
  content?: string;
}
