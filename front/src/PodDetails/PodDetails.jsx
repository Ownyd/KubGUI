import React, { Component } from 'react';
import fetch from 'node-fetch';
import './PodDetails.css';

class ContextList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      podDetails: [],
      podLogs: [],
      podError: null,
      logError: null,
    };
  }
  componentDidMount() {
    const { match: { params } } = this.props;
    fetch(`http://192.168.211.211:8080/pod/${params.name}?context=${params.context}&namespace=${params.namespace}`)
      .then(res => res.json())
      .then(({ data, error }) => this.setState({ podDetails: data, podError: error }))
    fetch(`http://192.168.211.211:8080/pod/logs/${params.name}?context=${params.context}&namespace=${params.namespace}`)
      .then(res => res.json())
      .then(({ data, error}) => this.setState({ podLogs: data, logError: error }))
  }
  render() {
    const { podDetails, podLogs, podError, logError } = this.state;

    return (
      <div>
        <pre className="code_box" id="describe_pod">
          {podDetails.map(line => <p className="code_line">{podError ? podError : line}</p>)}
        </pre>
        <pre className="code_box" id="pod_log">
          {podLogs.map(log => <p className="code_line">{logError ? logError : log}</p>)}
        </pre>
      </div>
    );
  }
}

export default ContextList;
