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
  };


  return (
    <>
      {
        trigger === true ?
          (<UploadWindow>
            <div id="container">
              <form>
                <input type='file' accept=".mp4" onChange={(e) => fileHandleChange(e)} />
                <div id="input-box">
                  <input type="text" placeholder="Title" name="title" onChange={(e) => textHandleChange(e)} />
                  <input type="text" placeholder="Description" name="description" onChange={(e) => textHandleChange(e)} />
                </div>
                <div id="button-box">
                  <button onClick={eleganceServer}>Upload to Elegance</button>
                  <button onClick={mongoServer}>Upload to MongoDB</button>
                  <button onClick={emServer}>Upload to Both</button>
                </div>
              </form>
              <button onClick={() => setTrigger(false)}>Hide</button>
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

`;