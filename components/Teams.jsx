/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

// Teams Refactor

import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';

import {
  FormGroup, FormLabel, FormControl, DropdownButton, Dropdown,
} from 'react-bootstrap';
import { GameContext } from '../context/gameContext';

const Teams = () => {
  const { state } = useContext(GameContext);
  const { teams, setCurrTeam, setTeams } = state;

  const [teamNumber, setTeamNumber] = useState(2);
  const [teamNames, setTeamNames] = useState({});

  const setTeamDropdown = (number) => {
    const numberArr = [];
    for (let i = 2; i <= number; i++) {
      numberArr.push(i);
    }
    return numberArr.map((n, i) => (
      <Dropdown.Item
        key={i}
        value={n}
        onClick={(e) => {
          setTeamNumber(parseInt(e.target.text, 10));
        }}
        href={`#/${n}-teams`}
      >
        {`${n} `}
      </Dropdown.Item>
    ));
  };

  const enterError = () => {
    event.preventDefault();
    Swal.fire({
      icon: 'error',
      title: 'Fill Out The Full Form To Begin The Game!',
      width: 500,
      backdrop:
      'rgba(160, 160, 160, 0.39)',
    });
  };

  useEffect(() => {
    setTeams(Object.values(teamNames));
    setCurrTeam(teams[0]);
  }, [teamNames]);

  const listTeamForms = (n) => [...Array(n)].map((e, i) => {
    const count = i + 1;
    return (
      <form key={i}>
        <FormGroup
          controlId={i}
        >
          <FormLabel>{`Team ${count.toString()} Name`}</FormLabel>
          <FormControl
            type="text"
            name={`team${count.toString()}`}
            placeholder="Enter text"
            value={teamNames[`team${count}`]}
            onKeyDown={(e) => { if (e.key === 'Enter') { return enterError(); } return false; }}
            onChange={(e) => {
              if (e.key !== 'Enter') {
                setTeamNames({ ...teamNames, [`team${count}`]: e.target.value });
              }
            }}
          />
        </FormGroup>
      </form>
    );
  });

  return (
    <div>
      <DropdownButton id="dropdown-basic-button" title="Select number of Teams">
        {setTeamDropdown(6)}
      </DropdownButton>
      {listTeamForms(teamNumber)}
    </div>
  );
};

export default Teams;
