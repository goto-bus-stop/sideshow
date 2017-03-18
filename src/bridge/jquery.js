import SSException from "../general/exception";

//jQuery is needed
if (global.$ === undefined)
  throw new SSException("2", "jQuery is required for Sideshow to work.");

export default global.$;
