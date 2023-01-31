import { createServer } from "miragejs";

export default function startMockServer() {
  createServer({
    routes() {
      this.get(
        "/valhalla/status",
        () => ({
          instances: {
            "i-008b88e0c451f0725": {
              startupServerId: "3",
              servers: {
                1: {
                  name: "MikeJohnstonsHouse",
                  playPort: "2456",
                  queryPort: "2457",
                  type: "valheim",
                  state: "stopped",
                },
                3: {
                  name: "SomeOtherServer",
                  playPort: "2458",
                  queryPort: "2459",
                  type: "valheim",
                  state: "running",
                  connect: "10.0.0.115:2458",
                  players: [],
                },
              },
              state: "running",
              privateIpAddress: "10.0.0.115",
              publicIpAddress: "3.145.105.122",
            },
            "i-008b88e0c7893yw78": {
              startupServerId: "3",
              servers: {
                1: {
                  name: "TestServerThree",
                  playPort: "2456",
                  queryPort: "2457",
                  type: "valheim",
                  state: "stopped",
                },
                3: {
                  name: "TestServerFour",
                  playPort: "2458",
                  queryPort: "2459",
                  type: "valheim",
                  state: "stopped",
                },
              },
              state: "stopped",
              privateIpAddress: "10.0.0.115",
              publicIpAddress: "3.145.105.122",
            },
          },
        }),
        { timing: 4000 }
      );

      this.post("/valhalla/state", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        console.log(attrs);
      });
    },
  });
}
