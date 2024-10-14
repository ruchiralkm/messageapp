import React, { useContext, useEffect, useState } from "react";
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);

  // Extract all the images shared in the chat and store them in msgImages state
  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  return chatUser ? (
    <div className="rs">
      {/* Profile section of the RightSidebar */}
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="User Avatar" />
        <h3>
          {chatUser.userData.name}{" "}
          <img src={assets.green_dot} className="dot" alt="Online Status" />
        </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />

      {/* Media Section - Show all shared images */}
      <div className="rs-media">
        <p>Media</p>
        <div className="media-grid">
          {msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="Shared Media"
                className="media-img"
              />
            ))
          ) : (
            <p>No_Media</p> // Display a message if no media is shared
          )}
        </div>
      </div>

      {/* Logout button */}
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className="rs">
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar;
