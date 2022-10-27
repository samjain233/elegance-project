import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  
  //checking key to access home page, otherwise redirect to login page
  useEffect(() => { const homeNavigationCheck = async () => { if (!localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY)) navigate("/login"); }; homeNavigationCheck(); }, []);
  return (
    <div>Home</div>
  )
}
