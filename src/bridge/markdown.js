import SSException from "../general/exception";

//Pagedown (the Markdown parser used by Sideshow) is needed
if (global.Markdown === undefined)
  throw new SSException(
    "4",
    "Pagedown (the Markdown parser used by Sideshow) is required for Sideshow to work."
  );

export default global.Markdown;
