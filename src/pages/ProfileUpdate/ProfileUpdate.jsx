import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, "users", uid);
      let updateData = { name, bio };

      if (image) {
        try {
          const imgUrl = await upload(image);
          updateData.avatar = imgUrl;
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      await updateDoc(docRef, updateData);
      toast.success("Profile updated successfully!");
      if (image) {
        setPrevImage(updateData.avatar);
        setImage(null);
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate("/chat");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setPrevImage(data.avatar || "");
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <motion.div
      className="profile"
      initial={{ opacity: 0, scale: 0.95 }} // Start slightly scaled down
      animate={{ opacity: 1, scale: 1 }} // Animate to full size and opacity
      exit={{ opacity: 0, scale: 0.95 }} // Exit with scale down and fade out
      transition={{ duration: 0.6, ease: "easeInOut" }} // Smooth transition
    >
      <motion.div
        className="profile-container"
        initial={{ y: 20 }} // Start slightly below
        animate={{ y: 0 }} // Animate to original position
        transition={{ duration: 0.5, delay: 0.1 }} // Slight delay for staggered effect
      >
        <form onSubmit={profileUpdate}>
          <motion.h3
            initial={{ y: -20, opacity: 0 }} // Start above and hidden
            animate={{ y: 0, opacity: 1 }} // Animate to original position and fully visible
            transition={{ duration: 0.5 }} // Smooth transition
          >
            Profile Details
          </motion.h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <motion.img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage || assets.avatar_icon
              }
              alt=""
              initial={{ scale: 0.8 }} // Start slightly smaller
              animate={{ scale: 1 }} // Animate to full size
              transition={{ duration: 0.3 }} // Smooth transition
              style={{
                borderRadius: "50%",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              }} // Rounded with shadow
            />
            <motion.span
              initial={{ scale: 0.9 }} // Start slightly smaller
              whileHover={{ scale: 1.05 }} // Enlarge on hover
              transition={{ type: "spring", stiffness: 300 }} // Spring effect
            >
              Upload profile image
            </motion.span>
          </label>
          <motion.input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
            whileFocus={{ scale: 1.02 }} // Slightly enlarge on focus
            transition={{ duration: 0.2 }} // Smooth transition
            style={{ boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }} // Input shadow
          />
          <motion.textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            whileFocus={{ scale: 1.02 }} // Slightly enlarge on focus
            transition={{ duration: 0.2 }} // Smooth transition
            style={{ boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }} // Textarea shadow
          ></motion.textarea>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            }} // Enlarge and add shadow on hover
            transition={{ duration: 0.2 }} // Smooth transition
          >
            {loading ? "Saving..." : "Save"}
          </motion.button>
        </form>
        <motion.img
          className="profile-pic"
          src={
            image ? URL.createObjectURL(image) : prevImage || assets.logo_icon
          }
          alt=""
          initial={{ opacity: 0, y: 20 }} // Start below and hidden
          animate={{ opacity: 1, y: 0 }} // Animate to fully visible and original position
          transition={{ duration: 0.5 }} // Smooth transition
          style={{
            borderRadius: "50%",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          }} // Rounded with shadow
        />
      </motion.div>
    </motion.div>
  );
};

export default ProfileUpdate;
