import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Clock, Users, Shield, Zap, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

export const CreateRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    category: 'Security',
    position: 'PRO',
    timeLimit: '30',
    roomType: 'FREEFLOW',
    maxParticipants: '20'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      alert("Topic is required.");
      return;
    }
    
    if (!user) {
      alert("You must be logged in to create a room.");
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        ...formData,
        createdBy: user.uid,
        creatorName: user.username || user.displayName || 'Anon_Operator',
        createdAt: serverTimestamp(),
        status: 'lobby',
        participants: [],
        participantCount: 0,
        messages: []
      });
      
      navigate(`/room/${docRef.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Check Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <section className="space-y-8">
          <div>
            <h2 className="text-5xl mb-2">Ignite the Pit</h2>
            <p className="font-mono text-static uppercase text-xs">Define the battlefield. Pick your stance.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-bebas text-2xl">Topic Title</label>
              <Input 
                name="topic"
                placeholder="e.g., Is TypeScript actually slower to develop than JS?" 
                value={formData.topic}
                onChange={handleChange}
                maxLength={120}
                disabled={loading}
              />
              <p className="text-right font-mono text-[10px] text-static">{formData.topic.length}/120</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bebas text-2xl">Category</label>
                <select 
                  name="category"
                  className="brutalist-input w-full bg-chalk appearance-none"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option>Security</option>
                  <option>Languages</option>
                  <option>AI</option>
                  <option>OS</option>
                  <option>Web</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-bebas text-2xl">Your Position</label>
                <div className="flex gap-2">
                  <PositionButton 
                    active={formData.position === 'PRO'} 
                    onClick={() => setFormData(p => ({ ...p, position: 'PRO' }))}
                    variant="pro"
                    disabled={loading}
                  >
                    PRO
                  </PositionButton>
                  <PositionButton 
                    active={formData.position === 'CON'} 
                    onClick={() => setFormData(p => ({ ...p, position: 'CON' }))}
                    variant="con"
                    disabled={loading}
                  >
                    CON
                  </PositionButton>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="font-bebas text-2xl">Time Limit</label>
                <select 
                  name="timeLimit"
                  className="brutalist-input w-full bg-chalk"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="15">15 MIN</option>
                  <option value="30">30 MIN</option>
                  <option value="60">60 MIN</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-bebas text-2xl">Capacity</label>
                <select 
                  name="maxParticipants"
                  className="brutalist-input w-full bg-chalk"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-bebas text-2xl">Type</label>
                <div className="flex gap-1 h-[42px]">
                  <button 
                    onClick={() => setFormData(p => ({ ...p, roomType: 'FREEFLOW' }))}
                    disabled={loading}
                    className={`flex-1 border-2 border-void flex items-center justify-center ${formData.roomType === 'FREEFLOW' ? 'bg-void text-chalk' : 'bg-chalk'}`}
                  >
                    <Zap size={18} />
                  </button>
                  <button 
                    onClick={() => setFormData(p => ({ ...p, roomType: 'ROUNDS' }))}
                    disabled={loading}
                    className={`flex-1 border-2 border-void flex items-center justify-center ${formData.roomType === 'ROUNDS' ? 'bg-void text-chalk' : 'bg-chalk'}`}
                  >
                    <Shield size={18} />
                  </button>
                </div>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full text-2xl py-4 mt-4 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : 'Generate Room_'}
            </Button>
          </div>
        </section>

        {/* Preview Section */}
        <section className="sticky top-8 space-y-4">
          <h3 className="font-bebas text-3xl">Live Preview</h3>
          <Card className="rotate-1 bg-white">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="os">{formData.category}</Badge>
              <div className="flex items-center gap-1 text-static font-mono text-xs">
                <Clock size={14} /> {formData.timeLimit}:00
              </div>
            </div>
            <h4 className="text-3xl leading-none mb-4 min-h-[60px]">
              {formData.topic || "Your Topic Title Here..."}
            </h4>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 font-mono text-sm">
                <Users size={16} /> 0/{formData.maxParticipants} voices
              </div>
              <div className="flex-1 bg-static h-3 brutalist-border overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-byte w-1/2" />
                <div className="absolute inset-y-0 right-0 bg-signal w-1/2" />
              </div>
            </div>
            <div className="border-t-2 border-void pt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-glitch border-2 border-void overflow-hidden">
                  {user?.avatarUrl && <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />}
                </div>
                <span className="font-mono text-xs font-bold">Created by you</span>
              </div>
              <Badge variant={formData.position.toLowerCase() === 'pro' ? 'pro' : 'con'}>
                {formData.position}
              </Badge>
            </div>
          </Card>
          
          <div className="bg-glitch/20 border-2 border-void p-4 font-mono text-xs space-y-2">
            <p className="font-bold uppercase flex items-center gap-2">
              <Shield size={14} /> Room Rules:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Profanity will be auto-blocked.</li>
              <li>Arguments must be technical.</li>
              <li>You will be assigned a random codename.</li>
            </ul>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

const PositionButton = ({ children, active, onClick, variant, disabled }) => {
  const styles = {
    pro: active ? "bg-byte text-chalk" : "bg-chalk text-byte hover:bg-byte/10",
    con: active ? "bg-signal text-chalk" : "bg-chalk text-signal hover:bg-signal/10",
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 border-2 border-void py-2 font-bebas text-2xl transition-all ${styles[variant]}`}
    >
      {children}
    </button>
  );
};
