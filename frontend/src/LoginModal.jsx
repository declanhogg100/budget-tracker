import { useState } from "react";
import "./LoginModal.css";

function LoginModal({ setModal, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password, signup);
  };

  return (
    <div className="loginOverlay">
      <div className="loginModal" onClick={(e) => e.stopPropagation()}>
        <h2 className="loginTitle">{signup ? "Signup" : "Login"}</h2>
        <div className="loginDivider"></div>
        <form onSubmit={handleSubmit} className="loginForm">
          <input
            type="text"
            placeholder="Username or Email"
            value={username}
            onChange={(e) => {
                if(e.target.value.length<=30) setUsername(e.target.value);
                
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="loginButton">{signup ? "Signup" : "Login"}</button>
        </form>
        <div className = "noAcc">{signup ? "Have An Account?" : "No Account?"}</div>
        <button className = "changeSign" onClick = {() => {setSignup(!signup)}}>{signup ? "Login" : "Signup"}</button>
      </div>
    </div>
  );
}

export default LoginModal;