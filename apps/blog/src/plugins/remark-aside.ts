import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

function nodeToText(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(nodeToText).join('');
  return '';
}

export default function remarkAside() {
  return (tree: Root) => {
    visit(tree, ['textDirective', 'leafDirective'], (node: any) => {
      if (node.name !== 'left' && node.name !== 'right') return;
      const data = node.data || (node.data = {});
      data.hName = 'span';
      data.hProperties = { className: [node.name] };
    });

    visit(tree, 'containerDirective', (node: any) => {
      if (node.name !== 'grid') return;
      let html = '<div class="grid">';
      for (const child of node.children) {
        if (child.data?.directiveLabel) continue;
        if (child.type === 'paragraph' && child.children?.length > 0) {
          const firstChild = child.children[0];
          if (firstChild?.type === 'textDirective' && firstChild.name === 'label') {
            const labelText = nodeToText(firstChild);
            const href = firstChild.attributes?.href;
            const contentText = child.children
              .slice(1)
              .map(nodeToText)
              .join('')
              .replace(/^\s+/, '');
            if (href) {
              html += `<a class="link" href="${href}">${labelText}</a>`;
            } else {
              html += `<span class="label">${labelText}</span>`;
            }
            html += `<div class="content">${contentText}</div>`;
          }
        }
      }
      html += '</div>';
      node.type = 'html';
      node.value = html;
      delete node.children;
    });
  };
}
