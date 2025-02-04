/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */

import React, { useState, createContext, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './userContext';

const GameContext = createContext();

const GameContextProvider = ({ children }) => {
  // get what we need from UserContext
  const { userInfo } = useContext(UserContext);

  // const [videoBool, setVideoBool] = useState(false);
  const [video, setVideo] = useState({ song: 'Frankie Valli - Can\'t Take My Eyes Off Of You Karaoke Lyrics', uri: 'UXYjQa_osMI' });
  const [videos, setVideos] = useState([]);
  const [visibility, setVisibility] = useState(true);

  // Trivia Question State
  const [question, setQuestion] = useState(null);

  // Game Options (Load.jsx) State
  const [diff, setDiff] = useState('medium');
  const [category, setCategory] = useState(9);
  const [categories, setCategories] = useState({});
  const [timer, setTimer] = useState(30);

  // Team State
  const [teams, setTeams] = useState([]);
  const [currTeam, setCurrTeam] = useState(teams[0]);
  const [teamCards, setTeamCards] = useState([]);
  const [allTeams, setAllTeams] = useState([]);

  // Answered Questions Count - starts at 0, goes up each time a question is completed
  const [count, setCount] = useState(0);
  // boolean for if the game should end
  const [endGame, setEndGame] = useState(false);

  const [trivia, setTrivia] = useState(false);

  const triviaRequest = async () => {
    try {
      const { data } = await axios.get('/trivia/multi', {
        params: {
          categoryID: sessionStorage.category,
          diff: sessionStorage.diff,
        },
      });
      setQuestion(data);
    } catch (error) {
      // console.error(error);
    }
  };

  const boolRequest = async () => {
    try {
      const { data } = await axios.get('/trivia/bool', {
        params: {
          categoryID: sessionStorage.category,
          diff: sessionStorage.diff,
        },
      });
      setQuestion(data);
    } catch (error) {
      console.warn(error);
    }
  };

  const random = () => {
    const cats = Object.keys(categories);
    const rand = cats[Math.floor(Math.random() * cats.length)];
    sessionStorage.setItem('category', parseInt(rand, 10));
    return triviaRequest() || boolRequest();
  };

  const nextTeam = () => {
    for (let i = 0; i < teams.length; i++) {
      if (currTeam === teams[i]) {
        if (i + 1 !== teams.length) {
          setCurrTeam(teams[i + 1]);
        } else {
          setCurrTeam(teams[0]);
        }
      }
    }
  };

  //* for getting and sending team info to/from db
  const getTeams = (googleId) => {
    axios.get('/teams', { params: { googleId } })
      .then(({ data }) => {
        // data.sort((a, b) => (a.wins === b.wins ? b.highScore - a.highScore : b.wins - a.wins));
        setAllTeams(data);
      })
      .catch((err) => console.warn(err));
  };

  const handleTeams = () => {
    const { googleId } = userInfo;
    axios.get('/teams/set', { params: { teams, googleId } })
      .then(({ data }) => {
        setTeamCards(data);
        getTeams(googleId);
      })
      .catch((err) => console.warn(err));
  };

  //* Called from EndGame to update stats of all participating teams
  const modifyTeamCards = async (gameResults) => {
    if (gameResults && gameResults.length) {
      const { data: updatedTeams } = await axios.patch('/teams', { gameResults });
      // checks allTeams in state and replaces the team objects that have just been updated as well as replace
      // current teams
      setTeamCards(updatedTeams);
      setAllTeams((prevTeams) => {
        if (prevTeams.length) {
          return prevTeams.map((team) => updatedTeams.find((o) => o.id === team.id) || team);
        }
        return updatedTeams;
      });
    }
  };

  const clearCurrentTeams = () => {
    setTeamCards([]);
  };

  const increaseScore = () => {
    for (let i = 0; i < teams.length; i++) {
      if (currTeam === teams[i]) {
        sessionStorage.setItem(`score${i + 1}`, (Number(sessionStorage[`score${i + 1}`]) + 1));
        setVisibility(true);
      }
    }
  };

  const increaseCount = () => {
    setCount(count + 1);
  };

  // add songs from database to state. Should only run on start of a new game
  const addSongsToState = async () => {
    try {
      const { data } = await axios.get('/songs');
      if (data.length) {
        const rand = Math.floor(Math.random() * (data.length));
        setVideos(data);
        setVideo(data[rand]);
      } else {
        await axios.post('/songs');
        const { data } = await axios.get('/songs');
        const rand = Math.floor(Math.random() * (data.length - 1)) + 1;
        setVideos(data);
      }
    } catch (err) {
      // console.log('error with adding songs to state ', err);
    }
  };

  const halveChoices = () => {
    setVisibility((prevVis) => !prevVis);
  };

  const getCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const end = () => {
    sessionStorage.clear();
    setTrivia(false);
    setCount(0);
    setTeams([]);
    setCurrTeam(teams[0]);
  };

  const state = {
    video,
    videos,
    visibility,
    question,
    trivia,
    currTeam,
    setCurrTeam,
    teams,
    allTeams,
    setTeams,
    teamCards,
    diff,
    setDiff,
    category,
    setCategory,
    setTrivia,
    count,
    setCount,
    setEndGame,
    setVideo,
    setQuestion,
    categories,
    setCategories,
    timer,
    setTimer,
  };

  const gameProps = {
    state,
    getCategories,
    triviaRequest,
    boolRequest,
    random,
    nextTeam,
    getTeams,
    handleTeams,
    clearCurrentTeams,
    increaseScore,
    halveChoices,
    addSongsToState,
    increaseCount,
    end,
    modifyTeamCards,
  };

  return (
    <GameContext.Provider value={gameProps}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContextProvider, GameContext };
