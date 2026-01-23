import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

export default function remarkAside() {
  return (tree: Root) => {
    visit(tree, 'textDirective', (node: any) => {
      if (node.name !== 'aside') return;

      const data = node.data || (node.data = {});
      data.hName = 'span';
      data.hProperties = { class: 'aside' };
    });
  };
}
