import { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';
import axios from 'axios';
import './App.css';

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

function App() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const res = await axios.get(`https://credit-backend-production.up.railway.app/credits/${u.uid}`);
        setCredits(res.data.credits);
      }
    });
  }, []);

  const signIn = () => signInWithPopup(auth, provider);

  const handleGenerate = async () => {
    const res = await axios.post('https://credit-backend-production.up.railway.app/generate', {
      prompt: input,
      uid: user.uid,
    });
    setOutput(res.data.text);

    const updated = await axios.get(`https://credit-backend-production.up.railway.app/credits/${user.uid}`);
    setCredits(updated.data.credits);
  };

  const buyCredits = async () => {
    const res = await axios.post('https://credit-backend-production.up.railway.app/create-checkout-session', {
      uid: user.uid,
    });
    window.location.href = res.data.url;
  };

  return (
    <div className="page">
      <div className="header">
        {user && (
          <>
            <span className="credit-info">{credits} credits left</span>
            <button className="btn buy" onClick={buyCredits}>Buy Credits</button>
            <img className="avatar" src={user.photoURL} alt="Avatar" />
          </>
        )}
        {!user && (
          <button className="btn buy" onClick={signIn}>Sign in with Google</button>
        )}
      </div>
      
      <div className="main-content">
        <div className="card">
          <p className="output-text">{output}</p>
          <textarea
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something..."
            disabled={!user}
          />
          <button className="btn generate" onClick={handleGenerate} disabled={!user || credits <= 0}>
            Generate
          </button>
        </div>
      </div>
    </div>

  );


}

export default App;
