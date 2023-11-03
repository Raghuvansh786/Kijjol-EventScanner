import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

function LandingPage() {
  const [scanResult, setScanResult] = useState();
  const [showDetails, setShowDetails] = useState(false);
  const [transCompleted, setTransCompleted] = useState();
  const [ticketStatus, setTicketStatus] = useState();

  useEffect(() => {
    setTicketStatus()
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 300, height: 250 },
      fps: 10,
    });
    scanner.render(onScanSuccess);

    async function onScanSuccess(data) {
      setScanResult(data);
      await  axios
        .post("/ticket", {
          tkt_num: data,
        })
        .then((res) => {
          setTicketStatus(res.data);
        })
        .catch((err) => {
          console.log("Error occured in axios request" + err);
        });
      setShowDetails(true);
    }
  }, [transCompleted]);

  const NextScan = (e) => {
    setScanResult();
    setShowDetails(false);
    setTransCompleted(scanResult);
    // scanner.render()
  };

  return (
    <div className="homePage">
      <div className="header">
        <p>Kinjal Ticket Confirmation App</p>
      </div>
      <div id="reader" className="scanner"></div>
      {
      showDetails ? 
        <div className={ticketStatus.tkt_err ? 'resultsWrong' :'resultsCorrect'}>
          <h1>Scanning complete...</h1>
          <h3>The ticket number is : {scanResult}</h3>
        

      {ticketStatus.tkt_sold ? <h3 >Ticket Sold : Verified</h3>
      :<h3> Ticket Sold : Not Sold</h3>}
      <h3>Status: {ticketStatus.reason}</h3>
      <button onClick={NextScan} className="nextScan">Next Scan</button>
    </div>
      :""}
    </div>
  );
}

export default LandingPage;
