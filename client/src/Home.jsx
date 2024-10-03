import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const Home = () => {

    axios.defaults.withCredentials = true;
    const navigate = useNavigate();

    const handleLogout = async () => {
        console.log("clicked");
        try {
            await axios.post("http://localhost:3001/logout");
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    }

    return (
      <>
        <h2>Home page</h2>
        <button onClick={handleLogout}>Log out</button>
      </>
    )
  }
  
  export default Home;