import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'javaHighlight',
  standalone: true
})
export class JavaHighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return this.sanitizer.bypassSecurityTrustHtml('');

    // Escape HTML first
    let out = this.escapeHtml(value);

    // Comments (multi-line then single-line)
    out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => `<span style=\"color:#9aa0a6\">${m}</span>`);
    out = out.replace(/(^|\s)(\/\/.*)$/gm, (_m, p1, p2) => `${p1}<span style=\"color:#9aa0a6\">${p2}</span>`);

    // Strings (double and single quotes)
    out = out.replace(/\"([^\"\\]|\\.)*\"/g, (m) => `<span style=\"color:#c3e88d\">${m}</span>`);
    out = out.replace(/'([^'\\]|\\.)*'/g, (m) => `<span style=\"color:#c3e88d\">${m}</span>`);

    // Annotations
    out = out.replace(/@\w+/g, (m) => `<span style=\"color:#82aaff\">${m}</span>`);

    // Numbers
    out = out.replace(/\b\d+(?:_\d+)*(?:L|l|F|f|D|d)?\b/g, (m) => `<span style=\"color:#f78c6c\">${m}</span>`);

    // Keywords and types
    const keywords = [
      'abstract','assert','boolean','break','byte','case','catch','char','class','const','continue','default','do','double','else','enum','extends','final','finally','float','for','if','goto','implements','import','instanceof','int','interface','long','native','new','package','private','protected','public','return','short','static','strictfp','super','switch','synchronized','this','throw','throws','transient','try','void','volatile','while','record','var'
    ];
    const types = ['String','List','Map','Set'];

    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    out = out.replace(kwRegex, '<span style=\"color:#c792ea\">$1</span>');

    const typeRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
    out = out.replace(typeRegex, '<span style=\"color:#89ddff\">$1</span>');

    // Ensure base color for code if not overridden
    out = `<span style=\"color:#e5e7eb\">${out}</span>`;
    return this.sanitizer.bypassSecurityTrustHtml(out);
  }
}
