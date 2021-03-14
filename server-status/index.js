const {
    EC2Client,
    DescribeInstancesCommand
  } = require("@aws-sdk/client-ec2");

const REGION = "us-east-2";

const ec2client = new EC2Client({ region: REGION });

const Gamedig = require("gamedig");

const params = {
    InstanceIds: [
        "i-043822a6585ffc35b"
    ]
}

exports.handler = async function(event, context) {

    console.log("Starting request. Getting server status...");

    let response = {};

    try {
        const data = await ec2client.send(new DescribeInstancesCommand(params));
        const isInstanceRunning = data.Reservations[0].Instances[0].State.Name == "running";

        if (isInstanceRunning) {
            const instanceIp = data.Reservations[0].Instances[0].PrivateIpAddress;
            console.log("Instance is running at " + instanceIp + ", querying game server...");

            await Gamedig.query({
                type: 'protocol-valve',
                host: instanceIp,
                port: 2457
            }).then((state) => {
                response.name = state.name;
                response.map = state.map;
                response.serverIp = state.connect;
                response.numPlayers = state.raw.numplayers;
                response.isServerAvailable = true;
            }).catch((error) => {
                console.log("Encountered an error requesting status from the server: " + error.message);
                response.isServerAvailable = false;
            })

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
            "Content-Type": "application/json"
        },
        "body": error.message
    }
}
