function setState(Component, name = 'state') {
  const record = Component.$options[name];
  if (!record) return;
  const recordData = record.call(Component);
  Object.keys(recordData).forEach((key) => {
    if (key in Component) {
      return;
    }
    Component[key] = recordData[key];
  });
}

function stateGC(Component, name = 'stateGC') {
  const recordGC = Component.$options[name];
  if (!recordGC) return;
  const recordGCData = recordGC.call(Component);
  Object.keys(recordGCData).forEach((key) => {
    if (!(key in recordGCData)) return;
    const func = recordGCData[key];
    if (func && typeof func !== 'function') {
      delete Component[key];
      return;
    }
    if (func.call(Component)) delete Component[key];
  });
}
export default {
  data() {
    setState(this);
    stateGC(this);
    return {};
  }
};
