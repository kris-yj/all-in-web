const MAX_SPAN = 0.001;

export default function splineNodes(startNode, endNode) {
  if (!(startNode && endNode)) return [];
  const ret = [];
  const dx = endNode.lon - startNode.lon;
  const dy = endNode.lat - startNode.lat;
  const count = Math.sqrt(dx ** 2 + dy ** 2) / MAX_SPAN;
  const lonSpan = dx / (count - 1);
  const latSpan = dy / (count - 1);
  const rotate = Math.PI + Math.PI / 2 - Math.atan2(dy, dx);
  let i = 0;
  while (i < count) {
    ret.push({
      lon: startNode.lon + lonSpan * i,
      lat: startNode.lat + latSpan * i,
      rotate
    });
    i += 1;
  }
  ret[ret.length - 1 >= 0 ? ret.length - 1 : 0] = { lon: endNode.lon, lat: endNode.lat, rotate };
  return ret;
}
