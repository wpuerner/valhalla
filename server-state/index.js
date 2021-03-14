const {
    EC2Client,
    DescribeInstancesCommand,
    StartInstancesCommand,
    StopInstancesCommand
  } = require("@aws-sdk/client-ec2");

const got = require("got");

const REGION = "us-east-2";

const ec2client = new EC2Client({ region: REGION });

const params = {
    InstanceIds: [
        "i-043822a6585ffc35b"
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

    let responseBody = {
        message: "Done!"
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    return response;
}

async function startServer() {
    console.log("Starting instance " + params.InstanceIds[0]);
    await ec2client.send(new StartInstancesCommand(params));
    await waitForServerAvailable();
}

async function waitForServerAvailable() {
    let serverAvailable = await isServerAvailable();
    while(!serverAvailable) {
        await sleep(5000);
        serverAvailable = await isServerAvailable();
    }
}

async function isServerAvailable() {
    const url = "https://6ds7reiz2e.execute-api.us-east-2.amazonaws.com/Prod/valhalla/state";
    const response = await got(url).json();
    console.log("Checking server availability: " + response.isServerAvailable);
    return response.isServerAvailable;
}

async function stopServer() {
    console.log("Stopping instance " + params.InstanceIds[0]);
    await ec2client.send(new StopInstancesCommand(params))
    await waitForInstanceState('stopped');
}

async function waitForInstanceState(state) {
    let currentState = await getInstanceState();
    while(currentState !== state) {
        await sleep(5000);
        currentState = await getInstanceState();
    }
}

async function getInstanceState() {
    const data = await ec2client.send(new DescribeInstancesCommand(params));
    const state = data.Reservations[0].Instances[0].State.Name;
    console.log("Checked instance state and got: " + state);
    return state;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }