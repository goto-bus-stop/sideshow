import Sideshow from "@goto-bus-stop/sideshow";
import marked from "marked";
import "./tutorials/introducing_sideshow";

Sideshow.config.language = "en";

Sideshow.registerParser("marked", marked);

Sideshow.init();

document.querySelector("#run_example").onclick = () => {
  Sideshow.start({ listAll: true });
};
