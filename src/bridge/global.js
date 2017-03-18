export default (() => {
  if (typeof window !== "undefined") return window;
  if (typeof self !== "undefined") return self;
})();
