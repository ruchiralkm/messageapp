import React, { useState } from "react";
import "./Login.css";
import assets from "../../assets/assets";
import { signup, login } from "../../config/firebase";
import { ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const [currState, setCurrState] = useState("Sign up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign up") {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: { ease: "easeInOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <motion.div
      className="login"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <ToastContainer />
      <motion.img
        src={assets.logo_big}
        alt=""
        className="logo"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      />
      <motion.form
        onSubmit={onSubmitHandler}
        className="login-form"
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>{currState}</motion.h2>
        <AnimatePresence mode="wait">
          {currState === "Sign up" && (
            <motion.input
              key="username"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
              type="text"
              placeholder="Username"
              className="form-input"
              required
            />
          )}
        </AnimatePresence>
        <motion.input
          variants={itemVariants}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email"
          className="form-input"
          required
        />
        <motion.input
          variants={itemVariants}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />
        <motion.button
          type="submit"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currState === "Sign up" ? "Create account" : "Login now"}
        </motion.button>
        <motion.div className="login-term" variants={itemVariants}>
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </motion.div>
        <motion.div className="login-frogot" variants={itemVariants}>
          {currState === "Sign up" ? (
            <p className="login-toggle">
              Already have an account{" "}
              <motion.span
                onClick={() => setCurrState("Login")}
                whileHover={{ scale: 1.1, color: "#007bff" }}
              >
                Login here
              </motion.span>
            </p>
          ) : (
            <p className="login-toggle">
              Create an account{" "}
              <motion.span
                onClick={() => setCurrState("Sign up")}
                whileHover={{ scale: 1.1, color: "#007bff" }}
              >
                click here
              </motion.span>
            </p>
          )}
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export default Login;
