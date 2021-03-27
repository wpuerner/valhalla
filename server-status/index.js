const {
    EC2Client,
    DescribeInstancesCommand
  } = require("@aws-sdk/client-ec2");

const REGION = "us-east-2";

const ec2client = new EC2Client({ region: REGION });

const servers = new Map([
    ["1", "i-008b88e0c451f0725"],
    ["2", "i-043822a6585ffc35b"]
]);

const fetch = require("node-fetch");

exports.handler = async function(event, context) {

    const serverId = event.pathParameters.serverId;

    if(!servers.has(serverId)) return formatError(new Error("The supplied Server ID is not valid"), 400);

    let response = {};

    try {
        const params = {
            InstanceIds: [
                servers.get(event.pathParameters.serverId)
            ]
        }

        console.log("Starting request. Getting server status for instance" + params.InstanceIds[0]);

        const data = await ec2client.send(new DescribeInstancesCommand(params));
        const isInstanceRunning = data.Reservations[0].Instances[0].State.Name == "running";

        if (isInstanceRunning) {
            const instanceIp = data.Reservations[0].Instances[0].PrivateIpAddress;
            console.log("Instance is running at " + instanceIp + ", querying game server...");

            await fetch("https://ek2ta6hpv0.execute-api.us-east-2.amazonaws.com/Stage/valhalla/servers/server-ip/" + instanceIp + "/details")
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    response = json;
                });
            
            response.serverIp = data.Reservations[0].Instances[0].PublicIpAddress + ":2456";
            response.isServerAvailable = true;

        } else {
            response.isServerAvailable = false;
        }

    } catch(error) {
        return formatError(error)
    }

    return formatResponse(response);
}

var formatResponse = function(response) {
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify(response)
    }
}

var formatError = function(error) {
    return {
        "statusCode": 500,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": error.message
    }
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
