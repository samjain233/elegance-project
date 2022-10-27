import React, { useState, useEffect } from "react";
import { registerRoute,verficationRoute } from "../Routes";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  //toast notification options
  const toastOptions = { position: "bottom-right", autoClose: 5000, pauseOnHover: true, draggable: true, theme: "light" };

  //storing form data in values
  const [values, setValues] = useState({ username: "", email: "", password: "", confirmPassword: "", verificationCode: "" });

  //whether to show verification window or not, depends on register form submitted or not
  const [verifyWindowShow, setVerifyWindowShow] = useState(false);

  //if key found, navigate to home
  useEffect(() => { const registerNavigationCheck = async () => { if (localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY)) navigate("/"); }; registerNavigationCheck(); }, []);
  useEffect(() => { const clearField = async () => { if (verifyWindowShow) document.getElementById("verifyCodeInput").value = ""; }; clearField(); }, [verifyWindowShow]);
  
  //user email verification function
  const handleVerify = async (event) => {
    event.preventDefault();
    const {username, verificationCode } = values;
    const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
    const { data } = await axios.post(verficationRoute, { username, verificationCode });
    if (data.status === false) { toast.error(data.msg, toastOptions) }
      else if (data.status === true) {localID.isVerified = true; localStorage.setItem(process.env.WEBSITE_LOCALHOST_KEY, JSON.stringify(localID)); navigate("/"); }
  };

  //register form submit function
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { password, username, email } = values;
      const { data } = await axios.post(registerRoute, { username, email, password });
      if (data.status === false) { toast.error(data.msg, toastOptions) }
      else if (data.status === true) { localStorage.setItem(process.env.WEBSITE_LOCALHOST_KEY, JSON.stringify(data.localID)); setVerifyWindowShow(true); }
    };
  };

  //register form entries validation function
  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (email === "") { toast.error("Email is required.", toastOptions); return false; }
    else if (username.indexOf(" ") >= 0) { toast.error("Username should not contain space.", toastOptions); return false; }
    else if (username.length < 3) { toast.error("Username should be greater than 3 characters.", toastOptions); return false; }
    else if (password.length < 5) { toast.error("Password should be equal or greater than 5 characters.", toastOptions); return false; }
    else if (password.indexOf(" ") >= 0) { toast.error("Password should should not contain space.", toastOptions); return false; }
    if (password !== confirmPassword) { toast.error("Password and confirm password should same.", toastOptions); return false; }
    return true;
  };
  const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };

  //frontend of register page, wrapped in return function
  return (
    <>
      <FormContainer>
        {
          verifyWindowShow === false ?
            (<form onSubmit={(event) => handleSubmit(event)}>
              <input type="text" placeholder="Username" name="username" onChange={(e) => handleChange(e)} />
              <input type="email" placeholder="Email" name="email" onChange={(e) => handleChange(e)} />
              <input type="password" placeholder="Password" name="password" onChange={(e) => handleChange(e)} />
              <input type="password" placeholder="Confirm Password" name="confirmPassword" onChange={(e) => handleChange(e)} />
              <button type="submit">Register</button>
              <span>Already have an account? <Link to="/login">Login</Link></span>
            </form>)
            :
            (<form onSubmit={(event) => handleVerify(event)}>
              <input id="verifyCodeInput" type="text" placeholder="Verification Code" name="verificationCode" onChange={(e) => handleChange(e)} />
              <button type="submit">Verify</button>
            </form>)
        }
      </FormContainer>
      <ToastContainer />
    </>
  )
}

//styling of register page
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