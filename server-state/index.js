const {
    EC2Client,
    StartInstancesCommand,
    StopInstancesCommand
  } = require("@aws-sdk/client-ec2");

const REGION = "us-east-2";

const ec2client = new EC2Client({ region: REGION });

const params = {
    InstanceIds: [
        "i-008b88e0c451f0725"
    ]
}

exports.handler = async function(event, context) {

    console.log('CONTEXT: ' + JSON.stringify(context));
    console.log('EVENT: ' + JSON.stringify(event));

    switch(event.pathParameters.state) {
        case 'start':
            await startServer();
            break;
        case 'stop':
            await stopServer();
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

async function startServer() {
    console.log("Starting instance " + params.InstanceIds[0]);
    await ec2client.send(new StartInstancesCommand(params));
}

async function stopServer() {
    console.log("Stopping instance " + params.InstanceIds[0]);
    await ec2client.send(new StopInstancesCommand(params))
}
