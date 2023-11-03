const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3002;
dotenv.config();
const con = mysql.createConnection({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
});

con.connect();


// Declaring Variables

var ticketSold = false, ticketAlreadyScanned = true;

function executeQuery(conn, query) {
  return new Promise((resolve, reject) => {
    conn.query(query, (err, result, fields) => {
      if (err) {
        reject(err);
        console.log("ERROR: " + err);
      } else {
        //console.log("RESOLVE: "+ result.length)
        resolve({ result, fields });
      }
    });
  });
}

app.post("/ticket", async (req, res) => {

    var num = req.body.tkt_num;

  const { result, fields } = await executeQuery(
    con,
    `select * from ticket_sold  where tkt_num = '${num}';`
  );

  if (result.length == 0) {
   res.json({
    tkt_sold: false,
    tkt_err: true,
    reason: "Ticket Not sold"
});
    ticketSold = false;
  } else {
    ticketSold = true;
  }

  if (ticketSold) {
    const { result, fields } = await executeQuery(
      con,
      `Select * from guest_entry where gusttkt_num = '${num}';`
    );

    if (result.length == 0) {
      ticketAlreadyScanned = false;

    } else {
      ticketAlreadyScanned = true;
      res.json({
        tkt_sold:true,
        tkt_err: true,
        reason: "Ticket Already Scanned"
    });
    }
  }

  if (!ticketAlreadyScanned) {
    var insertQuery = `Insert into guest_entry (gusttkt_num, gusttkt_status, gusttkt_time) values ('${num}','ENTERED','2023-10-31 12:45:00');`;
    const { result, fields } = await executeQuery(con, insertQuery);

    if (result.affectedRows == 1 ) {
        recordInserted = true
        res.json({
            tkt_sold:true,
            reason: "Sucesfully Updated Ticket"
        });
    }else{
        res.json({
            tkt_sold:true,
            tkt_err: true,
            reason: "Failed to update the ticket, Please reload and scan again."
        });
    }
  }

});
// Step 1:
app.use(express.static(path.resolve(__dirname, './../eventscanner/build')));
// Step 2:
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./../portfolio/build", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server is running on PORT number :", PORT);
});
