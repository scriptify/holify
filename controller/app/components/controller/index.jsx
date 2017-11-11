import React, { Component } from 'react';
import io from 'socket.io-client';
import './style.css';

import arrowIcon from '../../icons/arrow.svg';
import homeIcon from '../../icons/home.svg';
import menuIcon from '../../icons/menu.svg';
import micIcon from '../../icons/mic.svg';
import tiltIcon from '../../icons/tilt.svg';

const socket = io();
socket.on(`connect`, () => {
  socket.emit(`pair`, {
    name: `Maximilian`,
    password: `iloveholify`
  });
});

function home() {
  socket.emit(`command`, {
    type: `OS`,
    name: `CLOSE_APP`
  });
}

function direction(type) {
  socket.emit(`command`, {
    type: `APP`,
    name: `DIRECTION`,
    payload: type
  });
}

function menu() {
  socket.emit(`command`, {
    type: `APP`,
    name: `MENU`
  });
}

function back() {
  socket.emit(`command`, {
    type: `APP`,
    name: `BACK`
  });
}

function movement(data) {
  socket.emit(`command`, {
    type: `APP`,
    name: `MOVEMENT`,
    payload: data
  });
}

export default class Controller extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sendMovement: false,
      sendingThrottled: false
    };

    window.setInterval(() => {
      this.setState({
        sendMovement: this.state.sendMovement,
        sendingThrottled: !this.state.sendingThrottled
      });
    }, 50);

    window.addEventListener(`deviceorientation`, (e) => {
      const { acceleration } = e;
      if (this.state.sendMovement && !this.state.sendingThrottled) {
        movement({
          alpha: e.alpha,
          beta: e.beta,
          gamma: e.gamma
        });
      }
    });
  }

  render() {
    return (
      <div className={`controller`}>
        <header>Holify Controller</header>

        <div className={`bar top`}>
          <button className={`btn`} onClick={back}><img src={arrowIcon} alt={`arrow icon`} /></button>
          <button className={`btn`} onClick={home}><img src={homeIcon} alt={`home icon`} /></button>
          <button className={`btn`} onClick={menu}><img src={menuIcon} alt={`menu icon`} /></button>
        </div>

        <div className={`vertical-center`}>
          <div className={`directions`}>
            <button className={`btn`} onClick={() => direction(`LEFT`)}><img src={arrowIcon} alt={`arrow icon`} /></button>
            <button className={`btn right`} onClick={() => direction(`RIGHT`)}><img src={arrowIcon} alt={`arrow icon`} /></button>
            <button className={`btn up`} onClick={() => direction(`UP`)}><img src={arrowIcon} alt={`arrow icon`} /></button>
            <button className={`btn down`} onClick={() => direction(`DOWN`)}><img src={arrowIcon} alt={`arrow icon`} /></button>
          </div>
        </div>

        <div className={`bar bottom`}>
          <button className={`btn`}><img src={micIcon} alt={`mic icon`} /></button>
          <button
            className={this.state.sendMovement ? `btn active` : `btn`}
            onClick={() => {
              this.setState({
                sendMovement: !this.state.sendMovement,
                sendingThrottled: this.state.sendingThrottled
              });
            }}
          >
            <img src={tiltIcon} alt={`tilt icon`} />
          </button>
        </div>

      </div>
    );
  }
}
