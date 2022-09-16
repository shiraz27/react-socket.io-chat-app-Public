import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";

/**
 *
 * Renders top navbar and shows the current signed in user.
 */
export default class NavBar extends Component {
  state = {};
  render() {
    return (
      <Navbar inverse="true">
        {/* <Navbar.Header> */}
        <div>
          <Navbar.Brand>Cool Chat</Navbar.Brand>
          <Navbar.Toggle />
        </div>
        {/* </Navbar.Header> */}
        <Navbar.Collapse>
          <Navbar.Text>
            Signed in as:&nbsp;
            <span className="signed-in-user">
              {(this.props.signedInUser || {}).name}
            </span>
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
