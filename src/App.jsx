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
    <div className="container">
      {!user ? (
        <button onClick={signIn}>Sign in with Google</button>
      ) : (
        <>
          <p>Credits: {credits}</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter your prompt here..." />
          <button onClick={handleGenerate} disabled={credits <= 0}>Generate</button>
          <button onClick={buyCredits}>Buy Credits</button>
          <div className="response-box">{output}</div>
        </>
      )}
    </div>

  );
}

export default App;
