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
      // 🛡️ Your exact, battle-tested clipboard security firewall
      clipboard: {
        matchers: [
          // Block images completely
          ['img', () => {
            console.warn("Blocked pasted image");
            return new Delta({ ops: [] }); // empty = ignored
          }],

         // Strip links, keep text (unless your toolbar allows links)
        ['a', (_node: any, delta: any) => {
        // 🌟 SAFETY GUARD: Prevent .length() or .compose() crashes on malformed copies
        if (!delta || !delta.ops || delta.ops.length === 0) {
            return delta || new Delta({ ops: [] });
        }
        return delta.compose(new Delta().retain(delta.length(), { link: null }));
        }],

          // Block dangerous embeds
          ['iframe', () => new Delta({ ops: [] })],
          ['embed', () => new Delta({ ops: [] })],
          ['object', () => new Delta({ ops: [] })],

          // Clean spans – keep only allowed inline formats
            ['span', (_node: any, delta: any) => {
            // 🌟 SAFETY GUARD: Stop execution if delta structure is empty
            if (!delta || !delta.ops || delta.ops.length === 0) {
                return delta || new Delta({ ops: [] });
            }

            const allowed: Record<string, any> = {}; // Changed to any to support link strings safely
            
            delta.ops.forEach((op: any) => {
                if (op.attributes) {
                if (op.attributes.bold) allowed.bold = true;
                if (op.attributes.italic) allowed.italic = true;
                if (op.attributes.underline) allowed.underline = true;
                if (op.attributes.link) allowed.link = op.attributes.link; 
                }
            });
            
            return delta.compose(new Delta().retain(delta.length(), allowed));
            }],

          // Remove ancient <font> tags
          ['font', () => new Delta({ ops: [] })],

          // Handle generic elements safely using structural node types (1 = Node.ELEMENT_NODE)
          [1, (_node: any, delta: any) => {
            // Prevent the .map() crash if a previous matcher stripped everything
            if (!delta || !delta.ops || delta.ops.length === 0) {
              return delta || new Delta({ ops: [] });
            }

            return delta.map((op: any) => {
              if (op.attributes) {
                // Strip arbitrary text styling variables (font size, families, backgrounds)
                const { color, background, font, size, ...cleanAttrs } = op.attributes;
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