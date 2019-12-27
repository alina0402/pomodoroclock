import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import "../node_modules/font-awesome/css/font-awesome.min.css";

const MINVALUE = 0;
const MAXVALUE = 60;

const ZERO_STATE = 0;
const SESSION_STATE = 1;
const BREAK_STATE = 1;

function ArrowDown(props){  // Down arrow clickable component - made with font-awesome arrow icon
  return(
    <button id = {props.id} className = 'arrow' onClick = {props.onClick}>
      <i className ="fa fa-arrow-down fa-2x"></i>
    </button>
  )
}

function ArrowUp(props){ // Up arrow clickable component - made with font-awesome arrow icon
  return(
    <button id = {props.id}  className = 'arrow' onClick = {props.onClick}>
      <i className ="fa fa-arrow-up fa-2x"></i>
    </button>
  )
}

class Pomodoro extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      breakValue: 5,  // minutes - the value changable by user
      breakValueSec: 300, // minutes - the value changable by user
      sessionValue: 25, // minutes - the value changable by user
      sessionValueSec: 1500, // minutes - the value changable by user
      timeLeft: '25:00', // the initial value of time left till beep
      interval: -1,  // number of timer, taken from setInterval function
      txtLabel: 'Session',
      typeOfState:ZERO_STATE,
      timerIsRunning: false,  
    }
    this.handleClickBreak = this.handleClickBreak.bind(this);
    this.handleClickSession = this.handleClickSession.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.timeDown = this.timeDown.bind(this);
    this.breakDown = this.breakDown.bind(this);
  };

  getStringedMinSec(numberMins, numberSecs){ // input: minutes and seconds in numbers; output: minutes and seconds as a string: 'dd:dd'
    return  (numberMins <= 9 ? '0' + numberMins : numberMins.toString()) + 
            ':' + 
            (numberSecs <= 9 ? '0' + numberSecs : numberSecs.toString())
  };

  makeBeep(){  // just beep, uses audio element with id='beep'
    document.getElementById('beep').play();
  }

  breakDown(){  // counts break seconds, when 0 starts timer
    this.setState((state) => ({
      sessionValueSec: state.sessionValue*60,  // returns sessionValueSec to the initial value
      breakValueSec: state.breakValueSec-1,  // decrements 1 second
      timeLeft: this.getStringedMinSec(Math.floor(state.breakValueSec/60), state.breakValueSec % 60),
    }))
    if(this.state.breakValueSec < 0){
      this.makeBeep();
      clearInterval(this.state.interval);

      this.setState({
        txtLabel: 'Session',
        interval: setInterval(this.timeDown, 1000),
        typeOfState: SESSION_STATE,
      })

      return;
    }
  }

  timeDown(){
    this.setState((state) => ({
      sessionValueSec: state.sessionValueSec-1,
      breakValueSec: state.breakValue*60,
      timeLeft: this.getStringedMinSec(Math.floor(state.sessionValueSec/60), state.sessionValueSec % 60),
    }))
    if(this.state.sessionValueSec < 0){
      this.makeBeep();
      clearInterval(this.state.interval);
      this.setState({
        txtLabel: 'Break',
        typeOfState: BREAK_STATE,
        interval: setInterval(this.breakDown, 1000),
      })
    }
  }

  beginCountDown(){
    this.timeDown();
    this.setState({
      interval: setInterval(this.timeDown, 1000), 
      timerIsRunning: true,
    })
  }

  pauseCountDown(){
    clearInterval(this.state.interval);
    this.setState({
      timerIsRunning: false,
    })
  }

  handleTimer(){
    console.log('play/pause pressed!');
    if(this.state.typeOfState === ZERO_STATE){
      this.setState({
        typeOfState: SESSION_STATE,
      })
      this.beginCountDown();
    }
    else{
      if(this.state.timerIsRunning)
        this.pauseCountDown();
      else
        this.beginCountDown();
    }
  }

  handleReset(){
    console.log('reset pressed!')
    document.getElementById('beep').pause();
    document.getElementById('beep').currenttime = 0;
    document.getElementById('beep').load();
    clearInterval(this.state.interval);
    this.setState({
      breakValue: 5,
      breakValueSec: 300,
      sessionValue: 25,
      sessionValueSec: 1500,
      timeLeft: '25:00',
      txtLabel: 'Session',
      interval: -1,
      typeOfState: ZERO_STATE,
    });
  }

  handleClickBreak(val){  // val === 1 => breakValue++; val === -1 => breakValue--
    if((val > 0 && this.state.breakValue < MAXVALUE) || //breakValue can't be <= 0 and > 60
       (val < 0 && this.state.breakValue > MINVALUE+1))
      this.setState((state) => ({
        breakValue: state.breakValue + val,
        breakValueSec: state.breakValueSec + val*60,
      }));
  }

  handleClickSession(val){ // val === 1 => breakValue++; val === -1 => breakValue--
    if((val > 0 && this.state.sessionValue < MAXVALUE) || //breakValue can't be <= 0 and > 60
       (val < 0 && this.state.sessionValue > MINVALUE+1)){
      this.setState((state) => ({
        sessionValue: state.sessionValue + val,
        sessionValueSec: state.sessionValueSec + val*60,
      }));
      // change timeLeft value:
      this.setState((state) => (
        {
          timeLeft: (state.sessionValue > 9 ? state.sessionValue.toString() : '0' + state.sessionValue) + ':00',
        }
      ))
    }
  }

  render(){
    return(
      <div className = "content">
        <h1>Pomodoro Clock</h1>
        <div className = "managingElements">
          <div className = "manage">
            <div id="break-label">Break Length</div>
              <div className = "decrementAndIncrement">
              <ArrowDown id = 'break-decrement' value = {this.state.breakValue} onClick = {() => this.handleClickBreak(-1)} />
              <div id = "break-length">{this.state.breakValue}</div>
              <ArrowUp id = 'break-increment' value = {this.state.breakValue} onClick = {() => this.handleClickBreak(1)} />
            </div>
          </div>
          <div className = "manage">
            <div id="session-label">Session length</div>
              <div className = "decrementAndIncrement">
                <ArrowDown id = 'session-decrement' value = {this.state.sessionValue} onClick = {() => this.handleClickSession(-1)} />
                <div id = "session-length">{this.state.sessionValue}</div>
                <ArrowUp id = 'session-increment' value = {this.state.sessionValue} onClick = {() => this.handleClickSession(1)} />
              </div>
          </div>
        </div>
        <div className = 'timerElement' id = "timerElement">
          <div id = 'timer-label'>{this.state.txtLabel}</div>
          <div id = 'time-left' className = {this.state.sessionValueSec <= 59 ? 'red' : 'green'}>{this.state.timeLeft}</div>
        </div>
        <div className = "playingElements">
          <button className = 'btn' id = 'start_stop'  onClick = {() => this.handleTimer()}>
            <i className ="fa fa-play fa-lg icon"></i>
            <i className ="fa fa-pause fa-lg icon"></i>
          </button>
          <button className = 'btn' id = 'reset' onClick = {() => this.handleReset()}>
            <i className ="fa fa-refresh fa-lg icon"></i>
          </button>
        </div>
        <audio  id = 'beep' 
                preload = 'auto' 
                src = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
                type="audio/ogg">
        </audio>
      </div>
    )
  }
}

ReactDOM.render(<Pomodoro />, document.getElementById('root'));

