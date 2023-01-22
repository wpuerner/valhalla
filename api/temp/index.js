const Gamedig = require("gamedig");
// import "gamedig";

Gamedig.query({
  type: "protocol-valve",
  host: "18.191.195.145",
  port: 2457,
})
  .then((state) => {
    console.log(state);
  })
  .catch((error) => {
    console.log(error);
  });
