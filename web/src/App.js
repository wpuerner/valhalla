import "./App.css";
import React from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instances: [],
    };
  }

  componentDidMount() {
    fetch("http://localhost:3000/api/server-state")
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          instances: transformServerData(result),
        });
      });
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          {this.state.instances.map((instance) => (
            <Instance instance={instance} />
          ))}
        </div>
      </div>
    );
  }
}

class Instance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDrawerOpen: true,
      instance: props.instance,
    };
    this.changeDrawerState = this.changeDrawerState.bind(this);
  }

  changeDrawerState() {
    console.log(this.state.isDrawerOpen);
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen,
    });
  }

  render() {
    return (
      <div className="instance">
        <div className="instance-header">
          <h3>{this.state.instance.id}</h3>
          <div>{this.state.instance.state}</div>
          <div onClick={this.changeDrawerState}>
            {this.state.isDrawerOpen ? <BsChevronDown /> : <BsChevronUp />}
          </div>
        </div>
        {this.state.isDrawerOpen && (
          <div>
            {this.state.instance.servers.map((server) => (
              <Server server={server} />
            ))}
          </div>
        )}
      </div>
    );
  }
}

function Server(props) {
  return (
    <div className="server">
      <div className="server-header">
        <h3>{props.server.name}</h3>
        <h3>{props.server.state}</h3>
      </div>
      <div className="server-details">
        <div>{props.server.id}</div>
        <div>{props.server.connect}</div>
      </div>
      <div className="server-actions">
        <button>Start/Stop</button>
      </div>
    </div>
  );
}

function transformServerData(data) {
  const instanceMap = new Map();
  for (const server of data.servers) {
    const instanceId = server.instanceId;
    if (!instanceMap.has(instanceId)) {
      instanceMap.set(instanceId, {
        id: instanceId,
        state: server.instanceState,
        servers: [],
      });
    }

    instanceMap.get(instanceId).servers.push({
      id: server.serverId,
      state: server.serverState,
      name: server.name,
      players: server.players,
      connect: server.connect,
    });
  }

  return Array.from(instanceMap.values());
}

export default App;
