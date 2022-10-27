import React, { useState, useEffect } from "react";
import { loginRoute } from "../Routes";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  //toast notification options
  const toastOptions = { position: "bottom-right", autoClose: 5000, pauseOnHover: true, draggable: true, theme: "light" };

  //storing form data in values
  const [values, setValues] = useState({ username: "", password: "" });

  //if key found, navigate to home
  useEffect(() => { const loginNavigationCheck = async () => { if (localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY)) navigate("/"); }; loginNavigationCheck(); }, []);

  //login form submit function
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { password, username } = values;
      const { data } = await axios.post(loginRoute, { username, password });
      if (data.status === false) { toast.error(data.msg, toastOptions) }
      else if (data.status === true) { localStorage.setItem(process.env.WEBSITE_LOCALHOST_KEY, JSON.stringify(data.localID)); navigate("/"); }
    };
  };
  
  //login form entries validation function
  const handleValidation = () => {
    const { password, username } = values;
    if (password === "" || username.length === "") { toast.error("Email and Password Required", toastOptions); return false; }
    return true;
  };
  const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };

  //frontend of login page, wrapped in return function
  return (
    <>
      <FormContainer>
        <form onSubmit={(event) => handleSubmit(event)}>
          <input type="text" placeholder="Username" name="username" onChange={(e) => handleChange(e)} min="3" />
          <input type="password" placeholder="Password" name="password" onChange={(e) => handleChange(e)} />
          <button type="submit">Log In</button>
          <span>Don't have an account? <Link to="/register">Create One</Link></span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  )
}

//styling of login page
const FormContainer = styled.div`
height: 100vh;
width: 100vw;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
form {
  display: flex;
  flex-direction: column;
}
`;