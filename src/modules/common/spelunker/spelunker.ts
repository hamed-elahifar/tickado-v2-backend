import { SpelunkerModule } from 'nestjs-spelunker';

export const spelunkerGraph = (app) => {
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  console.log('graph LR');
  const mermaidEdges = edges.map(
    ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
  );
  console.log(mermaidEdges.join('\n'));
};
