
import React, { Component } from 'react';
import fetch from 'node-fetch';
import './PodsList.scss'
import { Link } from 'react-router-dom'

const podsStatus = {
  CrashLoopBackOff: 0,
  Error: 1,
  Failed: 2,
  Unknown: 3,
  Pending: 4,
  PodInitializing: 6,
  Running: 5,
  Completed: 6,
  ContainerCreating: 7,
  Terminating: 8,
}

function getTagByStatus(status) {
  const n = podsStatus[status];
  if (n <= 3) return 'pga';
  if (n === 5) return 'mlb'
  if (n === 4 || n === 7 || n === 8) return 'nhl';
  if (n === 6) return 'nfl';
  return '';
}

class PodsList extends Component {
  constructor(props) {
    super(props);
    this.state = { pods: [] };
  }


  componentDidMount() {
    fetch('http://192.168.211.211:8080/pods')
      .then(res => res.json())
      .then(data => data.sort((vA, vB) => {
        return podsStatus[vA.status] - podsStatus[vB.status]
      }))
      .then(data => this.setState({ pods: data }))
  }

  componentWillReceiveProps(nextProps) {
    const { context, namespace } = nextProps;
    if (!context || !namespace) return;
    fetch(`http://192.168.211.211:8080/pods?context=${context}&namespace=${namespace}`)
    .then(res => res.json())
    .then(data => data.sort((vA, vB) => {
      return podsStatus[vA.status] - podsStatus[vB.status]
    }))
    .then(data => this.setState({ pods: data }))
  }

  render() {
    const { pods } = this.state;
    const { context, namespace, search } = this.props;

    const filteredPods = search === null ? pods :
      pods.filter(pod => pod.name.match(search, "i"));
    return (
        <div id="podsWrapper">
          {/* { pods.length !== 0 ? <table className="podsTable">
            <thead>
              <tr className="podsHead">
                { podsAttribs.map(atr => <th key={atr}>{atr}</th>) }
              </tr>
            </thead>
            <tbody>
              { pods.map((pod) => <tr key={pod.name} id={`podLine_${podsStatus[pod.status]}`}>
                <td className="podName"><Link to={`/pod/${pod.name}/${context}/${namespace}`}>{pod.name}</Link></td>
                <td className="podReadiness">{pod.ready}</td>
                <td className="podStatus">{pod.status}</td>
                <td className="podRestarts">{pod.restarts}</td>
                <td className="podAge">{pod.age}</td>
              </tr>
              )}
            </tbody>
          </table> : <p> No Pods Found </p>} */}
          <main className="row title fixed">
            <ul>
              <li className="podName">Name</li>
              <li>Ready</li>
              <li>Status</li>
              <li>Restarts</li>
              <li>Age</li>
              <li>Actions</li>
            </ul>
          </main>
          {filteredPods.map(pod =>
            <section key={pod.name}>
              <article className={`row ${getTagByStatus(pod.status)}`}>
                <ul>
                  <li className="podName"><Link to={`/pod/${pod.name}/${context}/${namespace}`}>{pod.name}</Link></li>
                  <li>{pod.ready}</li>
                  <li>{pod.status}</li>
                  <li>{pod.restarts}</li>
                  <li>{pod.age}</li>
                  <li><Link className="white" to={`/terminal/${pod.name}/${context}/${namespace}`}>SSH</Link></li>
                </ul>
              </article>
            </section>
          )}
        </div>
    );
  }
}

export default PodsList;
