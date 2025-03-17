import React from "react";
import { useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error); // Log fejlen i konsollen

  return (
    <div style={{ display: "flex", gap: 20, flexDirection: "column", justifyContent: "center", alignContent: "center", textAlign: "center", padding: "2rem" }}>
        <h1 style={{marginTop: 30, fontFamily: "OmnesBold"}}>Ups! Noget gik galt.</h1>
        <p>{error?.status === 404 ? "Siden blev ikke fundet." : "Der opstod en uventet fejl."}</p>
        {error?.statusText && <p><i>{error.statusText}</i></p>}
        <Link to="/" style={{ display: "inline-block", marginTop: "1rem", textDecoration: "none", fontFamily: "OmnesBold", background: "#3c5a3f", color: "#fff", padding: "1rem 1rem", borderRadius: "10px" }}>
            Gå tilbage
        </Link>
        <div style={{display: "flex", flexDirection: "column", alignItems: "start", paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, background: "#f0f0f0", borderRadius: 10}}>
            <b style={{fontFamily: "OmnesBold"}}>Gentager fejlen sig?</b>
            <ol style={{listStylePosition: "outside", marginLeft: 20}}>
                <li style={{textAlign: "start"}}>Tag et screenshot af fejlmeddelelsen herunder.</li>
                <li style={{textAlign: "start"}}>Send det til Patrick på tlf.: <a href="sms:+004542377567">42377567</a></li>
            </ol>
        </div>
        <div style={{display: "flex", gap: 10, flexDirection: "column", alignItems: "start", padding: 10, background: "#f0f0f0", borderRadius: 10, width: "100%", maxWidth: 600}}>
            <b style={{fontFamily: "OmnesBold"}}>Fejlmeddelelse</b>
            <p style={{wordBreak: "break-word", fontSize: "0.9rem", textAlign: "start"}}>{error?.message || "Ingen detaljeret fejlbesked tilgængelig."}</p>
            
            {error?.stack && (
                <pre style={{overflowX: "auto", fontSize: "0.6rem", background: "#e0e0e0", padding: 10, borderRadius: 5, width: "100%", maxHeight: 200, overflowY: "hidden", whiteSpace: "pre-wrap", wordWrap: "break-word", textAlign: "left" }}>
                    {error.stack}
                </pre>
            )}
        </div>
    </div>
  );
}