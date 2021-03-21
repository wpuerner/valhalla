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

    let response = {
        "statusCode": 204,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    };

    return response;
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
    const params = {
        InstanceIds: [
            servers.get(serverId)
        ]
    }

    console.log("Stopping instance " + params.InstanceIds[0]);
    await ec2client.send(new StopInstancesCommand(params))
}

var formatError = function(error, statusCode) {
    return {
        "statusCode": statusCode,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": error.message
    }
}
