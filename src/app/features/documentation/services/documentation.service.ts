import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { DocSection } from '../models/documentation-section.model';
import { SectionContent } from '../models/section-content.model';

export interface SearchResult {
  section: DocSection;
  title: string;
  highlightedText: string;
  matchScore: number;
  matchedInContent?: boolean;
}

interface SearchIndexEntry {
  sectionId: number;
  title: string;
  description: string;
  slug: string;
  parentSectionId: number | null;
  isActive?: boolean;
  order?: number;
  icon?: string;
  text: string;
}

/**
 * Static documentation service.
 *
 * The dynamic Quarkus backend was replaced by pre-baked JSON assets produced
 * by `tools/snapshot-docs.mjs`:
 *   - assets/docs/tree.json           full nested section tree
 *   - assets/docs/content/<id>.json   { sectionId, content } (HTML)
 *   - assets/docs/search-index.json   flat list with plain-text for search
 *   - assets/docs/images/*            downloaded images
 *
 * All reads are plain GETs against the deployed static files. Everything is
 * cached in-memory after first load.
 */
@Injectable({ providedIn: 'root' })
export class DocumentationService {
  private readonly base = 'assets/docs';
  private tree$?: Observable<DocSection[]>;
  private index$?: Observable<SearchIndexEntry[]>;
  private readonly contentCache = new Map<number, Observable<SectionContent>>();

  constructor(private readonly http: HttpClient) {}

  // ---- Tree ---------------------------------------------------------------

  getRootSections(): Observable<DocSection[]> {
    if (!this.tree$) {
      this.tree$ = this.http.get<DocSection[]>(`${this.base}/tree.json`).pipe(
        map(tree => tree ?? []),
        catchError(() => of([] as DocSection[])),
        shareReplay(1)
      );
    }
    return this.tree$;
  }

  getSectionBySlug(slug: string): Observable<DocSection | undefined> {
    return this.getRootSections().pipe(
      map(tree => this.findBy(tree, s => s.slug === slug))
    );
  }

  getSectionById(id: string): Observable<DocSection | undefined> {
    const numId = Number(id);
    return this.getRootSections().pipe(
      map(tree => this.findBy(tree, s => s.id === numId))
    );
  }

  getRootSectionById(id: string): Observable<DocSection | undefined> {
    return this.getSectionById(id);
  }

  // ---- Content ------------------------------------------------------------

  getSectionContent(sectionId: number): Observable<SectionContent> {
    if (!this.contentCache.has(sectionId)) {
      const obs = this.http
        .get<SectionContent>(`${this.base}/content/${sectionId}.json`)
        .pipe(
          catchError(() => of({ sectionId, content: '' } as SectionContent)),
          shareReplay(1)
        );
      this.contentCache.set(sectionId, obs);
    }
    return this.contentCache.get(sectionId)!;
  }

  // ---- Search (client-side) ----------------------------------------------

  searchDocumentation(query: string): Observable<SearchResult[]> {
    const q = (query || '').trim().toLowerCase();
    if (q.length < 1) {
      return of([]);
    }
    return this.getIndex().pipe(
      map(entries => this.rankEntries(entries, q))
    );
  }

  private getIndex(): Observable<SearchIndexEntry[]> {
    if (!this.index$) {
      this.index$ = this.http.get<SearchIndexEntry[]>(`${this.base}/search-index.json`).pipe(
        map(idx => idx ?? []),
        catchError(() => of([] as SearchIndexEntry[])),
        shareReplay(1)
      );
    }
    return this.index$;
  }

  private rankEntries(entries: SearchIndexEntry[], q: string): SearchResult[] {
    const results: SearchResult[] = [];
    for (const e of entries) {
      if (e.isActive === false) { continue; }
      const title = (e.title || '').toLowerCase();
      const desc = (e.description || '').toLowerCase();
      const text = (e.text || '').toLowerCase();
      let score = 0;
      let matchedInContent = false;
      if (title.includes(q)) { score += 10; }
      if (desc.includes(q)) { score += 4; }
      const idx = text.indexOf(q);
      if (idx !== -1) { score += 2; matchedInContent = true; }
      if (score === 0) { continue; }

      const section: DocSection = {
        id: e.sectionId,
        title: e.title,
        description: e.description,
        slug: e.slug,
        parentSectionId: e.parentSectionId ?? null,
        isActive: e.isActive ?? true,
        order: e.order ?? 0,
        icon: e.icon,
        subsections: []
      };
      results.push({
        section,
        title: e.title,
        highlightedText: this.snippet(e.text || e.description || '', q),
        matchScore: score,
        matchedInContent
      });
    }
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  private snippet(text: string, q: string): string {
    if (!text) { return ''; }
    const lower = text.toLowerCase();
    const i = lower.indexOf(q);
    if (i === -1) { return text.slice(0, 160) + (text.length > 160 ? '…' : ''); }
    const start = Math.max(0, i - 60);
    const end = Math.min(text.length, i + q.length + 100);
    const raw = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return raw.replace(re, '<mark>$1</mark>');
  }

  // ---- Admin methods removed in the static build --------------------------
  // Kept as no-ops so any residual references compile; editing is disabled.

  createRootSection(): Observable<never> { return this.disabled(); }
  updateRootSection(): Observable<never> { return this.disabled(); }
  deleteRootSection(_id?: number): Observable<never> { return this.disabled(); }
  createSection(): Observable<never> { return this.disabled(); }
  updateSection(): Observable<never> { return this.disabled(); }
  deleteSection(): Observable<never> { return this.disabled(); }
  updateSectionContent(): Observable<never> { return this.disabled(); }
  uploadImage(): Observable<never> { return this.disabled(); }

  private disabled(): Observable<never> {
    return throwError(() => new Error('Editing is disabled on the static site.'));
  }

  // ---- Helpers ------------------------------------------------------------

  private findBy(tree: DocSection[], pred: (s: DocSection) => boolean): DocSection | undefined {
    for (const s of tree) {
      if (pred(s)) { return s; }
      if (s.subsections?.length) {
        const found = this.findBy(s.subsections, pred);
        if (found) { return found; }
      }
    }
    return undefined;
  }
}
