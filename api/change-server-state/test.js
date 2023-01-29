const { handler } = require("./index.js");

const input = {
  state: "stop",
  instanceId: "i-043822a6585ffc35b",
  serverId: "1",
};

const request = {
  body: JSON.stringify(input),
};

handler(request, undefined).then((response) => console.log(response));
