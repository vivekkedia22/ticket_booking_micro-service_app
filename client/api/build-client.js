import axios from "axios";

export default ({ req }) => {
  console.log("something is happening here");
  if (typeof window === "undefined") {
    // we are on the server
    console.log("this is the server")
    return axios.create({
      baseURL:
        "http://www.vivekdevs.site",
      headers: req.headers,
    });
  } else {
    // we are on the browser
    console.log("this is the browser")
    return axios.create({ baseURL: "http://www.vivekdevs.site" });
  }
};
