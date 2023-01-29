import "./App.css";
import React from "react";

const API_HOST =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://ek2ta6hpv0.execute-api.us-east-2.amazonaws.com/prod";

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instances: [],
    };
  }

  componentDidMount() {
    fetch(`${API_HOST}/valhalla/status`)
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          instances: result.instances,
        });
      });
  }

  render() {
    console.log(this.state.instances);

    return (
      <div className="App">
        <div className="container">
          {Object.keys(this.state.instances).map((instanceId) => {
            return (
              <Instance
                instanceId={instanceId}
                instance={this.state.instances[instanceId]}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

function Instance(props) {
  console.log(props);

  return (
    <div className="instance">
      <div className="instance-header">
        <div>{props.instanceId}</div>
        <div>{props.instance.state}</div>
        {props.instance.state === "running" && (
          <button onClick={() => stopInstance(props.instanceId)}>Stop</button>
        )}
      </div>
      {Object.keys(props.instance.servers).map((serverId) => {
        const server = props.instance.servers[serverId];

        return (
          <div className="server">
            <div className="server-header">
              <h3>{server.name}</h3>
              <div className={`server-state ${server.state}`}>
                {server.state.toUpperCase()}
              </div>
            </div>
            <div className="server-details">
              <div>{serverId}</div>
              <div>{server.connect}</div>
            </div>
            {props.instance.state !== "running" && (
              <button onClick={() => startServer(props.instanceId, serverId)}>
                Start
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function stopInstance(instanceId) {
  fetch(`${API_HOST}/valhalla/state`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state: "stop",
      instanceId: instanceId,
    }),
  });
}

function startServer(instanceId, serverId) {
  fetch(`${API_HOST}/valhalla/state`, {
    method: "POST",
    body: JSON.stringify({
      state: "start",
      instanceId: instanceId,
      serverId: serverId,
    }),
  });
}

export default App;
