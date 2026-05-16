import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronRight, Github, Globe, Loader2 } from 'lucide-react';
import { authSchema } from '../utils/validation';
import { useRateLimit } from '../hooks/useRateLimit';

export const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { checkLimit, rateLimitError } = useRateLimit('auth', 5, 900000); // 5 attempts per 15 mins
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const navigate = useNavigate();

  const handleAuthError = (err) => {
    console.error(err);
    if (err.name === 'ZodError') {
      setError(err.errors[0].message);
      return;
    }
    switch (err.code) {
      case 'auth/user-not-found':
        setError('No operator found with this email.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect Access Key.');
        break;
      case 'auth/email-already-in-use':
        setError('Email already registered in the Pit.');
        break;
      case 'auth/weak-password':
        setError('Access Key is too weak. Minimum 6 characters.');
        break;
      case 'auth/popup-closed-by-user':
        setError('Login cancelled. Popup closed.');
        break;
      case 'auth/operation-not-allowed':
        setError('This login method is not enabled in Firebase Console.');
        break;
      case 'permission-denied':
        setError('Firestore Access Denied. Please update your Security Rules.');
        break;
      default:
        setError(err.message || 'Authentication failed. Check your terminal.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!checkLimit()) {
      setError(rateLimitError);
      return;
    }

    setLoading(true);

    try {
      // Validate with Zod
      authSchema.parse({ email, password, ...(mode === 'signup' && { username }) });

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/feed');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
          await updateProfile(user, { displayName: username });
        } catch (profileErr) {
          console.error("Profile update failed:", profileErr);
        }

        try {
          await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            xp: 0,
            level: 1,
            debatesEntered: 0,
            debatesWon: 0,
            winRate: 0,
            createdAt: serverTimestamp(),
            isPublic: true,
            avatarUrl: null
          });
        } catch (firestoreErr) {
          console.error("Firestore initialization failed:", firestoreErr);
          setError("Profile created, but database initialization failed. Check Firestore rules.");
        }

        navigate('/feed');
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (providerName) => {
    setLoading(true);
    setError('');
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        username: user.displayName || 'Anon_Operator',
        email: user.email,
        xp: 0,
        level: 1,
        debatesEntered: 0,
        debatesWon: 0,
        winRate: 0,
        createdAt: serverTimestamp(),
        isPublic: true,
        avatarUrl: user.photoURL || null
      }, { merge: true });

      navigate('/feed');
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-ghost overflow-hidden selection:bg-glitch selection:text-void">
      {/* Left Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-void text-chalk p-12 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <motion.h1 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-9xl font-bebas leading-none tracking-tighter mb-6"
          >
            JOIN THE <span className="text-glitch">PIT.</span>
          </motion.h1>
          <p className="font-mono text-xl text-static max-w-md uppercase tracking-widest">
            Identity is a vulnerability. 
            Code is the only truth.
          </p>
          
          <div className="mt-12 space-y-4">
            <FeatureItem text="Anonymous real-time debates" />
            <FeatureItem text="AI-powered argument grading" />
            <FeatureItem text="Build your tech reputation" />
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none font-mono text-[10px] overflow-hidden whitespace-pre select-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i}>01010111 01101000 01100101 01110010 01100101 01001110 01100101 01110100 01101001 01111010 01100101 01101110 01110011 01000011 01101100 01100001 01110011 01101000</div>
          ))}
        </div>
      </div>

      {/* Right Form Side */}
      <div className="lg:w-1/2 p-6 md:py-8 md:px-24 flex flex-col justify-center bg-chalk overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex gap-4 border-b-4 border-void pb-2">
              <button 
                onClick={() => setMode('login')}
                className={`text-4xl font-bebas transition-all ${mode === 'login' ? 'text-void underline decoration-glitch decoration-8 underline-offset-4' : 'text-static hover:text-void'}`}
              >
                Sign In_
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`text-4xl font-bebas transition-all ${mode === 'signup' ? 'text-void underline decoration-glitch decoration-8 underline-offset-4' : 'text-static hover:text-void'}`}
              >
                Sign Up_
              </button>
            </div>
            <p className="font-mono text-xs text-static uppercase">
              {mode === 'login' ? 'Welcome back, Operator.' : 'Initialize your kernel identity.'}
            </p>
          </div>

          {error && (
            <div className="bg-signal/10 border-2 border-signal p-4 text-signal font-mono text-xs uppercase">
              [ERROR] {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="font-bebas text-2xl">Username</label>
                <Input 
                  placeholder="NEON_WALRUS" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="font-bebas text-2xl">Email_Address</label>
              <Input 
                type="email" 
                placeholder="root@techpit.io" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="font-bebas text-2xl">Access_Key</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <Button disabled={loading} className="w-full text-2xl py-4 flex items-center justify-center gap-4">
              {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Execute Login' : 'Initialize Profile')} 
              {!loading && <ChevronRight />}
            </Button>
          </form>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-void/20" />
              <span className="font-mono text-[10px] uppercase text-static">OAuth Access</span>
              <div className="flex-1 h-px bg-void/20" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleOAuthLogin('github')} variant="secondary" className="flex items-center justify-center gap-2 py-3 text-sm">
                <Github size={18} /> GitHub
              </Button>
              <Button onClick={() => handleOAuthLogin('google')} variant="secondary" className="flex items-center justify-center gap-2 py-3 text-sm">
                <Globe size={18} /> Google
              </Button>
            </div>
          </div>
          
          <p className="text-center font-mono text-[10px] text-static">
            By connecting, you agree to the <span className="underline cursor-pointer hover:text-void transition-colors">TermsofService.sh</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-4">
    <div className="w-6 h-6 border-2 border-glitch bg-glitch/20 flex items-center justify-center">
      <div className="w-2 h-2 bg-glitch" />
    </div>
    <span className="font-mono text-sm uppercase tracking-wide">{text}</span>
  </div>
);
