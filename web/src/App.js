import "./App.css";
import React from "react";
import { FaRunning } from "react-icons/fa";
import { AiOutlineStop } from "react-icons/ai";

const API_HOST =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://ek2ta6hpv0.execute-api.us-east-2.amazonaws.com/prod";

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      instances: [],
    };
  }

  componentDidMount() {
    fetch(`${API_HOST}/valhalla/status`)
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          instances: result.instances,
          loading: false,
        });
      });
  }

  render() {
    console.log(this.state.instances);

    return (
      <div className="App">
        <div className="container">
          <Header />
          {this.state.loading && <Spinner />}
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

function Spinner(props) {
  return <div className="spinner"></div>;
}

function Header(props) {
  return (
    <div className="header">
      <img
        src="https://see.fontimg.com/api/renderfont4/LJnn/eyJyIjoiZnMiLCJoIjo2NSwidyI6MTAwMCwiZnMiOjY1LCJmZ2MiOiIjMDAwMDAwIiwiYmdjIjoiI0ZGRkZGRiIsInQiOjF9/VmFsaGFsbGE/odins-spear.png"
        alt="Viking fonts"
      />
    </div>
  );
}

function Instance(props) {
  console.log(props);

  return (
    <div className="instance">
      <div className="instance-header">
        <div>{props.instanceId}</div>
        {props.instance.state === "running" && (
          <button
            className="state-button"
            onClick={() => stopInstance(props.instanceId)}
          >
            Stop
          </button>
        )}
      </div>
      <div className="server-list">
        {Object.keys(props.instance.servers).map((serverId) => {
          return (
            <Server
              instanceId={props.instanceId}
              instance={props.instance}
              serverId={serverId}
              server={props.instance.servers[serverId]}
            />
          );
        })}
      </div>
    </div>
  );
}

function Server(props) {
  return (
    <div className="server">
      <div className="server-header">
        <div className={`server-state ${props.server.state}`}>
          {props.server.state === "running" && <FaRunning />}
          {props.server.state !== "running" && <AiOutlineStop />}
        </div>
        <h3>{props.server.name}</h3>
        {props.instance.state !== "running" && (
          <button
            className="state-button"
            onClick={() => startServer(props.instanceId, props.serverId)}
          >
            Start
          </button>
        )}
      </div>
      {props.server.state === "running" && (
        <div className="server-details">
          <div>{`${props.instance.publicIpAddress}:${props.server.playPort}`}</div>
        </div>
      )}
    </div>
  );
}

function stopInstance(instanceId) {
  window.alert(
    `Stopping instance ${instanceId}. Please wait a few seconds and refresh the page.`
  );
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
  window.alert(
    `Starting server ${serverId}. Please wait a few seconds and refresh the page.`
  );
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
