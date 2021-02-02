const express = require("express");
const app = express();
const port = 8000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const io = require("socket.io")(server);

let totalConnections = 0;

const bidItem = {
  name: "How You Get Anything Done Ever",
  author: "Google",
  desc: "programming book",
  startPrice: 13.99,
  currentPrice: 13.99,
  buyOutPrice: 99.95,
  category: "Books",
  bids: [],
};

// this will listen to a socket being connected
io.on("connect", (socket) => {
  totalConnections++;

  console.log(`New bidder connected. ${totalConnections} bidders connected`);

  // this socket sends an event out so the rest of the app can listen for it
  socket.emit("item updated", bidItem);

  socket.on("new bid", (bidAmt) => {
    // or if using a db .findByIdAndUpdate
    // .then emit updatesd info to client
    bidItem.currentPrice = bidAmt;

    bidItem.bids.push({
      id: socket.id,
      amount: bidAmt,
      date: new Date(),
    });

    // io.emit insted of socket.emit
    // this will emit event to all sockets instead of just this one
    // socket.broadcast will emit to all sockets except this one
    io.emit("item updated", bidItem);
  });

  // This will listen for each specific socket that disconnects
  socket.on("disconnect", () => {
    totalConnections--;

    console.log(`Bidder disconnected. ${totalConnections} bidders connected.`);
  });
});
