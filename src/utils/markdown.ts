import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked with GFM, line breaks, and smart punctuation
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

/**
 * Converts Markdown string to clean, sanitized HTML to prevent XSS vulnerabilities.
 */
export function renderMarkdown(rawText: string): string {
  if (!rawText) return '';
  try {
    const rawHtml = marked.parse(rawText) as string;

    // Strict DOMPurify sanitization
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'code',
        'pre',
        'blockquote',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'hr',
        'span',
        'div',
        'a',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'title', 'data-lang'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });

    return sanitizedHtml;
  } catch (err) {
    console.error('Markdown rendering error:', err);
    return DOMPurify.sanitize(rawText);
  }
}
