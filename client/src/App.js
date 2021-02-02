import React, { useEffect, useState } from "react";
import "./App.css";

import io from "socket.io-client";

// alternative to setting up socket with state
// we only want to open socket one time
// pass in transports to connect frontend <--> backend
const socket = io(":8000", {
  transports: ["websocket", "polling", "flashsocket"],
});

function App() {
  // passing a callback function lets react and useState know that
  // we only want to set this one time, no setSocket
  // const [socket] = useState(() => io(":8000"));

  const [bidItem, setBidItem] = useState(null);
  const [bidAmount, setBidAmount] = useState(null);

  const handleSetBidAmountOnChange = (event) => {
    setBidAmount(event.target.value);
  };

  useEffect(() => {
    // add this listener once so we don't have
    // multiple listeners listening for the same event
    socket.on("item updated", (updatedBidItem) => {
      setBidItem(updatedBidItem);
      // even though we just setBidItem, it is async so ther is
      // no guarnatee to be updated yet. That's why we use the
      // updatedBidItem.currentPrice here
      // setBidAmount(updatedBidItem.currentPrice + 1);
    });

    // this returned callback will be executed when the component
    // unmounts (removed from DOM, not being rendered)
    // you do need to do this in the app component
    return () => {
      socket.disconnect(true);
    };
  }, []);

  // updates input prefill box whenever the bidItem is updated
  // similar to above
  useEffect(() => {
    if (bidItem !== null) {
      setBidAmount(bidItem.currentPrice + 1);
    }
  }, [bidItem]);

  if (bidItem === null) {
    return "Loading...";
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    // input boxes are always strings,
    // convert to int with + sign
    const bidAmt = +bidAmount;

    if (bidAmt > bidItem.currentPrice) {
      socket.emit("new bid", bidAmt);
    }
  };

  return (
    <div className="App">
      <form
        onSubmit={(event) => {
          handleSubmit(event);
        }}
      >
        <input
          type="number"
          value={bidAmount}
          placeholder="$"
          step=".01"
          onChange={handleSetBidAmountOnChange}
        />
        <button disabled={bidAmount > bidItem.currentPrice ? false : true}>
          Place Bid
        </button>
      </form>

      <div style={{ display: "inline-block", width: "100%" }}>
        <hr />
        <h1>{bidItem.name}</h1>
        <h3>Author: {bidItem.author}</h3>
        <p>Description: {bidItem.desc}</p>
        <h4>Start Price: ${bidItem.startPrice}</h4>
        <h4>Current Price: ${bidItem.currentPrice}</h4>
        <hr />
        <div>
          <img src="#" alt={bidItem.name} width="30%" />
        </div>
      </div>

      <div style={{ display: "inline-block", width: "45%" }}>
        {bidItem.bids.map((bid, i) => {
          return (
            <p key={i}>
              Amount: {bid.amount} | By: {bid.id} | On: {bid.date}
            </p>
          );
        })}
      </div>
      <hr />
    </div>
  );
}

export default App;
