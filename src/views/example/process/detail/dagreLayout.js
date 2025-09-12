import dagre from 'dagre'

export const dagreLayout = (nodes, links, nodeConfig) => {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ 
    rankdir: 'LR', 
    nodesep: nodeConfig.margin.x, 
    ranksep: nodeConfig.margin.y,
    marginx: 50,
    marginy: 50
  })
  g.setDefaultEdgeLabel(() => ({}))

  // 设置节点
  nodes.forEach(node => {
    g.setNode(node.id, { 
      width: nodeConfig.width, 
      height: nodeConfig.height 
    })
  })

  // 设置边
  links.forEach(link => {
    g.setEdge(link.source, link.target)
  })

  // 执行布局计算
  dagre.layout(g)

  // 将布局结果应用到节点
  const layoutNodes = nodes.map(node => {
    const nodeWithPosition = g.node(node.id)
    return {
      ...node,
      x: nodeWithPosition.x - nodeConfig.width / 2,
      y: nodeWithPosition.y - nodeConfig.height / 2
    }
  })

  return {
    nodes: layoutNodes,
    links
  }
}