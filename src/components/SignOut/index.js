import React from 'react';

import { withFirebase } from '../Firebase';
import { NavLink } from 'reactstrap'

const SignOutButton = ({ firebase }) => (
  <NavLink onClick={firebase.doSignOut}>
    Sign Out
  </NavLink>
);

export default withFirebase(SignOutButton);