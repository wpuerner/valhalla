import "./App.css";
import React from "react";
import { FaRunning } from "react-icons/fa";
import { AiOutlineStop } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { BiDownArrow } from "react-icons/bi";

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
      users: [],
    };
  }

  componentDidMount() {
    fetch(`${API_HOST}/valhalla/status`)
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          users: result.users,
          instances: result.instances,
          loading: false,
        });
      });
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          <Header />
          {this.state.loading ? (
            <Spinner />
          ) : (
            <div>
              <Users users={this.state.users} />
              {Object.keys(this.state.instances).map((instanceId) => {
                return (
                  <Instance
                    instanceId={instanceId}
                    instance={this.state.instances[instanceId]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersListState: "",
      users: props.users,
    };

    this.deleteUser = this.deleteUser.bind(this);
  }

  deleteUser(user) {
    if (!window.confirm(`Really remove user ${user.name}?`)) return;

    console.log(`Deleting user ${user.name}`);
    fetch(`${API_HOST}/valhalla/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.name,
        ipAddress: user.ipAddress,
        action: "remove",
      }),
    });
  }

  toggleUsersList() {
    this.setState({
      usersListState: this.state.usersListState === "open" ? "" : "open",
    });
  }

  render() {
    return (
      <div className="users">
        <div className="users-header">
          <h3>Users</h3>
          <button
            className="menu-button"
            onClick={() => this.toggleUsersList()}
          >
            <BiDownArrow
              className={`menu-icon ${
                this.state.usersListState === "open" ? "menu-icon-open" : ""
              }`}
            />
          </button>
        </div>
        <div className={`users-list ${this.state.usersListState}`}>
          {this.state.users.map((user) => {
            return (
              <div className="user">
                <span className="user-name">{user.name}</span>
                <span className="user-ip-address">{user.ipAddress}</span>
                <MdDeleteForever
                  className="user-delete-button"
                  onClick={() => this.deleteUser(user)}
                />
              </div>
            );
          })}
          <AddUserForm />
        </div>
      </div>
    );
  }
}

class AddUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      ipAddress: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value,
    });
  }

  async handleSubmit(event) {
    if (
      this.validateIpAddress() !== "form-valid" ||
      this.validateName() !== "form-valid"
    ) {
      window.alert("Please correct inputs and try again");
      return;
    }
    if (!window.confirm(`Really add user ${this.state.name}?`)) return;

    await fetch(`${API_HOST}/valhalla/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.state.name,
        ipAddress: this.state.ipAddress,
        action: "add",
      }),
    });

    window.alert(`User ${this.state.name} was successfully added.`);
  }

  validateName() {
    return this.state.name.match("^[a-zA-Z0-9]+$")
      ? "form-valid"
      : "form-invalid";
  }

  validateIpAddress() {
    return this.state.ipAddress.match("^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}")
      ? "form-valid"
      : "form-invalid";
  }

  render() {
    return (
      <form className="add-user-form" onSubmit={this.handleSubmit}>
        <input
          className={`add-user-name ${this.validateName()}`}
          type="text"
          name="name"
          placeholder="Name"
          value={this.state.name}
          onChange={this.handleChange}
        />
        <input
          className={`add-user-ip-address ${this.validateIpAddress()}`}
          type="text"
          name="ipAddress"
          placeholder="IP Address"
          value={this.state.ipAddress}
          onChange={this.handleChange}
        />
        <input className="add-user-button" type="submit" value="Add User" />
      </form>
    );
  }
}

function Spinner() {
  return <div className="spinner"></div>;
}

function Header() {
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
