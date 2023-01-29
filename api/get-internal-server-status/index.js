const Gamedig = require("gamedig");

exports.handler = async function (instance, context) {
  try {
    for (const server of Object.values(instance.servers)) {
      try {
        const response = await Gamedig.query({
          type: server.gamedigType ? server.gamedigType : "protocol-valve",
          host: instance.privateIpAddress,
          port: server.queryPort,
        });

        server.state = "running";
        server.connect = response.connect;
        server.players = response.players;
      } catch (error) {
        server.state = "stopped";
      }
    }

    return instance;
  } catch (error) {
    return error;
  }
};
