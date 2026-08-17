// @/utils/quillHelpers.ts
import Quill from 'quill';

// 🌟 Import Delta natively from Quill to avoid compile errors
const Delta = Quill.import('delta');
export function createQuill(
  editorElement: HTMLElement, 
  toolbarElement: HTMLElement, 
  readOnly: boolean, 
  placeholder: string, 
  theme: string
) {
  const quill = new Quill(editorElement, {
    modules: {
      toolbar: toolbarElement,
      clipboard: {
        matchers: [
          // 🚫 Block media & embeds completely
          ['img', () => new Delta({ ops: [] })],
          ['iframe', () => new Delta({ ops: [] })],
          ['embed', () => new Delta({ ops: [] })],
          ['object', () => new Delta({ ops: [] })],
          ['font', () => new Delta({ ops: [] })],

          // 🔗 Preserve safe hyperlinks on <a> tags (Sanitize javascript: execution)
          ['a', (node: any, delta: any) => {
            if (!delta || !delta.ops || delta.ops.length === 0) {
              return delta || new Delta({ ops: [] });
            }

            const href = node.getAttribute('href') || '';
            const isSafeScheme = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/');

            // If link scheme is unsafe (e.g. javascript:alert(1)), strip the link attribute
            if (!isSafeScheme) {
              return delta.compose(new Delta().retain(delta.length(), { link: null }));
            }

            return delta;
          }],

          // 🧹 Clean spans – keep only explicitly allowed inline formatting
          ['span', (_node: any, delta: any) => {
            if (!delta || !delta.ops || delta.ops.length === 0) {
              return delta || new Delta({ ops: [] });
            }

            const allowed: Record<string, any> = {};

            delta.ops.forEach((op: any) => {
              if (op.attributes) {
                if (op.attributes.bold) allowed.bold = true;
                if (op.attributes.italic) allowed.italic = true;
                if (op.attributes.underline) allowed.underline = true;
                if (op.attributes.strike) allowed.strike = true;
                if (op.attributes.link) allowed.link = op.attributes.link;
              }
            });

            return delta.compose(new Delta().retain(delta.length(), allowed));
          }],

          // 🛡️ Strip arbitrary styles (color, font size, background-color) from generic elements
          [1, (_node: any, delta: any) => {
            if (!delta || !delta.ops || delta.ops.length === 0) {
              return delta || new Delta({ ops: [] });
            }

            return delta.map((op: any) => {
              if (op.attributes) {
                const { color, background, font, size, style, ...cleanAttrs } = op.attributes;
                return { insert: op.insert, attributes: cleanAttrs };
              }
              return op;
            });
          }]
        ]
      }
    },
    placeholder: placeholder,
    theme: theme,
    readOnly: readOnly
  });

  (editorElement as any).__quill = quill;
}
export function getQuillHTML(editorElement: HTMLElement): string {
  return (editorElement as any).__quill ? (editorElement as any).__quill.root.innerHTML : '';
}

export function setHtml(editorElement: HTMLElement, html: string) {
  if ((editorElement as any).__quill) {
    (editorElement as any).__quill.root.innerHTML = html;
  }
}

export function destroyQuill(editorElement: HTMLElement) {
  if ((editorElement as any).__quill) {
    delete (editorElement as any).__quill;
  }
}