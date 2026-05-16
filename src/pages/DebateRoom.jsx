import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Clock, 
  Send, 
  Code as CodeIcon, 
  Flag, 
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, onValue, push, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { db, rtdb } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { messageSchema } from '../utils/validation';

export const DebateRoom = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showParticipants, setShowParticipants] = useState(true);
  const [isVerdictPhase, setIsVerdictPhase] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Load Room Data
  useEffect(() => {
    const fetchRoom = async () => {
      const docSnap = await getDoc(doc(db, 'rooms', id));
      if (docSnap.exists()) {
        setRoom(docSnap.data());
      } else {
        alert("Room not found.");
        navigate('/feed');
      }
      setLoading(false);
    };
    fetchRoom();
  }, [id, navigate]);

  // Load Messages from RTDB
  useEffect(() => {
    const messagesRef = ref(rtdb, `rooms/${id}/messages`);
    const unsubscribe = onValue(messagesRef, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const msgList = Object.entries(data).map(([key, val]) => ({
            id: key,
            ...val
          })).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgList);
        }
      },
      (error) => {
        console.error("RTDB subscription failed:", error);
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    try {
      // Validate with Zod
      messageSchema.parse({ text: inputText });
      
      if (!user) return;
      
      const messagesRef = ref(rtdb, `rooms/${id}/messages`);
      const newMessage = {
        uid: user.uid,
        codename: user.username || user.displayName || 'Anon_Operator',
        position: room?.position || 'PRO',
        text: inputText.trim(),
        timestamp: rtdbTimestamp(),
      };

      await push(messagesRef, newMessage);
      setInputText('');
    } catch (error) {
      if (error.name === 'ZodError') {
        console.warn("Validation failed:", error.errors[0].message);
      } else {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleEndDebate = async () => {
    try {
      await updateDoc(doc(db, 'rooms', id), {
        status: 'verdict'
      });
      setIsVerdictPhase(true);
    } catch (error) {
      console.error("Failed to end debate:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-void text-glitch font-bebas text-4xl">
        <Loader2 className="animate-spin mr-4" /> INITIALIZING_PIT...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-ghost overflow-hidden">
      {/* Top Topic Bar */}
      <header className="bg-void text-chalk p-4 border-b-4 border-void flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <button className="lg:hidden" onClick={() => navigate('/feed')}>
            <ChevronLeft />
          </button>
          <div className="flex flex-col">
            <Badge variant="os" className="w-fit mb-1 bg-white/10 text-glitch border-glitch">{room.category}</Badge>
            <h1 className="text-xl md:text-3xl font-bebas tracking-wide leading-none truncate max-w-md md:max-w-xl">
              {room.topic}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 text-glitch font-mono font-bold text-xl">
              <Clock size={20} /> {room.timeLimit}:00
            </div>
            <span className="text-[10px] uppercase text-static">Time Remaining</span>
          </div>
          {user?.uid === room.createdBy && room.status !== 'verdict' && (
            <Button 
              className="hidden md:block bg-signal hover:bg-signal/80 px-4 py-1 text-sm"
              onClick={handleEndDebate}
            >
              End Debate
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Participants Panel */}
        <AnimatePresence>
          {showParticipants && (
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute lg:relative z-10 w-64 h-full bg-chalk border-r-4 border-void flex flex-col"
            >
              <div className="p-4 border-b-2 border-void flex justify-between items-center">
                <h3 className="font-bebas text-2xl">Voices ({room.participantCount || 1})</h3>
                <button onClick={() => setShowParticipants(false)} className="lg:hidden">
                  <ChevronLeft />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <ParticipantItem name={room.creatorName} position={room.position} isYou={user?.uid === room.createdBy} />
                {/* Other participants would go here */}
              </div>
              <div className="p-4 border-t-2 border-void bg-static/10">
                <div className="flex justify-between text-[10px] font-mono uppercase mb-1">
                  <span>Pro (50%)</span>
                  <span>Con (50%)</span>
                </div>
                <div className="w-full h-3 brutalist-border bg-static flex overflow-hidden">
                  <div className="bg-byte h-full w-[50%]" />
                  <div className="bg-signal h-full w-[50%]" />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Message Feed */}
        <div className="flex-1 flex flex-col bg-ghost relative">
          {!showParticipants && (
            <button 
              onClick={() => setShowParticipants(true)}
              className="absolute top-4 left-0 bg-void text-chalk p-2 brutalist-shadow z-10 lg:hidden"
            >
              <ChevronRight size={16} />
            </button>
          )}

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} {...msg} isOwn={msg.uid === user?.uid} />
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-chalk border-t-4 border-void">
            <div className="max-w-4xl mx-auto flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea 
                  className="brutalist-input w-full min-h-[50px] max-h-[150px] py-3 pr-12 resize-none"
                  placeholder="Type your argument..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button className="absolute right-3 bottom-3 text-static hover:text-void transition-colors">
                  <CodeIcon size={20} />
                </button>
              </div>
              <Button 
                onClick={handleSend}
                className="h-[52px] aspect-square flex items-center justify-center p-0"
              >
                <Send size={24} />
              </Button>
            </div>
          </div>
        </div>

        {/* Verdict Phase Overlay */}
        <AnimatePresence>
          {(isVerdictPhase || room.status === 'verdict') && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-0 z-30 bg-chalk flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="max-w-lg w-full">
                <h2 className="text-6xl mb-4">VERDICT PHASE</h2>
                <p className="font-mono text-lg mb-8">Debate closed. Who made the strongest case? Cast your vote below.</p>
                
                <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto p-4 brutalist-border">
                  <VoteItem name={room.creatorName} />
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 py-4 text-xl" onClick={() => setIsVerdictPhase(false)}>
                    Submit Vote
                  </Button>
                </div>
                <p className="mt-4 font-mono text-xs text-static uppercase animate-pulse">
                  Results processing...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ParticipantItem = ({ name, position, isYou }) => (
  <div className={`flex items-center gap-3 p-2 border-2 ${isYou ? 'border-glitch bg-glitch/10' : 'border-transparent'}`}>
    <div className={`w-3 h-3 rounded-full ${position === 'PRO' ? 'bg-byte' : position === 'CON' ? 'bg-signal' : 'bg-terminal'}`} />
    <span className={`font-mono text-xs truncate ${isYou ? 'font-bold' : ''}`}>
      {name} {isYou && '(YOU)'}
    </span>
  </div>
);

const MessageBubble = React.memo(({ codename, position, text, timestamp, isOwn }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
  >
    <div className="flex items-center gap-2 mb-1 px-2">
      <span className={`font-mono text-[10px] font-bold ${position === 'PRO' ? 'text-byte' : position === 'CON' ? 'text-signal' : 'text-terminal'}`}>
        [{position}]
      </span>
      <span className="font-mono text-[10px] font-bold uppercase">{codename}</span>
      <span className="font-mono text-[8px] text-static">
        {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
      </span>
    </div>
    <div className={`max-w-[85%] md:max-w-[70%] p-4 border-2 border-void shadow-brutalist relative ${isOwn ? 'bg-glitch text-void' : 'bg-chalk text-void'}`}>
      <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      <button className="absolute -bottom-3 -right-3 bg-chalk border-2 border-void p-1 hover:bg-signal hover:text-chalk transition-colors">
        <Flag size={12} />
      </button>
    </div>
  </motion.div>
));

MessageBubble.displayName = 'MessageBubble';

const VoteItem = ({ name }) => (
  <button className="w-full flex justify-between items-center p-4 border-2 border-void hover:bg-glitch transition-all group">
    <span className="font-mono font-bold uppercase">{name}</span>
    <div className="w-6 h-6 border-2 border-void bg-white group-hover:bg-void transition-colors" />
  </button>
);
