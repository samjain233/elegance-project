import React, { useState } from "react";
import styled from "styled-components";
import { eleganceRoute, mongoRoute, emRoute } from "../Routes";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Upload({ trigger, setTrigger }) {

  const toastOptions = { position: "bottom-right", autoClose: 5000, pauseOnHover: true, draggable: true, theme: "light" };
  const [file, setFile] = useState('');
  const [values, setValues] = useState({ title: "", description: "" });

  const fileHandleChange = (event) => { setFile(event.target.files[0]); };
  const textHandleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };

  //elegance server upload
  const eleganceServer = async (event) => {
    event.preventDefault();
    const { title, description } = values;
    const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
    const username = localID.username;
    try {
      const { data } = await axios.post(eleganceRoute, { file, title, description, username }, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.status === true) toast.success(data.msg, toastOptions);
    } catch (err) {
      if (err.response.status === 500) {
        toast.error("There was a problem with the server", toastOptions);
      } else {
        toast.error(err.response.data.msg, toastOptions);
      }
    }
    setTrigger(false);
  };


  //mongo server upload
  const mongoServer = async (event) => {
    event.preventDefault();
    const { title, description } = values;
    const username = "subrat";
    try {
      const { data } = await axios.post(mongoRoute, { file, title, description, username }, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.status === true) toast.success(data.msg, toastOptions);
    } catch (err) {
      if (err.response.status === 500) {
        toast.error("There was a problem with the server", toastOptions);
      } else {
        toast.error(err.response.data.msg, toastOptions);
      }
    }
    setTrigger(false);
  };

  //both server upload
  const emServer = async (event) => {
    event.preventDefault();
    const { title, description } = values;
    const username = "subrat";
    try {
      const { data } = await axios.post(emRoute, { file, title, description, username }, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.status === true) toast.success(data.msg, toastOptions);
    } catch (err) {
      if (err.response.status === 500) {
        toast.error("There was a problem with the server", toastOptions);
      } else {
        toast.error(err.response.data.msg, toastOptions);
      }
    }
    setTrigger(false);
  };


  return (
    <>
      {
        trigger === true ?
          (<UploadWindow>
            <div id="container">
              <button className="buttonUpload" onClick={() => setTrigger(false)}>Hide</button>
              <form>
                <input className="buttonUpload" type='file' accept=".mp4" onChange={(e) => fileHandleChange(e)} />
                <div id="input-box">
                  <input className="form__field" type="text" placeholder="Title" name="title" onChange={(e) => textHandleChange(e)} />
                  <input className="form__field" type="text" placeholder="Description" name="description" onChange={(e) => textHandleChange(e)} />
                </div>
                <div id="button-box">
                  <button className="buttonUpload" onClick={eleganceServer}>Upload to Elegance</button>
                  <button className="buttonUpload" onClick={mongoServer}>Upload to MongoDB</button>
                  <button className="buttonUpload" onClick={emServer}>Upload to Both</button>
                </div>
              </form>
            </div>
          </UploadWindow>)
          :
          ("")
      }
      <ToastContainer />
    </>
  )
}

// styling of components
const UploadWindow = styled.div`
background-color: rgba(0, 0, 0, 0.2);
height: 100vh;
width: 100vw;
position: fixed;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
#container {
  height: 50vh;
  width: 70vw;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: auto;
  form {
    height: 20vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    #input-box{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    #button-box{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}
`;