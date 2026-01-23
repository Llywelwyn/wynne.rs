import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

export default function remarkAside() {
  return (tree: Root) => {
    visit(tree, ['textDirective', 'leafDirective'], (node: any) => {
      if (node.name !== 'left' && node.name !== 'right') return;

      const data = node.data || (node.data = {});
      data.hName = 'span';
      data.hProperties = { className: [node.name] };
    });
  };
}
