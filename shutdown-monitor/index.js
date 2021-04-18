const fetch = require("node-fetch");

const servers = ["1", "2"];

const serverStatusUrl = "https://ek2ta6hpv0.execute-api.us-east-2.amazonaws.com/Stage/valhalla/servers/{serverId}/state";

const serverStateUrl = "https://ek2ta6hpv0.execute-api.us-east-2.amazonaws.com/Stage/valhalla/servers/{serverId}/state/{state}";

exports.handler = async function(event, context) {

    for (const serverId of servers) {
        const serverStatus = await fetch(serverStatusUrl.replace("{serverId}", serverId))
            .then(response => response.json());
        
        console.log(`Got status for server ${serverId}: ${JSON.stringify(serverStatus)}`);

        if (serverStatus.isServerAvailable && serverStatus.numPlayers == 0) {
            console.log(`Server ${serverId} is running with no players, shutting down server...`);
            await fetch(serverStateUrl.replace("{serverId}", serverId).replace("{state}", "stop"), { method: "POST" })
                .then((res) => {
                    if (res.ok) {
                        console.log("...done!");
                    } else {
                        console.warn(`Got status ${res.status} while trying to shut down the server`);
                    }
                });
        }
    }

}