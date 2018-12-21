export const off = (() => {
  if (document.removeEventListener) {
    return (node, eventName, handler, capture = false) => {
      node.removeEventListener(eventName, handler, capture);
    };
  }
  if (document.detachEvent) {
    return (node, eventName, handler) => {
      node.detachEvent(`on${eventName}`, handler);
    };
  }
  return null;
})();

export const on = (() => {
  if (document.addEventListener) {
    return (node, eventName, handler, capture = false) => {
      node.addEventListener(eventName, handler, capture);
    };
  }
  if (document.attachEvent) {
    return (node, eventName, handler) => {
      node.attachEvent(`on${eventName}`, (e = window.event) => {
        e.target = e.target || e.srcElement;
        e.currentTarget = node;
        handler.call(node, e);
      });
    };
  }
  return null;
})();

export const listen = (node, eventName, handler, capture = false) => {
  on(node, eventName, handler, capture);
  return () => {
    off(node, eventName, handler, capture);
  };
};
