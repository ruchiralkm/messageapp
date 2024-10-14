import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { motion } from "framer-motion";

const ChatBox = () => {
  const { userData, chatUser, setMessagesId } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (chatUser && chatUser.messageId) {
      const unSub = onSnapshot(
        doc(db, "messages", chatUser.messageId),
        (res) => {
          if (res.exists()) {
            setMessages(res.data().messages.reverse());
          }
        }
      );
      return () => unSub();
    }
  }, [chatUser]);

  const sendMessage = async () => {
    try {
      if (input && chatUser && chatUser.messageId) {
        const messageDoc = doc(db, "messages", chatUser.messageId);
        await updateDoc(messageDoc, {
          messages: arrayUnion({
            sId: userData.id, // Sender ID
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        for (const id of userIDs) {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatData.findIndex(
              (c) => c.messageId === chatUser.messageId
            );
            if (chatIndex !== -1) {
              userChatData.chatData[chatIndex] = {
                ...userChatData.chatData[chatIndex],
                lastMessage: input.slice(0, 30),
                updatedAt: Date.now(),
                messageSeen: id !== userData.id,
              };
              await updateDoc(userChatsRef, {
                chatData: userChatData.chatData,
              });
            }
          }
        }

        setInput("");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && chatUser && chatUser.messageId) {
        const messageDoc = doc(db, "messages", chatUser.messageId);

        await updateDoc(messageDoc, {
          messages: arrayUnion({
            sId: userData.id, // Sender ID
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        for (const id of userIDs) {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatData.findIndex(
              (c) => c.messageId === chatUser.messageId
            );
            if (chatIndex !== -1) {
              userChatData.chatData[chatIndex] = {
                ...userChatData.chatData[chatIndex],
                lastMessage: "Image",
                updatedAt: Date.now(),
                messageSeen: id !== userData.id,
              };
              await updateDoc(userChatsRef, {
                chatData: userChatData.chatData,
              });
            }
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const chatBoxVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  return chatUser ? (
    <motion.div
      className="chat-box"
      variants={chatBoxVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="chat-user"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src={chatUser.userData.avatar} alt="User Avatar" />
        <p>
          {chatUser.userData.name}{" "}
          <img className="dot" src={assets.green_dot} alt="Online Status" />
        </p>
        <img src={assets.help_icon} className="help" alt="Help" />
      </motion.div>

      <motion.div
        className="chat-msg"
        initial="hidden"
        animate="visible"
        variants={messageVariants}
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            initial="hidden"
            animate="visible"
            variants={messageVariants}
          >
            {msg.image ? (
              <motion.img
                className="msg-img"
                src={msg.image}
                alt=""
                whileHover={{ scale: 1.05 }}
              />
            ) : (
              <motion.p className="msg" whileHover={{ scale: 1.05 }}>
                {msg.text}
              </motion.p>
            )}

            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt="Profile"
              />
              <p>
                {msg.createdAt && msg.createdAt.toDate
                  ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="chat-input"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
          whileFocus={{ scale: 1.02 }}
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <motion.label
          htmlFor="image"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={assets.gallery_icon} alt="Gallery" />
        </motion.label>
        <motion.img
          onClick={sendMessage}
          src={assets.send_button}
          alt="Send"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      </motion.div>
    </motion.div>
  ) : (
    <motion.div
      className="chat-welcome"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <motion.img
        src={assets.logo_icon}
        alt="Logo"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Chat anytime, anywhere
      </motion.p>
    </motion.div>
  );
};

export default ChatBox;
