const {
    EC2Client,
    StartInstancesCommand,
    StopInstancesCommand
  } = require("@aws-sdk/client-ec2");

const REGION = "us-east-2";

const ec2client = new EC2Client({ region: REGION });

const servers = new Map([
    ["1", "i-008b88e0c451f0725"],
    ["2", "i-043822a6585ffc35b"]
]);

const fetch = require("node-fetch");

const statusServiceUrl = "https://ek2ta6hpv0.execute-api.us-east-2.amazonaws.com/Stage/valhalla/servers/{serverId}/state"

const noContentResponse = { "statusCode": 204 };

exports.handler = async function(event, context) {

    const serverId = event.pathParameters.serverId;

    if(!servers.has(serverId)) return formatError(new Error("The supplied Server ID is not valid"), 400);

    switch(event.pathParameters.state) {
        case 'start':
            await startServer(serverId);
            break;
        case 'stop':
            await stopServer(serverId);
            break;
        default:
            console.log("Received an invalid path parameter, exiting...");
    }

    return noContentResponse;
}

async function startServer(serverId) {
    const params = {
        InstanceIds: [
            servers.get(serverId)
        ]
    }

    console.log("Starting instance " + params.InstanceIds[0]);
    await ec2client.send(new StartInstancesCommand(params));
}

async function stopServer(serverId) {

    const numPlayers = await fetch(statusServiceUrl.replace("{serverId}", serverId))
        .then(response => response.json())
        .then(json => {
            return json.numPlayers
        });
        
    if (numPlayers === 0) {
        const params = {
            InstanceIds: [
                servers.get(serverId)
            ]
        }

        console.log(`Stopping instance ${params.InstanceIds[0]}`);
        await ec2client.send(new StopInstancesCommand(params));
    } else {
        console.log(`The server won't terminate because there are ${numPlayers} currently playing`);
    }
}

var formatError = function(error, statusCode) {
    return {
        "statusCode": statusCode,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": error.message
    }
}
