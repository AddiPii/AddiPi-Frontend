import React from "react";
import { Link } from "react-router-dom";

export default function NavBar(){
    return(
        <nav>
            <Link to="/">Home</Link>
            <Link to="/print">Print Your Model</Link>
        </nav>
    )
}