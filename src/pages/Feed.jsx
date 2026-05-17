import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Users, Clock, ChevronRight, Loader2, Plus, Sliders } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { rankRoomsMMR, getDefaultInterestVector, GENRES, updateInterestVector } from '../utils/pitScore';

const CATEGORIES = ["All", ...GENRES];

export const Feed = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userProfile, setUserProfile] = useState(null);
  const [recommendationMode, setRecommendationMode] = useState('pit'); // 'pit' or 'explore'

  // Listen for user profile updates to fetch the interest vector in real-time
  useEffect(() => {
    if (!user?.uid) {
      setUserProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    });
    return () => unsub();
  }, [user]);

  // Load Rooms from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'rooms'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const roomsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRooms(roomsData);
        setLoading(false);
      },
      (error) => {
        console.error("Feed subscription failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Manual Vector Tuning Handler
  const handleTuneVector = async (genreIdx, delta) => {
    if (!user?.uid) return;
    try {
      const currentVector = userProfile?.interestVector || getDefaultInterestVector();
      const nextVector = [...currentVector];
      // Adjust and L2 normalize
      nextVector[genreIdx] = Math.max(0, nextVector[genreIdx] + delta);
      
      let sumSq = 0;
      for (let i = 0; i < 15; i++) {
        sumSq += nextVector[i] * nextVector[i];
      }
      const magnitude = Math.sqrt(sumSq) || 1;
      for (let i = 0; i < 15; i++) {
        nextVector[i] /= magnitude;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        interestVector: nextVector
      });
    } catch (err) {
      console.error("Failed to tune vector manually:", err);
    }
  };

  // Personalized Rank Rooms using MMR diversity
  const rankedRooms = useMemo(() => {
    let result = rooms.filter(r => r.createdBy && r.topic); // Only keep user-created valid rooms
    
    if (filter !== 'All') {
      result = result.filter(r => r.category === filter);
    }
    
    if (searchQuery.trim() !== '') {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.topic.toLowerCase().includes(lowerQ) || 
        (r.category && r.category.toLowerCase().includes(lowerQ))
      );
    }

    const interestVector = userProfile?.interestVector || getDefaultInterestVector();
    const following = userProfile?.following || [];

    // Personalize and diversify Feed using PitScore and MMR
    return rankRoomsMMR(result, interestVector, following, recommendationMode);
  }, [rooms, filter, searchQuery, userProfile, recommendationMode]);

  const liveRooms = useMemo(() => rankedRooms.filter(r => r.status === 'live'), [rankedRooms]);
  const lobbyRooms = useMemo(() => rankedRooms.filter(r => r.status === 'lobby'), [rankedRooms]);
  const closedRooms = useMemo(() => rankedRooms.filter(r => r.status === 'verdict' || r.status === 'closed'), [rankedRooms]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-4xl">The Pit</h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-static" size={18} />
              <Input 
                className="pl-10" 
                placeholder="Search topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to="/create">
              <Button className="w-full md:w-auto flex items-center gap-2">
                <Plus size={18} /> Create Debate
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`px-4 py-1 border-2 border-void font-mono text-xs uppercase tracking-wider hover:bg-glitch transition-colors ${filter === cat ? 'bg-void text-chalk' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-glitch" size={48} />
          </div>
        ) : (
          <>
            {/* Live Now */}
            {liveRooms.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-3xl">Live Right Now</h3>
                  <div className="h-2 w-2 rounded-full bg-signal animate-ping" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveRooms.map(room => (
                    <DebateCard 
                      key={room.id}
                      id={room.id}
                      topic={room.topic}
                      category={room.category}
                      voices={room.participantCount || 0}
                      proVotes={room.proVotes}
                      conVotes={room.conVotes}
                      timeLeft={`${room.timeLimit}:00`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent & Starting Soon */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h3 className="text-3xl mb-6">Starting Soon / Lobbies</h3>
                  <div className="space-y-4">
                    {lobbyRooms.length > 0 ? lobbyRooms.map(room => (
                      <MiniRoomCard 
                        key={room.id}
                        id={room.id}
                        topic={room.topic} 
                        category={room.category} 
                        startTime="Open" 
                      />
                    )) : (
                      <div className="p-8 border-2 border-dashed border-static/40 bg-static/5 flex flex-col items-center justify-center text-center gap-4">
                        <p className="font-mono text-xs text-static uppercase">No active lobbies detected in this sector.</p>
                        <Link to="/create">
                          <Button variant="secondary" className="px-6 py-2">Create One Now_</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-3xl mb-6">Recently Closed</h3>
                  <div className="space-y-4">
                    {closedRooms.length > 0 ? closedRooms.map(room => (
                      <ClosedRoomCard 
                        key={room.id}
                        topic={room.topic} 
                        winner={room.winner || "Draw"}
                        category={room.category}
                      />
                    )) : (
                      <p className="font-mono text-xs text-static uppercase">No closed debates yet.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-8">
                <NeuralInterestProfile 
                  userProfile={userProfile} 
                  mode={recommendationMode} 
                  setMode={setRecommendationMode} 
                  onTuneVector={handleTuneVector}
                  userId={user?.uid}
                />

                <Card className="bg-glitch">
                  <h4 className="text-2xl mb-4 border-b-2 border-void pb-2">Top Bits</h4>
                  <div className="space-y-4">
                    <LeaderboardItem rank={1} name="EBIN_REJI" xp="12,450" />
                    <LeaderboardItem rank={2} name="NEON_WALRUS" xp="9,820" />
                    <LeaderboardItem rank={3} name="GHOST_BYTE" xp="8,540" />
                  </div>
                  <Link to="/leaderboard">
                    <Button variant="secondary" className="w-full mt-6 py-1 text-sm">Full Board</Button>
                  </Link>
                </Card>

                <Card>
                  <h4 className="text-2xl mb-4 border-b-2 border-void pb-2">Trending Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="os">#rust</Badge>
                    <Badge variant="ai">#llm</Badge>
                    <Badge variant="pro">#nextjs</Badge>
                    <Badge variant="con">#bun</Badge>
                    <Badge variant="ai">#cuda</Badge>
                  </div>
                </Card>
              </aside>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

const DebateCard = ({ id, topic, category, voices, proVotes = 10, conVotes = 10, timeLeft }) => {
  const total = (proVotes || 0) + (conVotes || 0);
  const proRatio = total > 0 ? Math.round((proVotes / total) * 100) : 50;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <Badge variant="os">{category}</Badge>
        <div className="flex items-center gap-1 text-static font-mono text-xs">
          <Clock size={14} /> {timeLeft}
        </div>
      </div>
      <h4 className="text-2xl leading-tight">{topic}</h4>
      <div className="flex items-center gap-4 mt-auto">
        <div className="flex items-center gap-1 font-mono text-sm">
          <Users size={16} /> {voices} voices
        </div>
        <div className="flex-1 bg-static h-3 brutalist-border overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-byte" style={{ width: `${proRatio}%`, transition: 'width 0.5s ease-out' }} />
          <div className="absolute inset-y-0 right-0 bg-signal" style={{ width: `${100 - proRatio}%`, transition: 'width 0.5s ease-out' }} />
        </div>
      </div>
      <Link to={`/room/${id}`} className="mt-2">
        <Button className="w-full">Enter Room</Button>
      </Link>
    </Card>
  );
};

const MiniRoomCard = ({ id, topic, category, startTime }) => (
  <Link to={`/room/${id}`} className="flex items-center justify-between p-4 border-2 border-void bg-chalk brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
    <div className="flex flex-col">
      <div className="flex gap-2 items-center mb-1">
        <Badge variant="ai" className="px-1 py-0">{category}</Badge>
        <span className="font-mono text-[10px] text-signal uppercase font-bold">{startTime}</span>
      </div>
      <h5 className="font-bebas text-xl">{topic}</h5>
    </div>
    <ChevronRight size={20} />
  </Link>
);

const ClosedRoomCard = ({ topic, winner, category }) => (
  <div className="flex flex-col p-4 border-2 border-void bg-static/10">
    <div className="flex justify-between mb-2">
      <Badge className="bg-static/20">{category}</Badge>
      <span className="font-mono text-[10px] uppercase">Closed</span>
    </div>
    <h5 className="font-bebas text-xl mb-1">{topic}</h5>
    <p className="font-mono text-xs text-ink/60 italic">Winner: {winner}</p>
  </div>
);

const LeaderboardItem = ({ rank, name, xp }) => (
  <div className="flex items-center gap-3">
    <span className="font-bebas text-2xl w-6">#{rank}</span>
    <div className="flex-1">
      <p className="font-mono text-xs font-bold truncate">{name}</p>
      <p className="font-mono text-[10px] uppercase">{xp} XP</p>
    </div>
  </div>
);

const NeuralInterestProfile = ({ userProfile, mode, setMode, onTuneVector, userId }) => {
  const interestVector = userProfile?.interestVector || getDefaultInterestVector();

  return (
    <Card className="border-4 border-void bg-chalk p-6 brutalist-shadow relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-glitch/10 -rotate-45 pointer-events-none" />
      
      <div className="flex items-center justify-between border-b-2 border-void pb-3 mb-4">
        <div>
          <h4 className="font-bebas text-3xl tracking-wider text-void">NEURAL PROFILE</h4>
          <p className="font-mono text-[9px] text-static uppercase tracking-widest">[STATION_PERSONALIZATION_ACTIVE]</p>
        </div>
        <div className="h-3 w-3 rounded-full bg-byte animate-pulse" />
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setMode('pit')}
          className={`py-2 border-2 border-void font-bebas text-xs tracking-wider transition-all hover:-translate-y-0.5 ${
            mode === 'pit' 
              ? 'bg-byte text-chalk shadow-brutalist font-bold' 
              : 'bg-chalk text-void hover:bg-byte/5'
          }`}
        >
          PIT MODE [85%]
        </button>
        <button
          onClick={() => setMode('explore')}
          className={`py-2 border-2 border-void font-bebas text-xs tracking-wider transition-all hover:-translate-y-0.5 ${
            mode === 'explore' 
              ? 'bg-signal text-chalk shadow-brutalist font-bold' 
              : 'bg-chalk text-void hover:bg-signal/5'
          }`}
        >
          EXPLORE [55%]
        </button>
      </div>

      {!userId ? (
        <div className="space-y-4">
          <div className="p-4 border-2 border-dashed border-void/30 bg-void/5 text-center space-y-3">
            <p className="font-mono text-xs text-static uppercase">
              VECTOR PERSONALIZATION OFFLINE
            </p>
            <p className="font-mono text-[10px] text-ink/75">
              Sign in to register interest drift, configure social multipliers, and access diversity-optimized re-ranking.
            </p>
            <Link to="/auth" className="block">
              <Button size="sm" className="w-full font-bebas py-2 tracking-wide">INITIALIZE PROFILE_</Button>
            </Link>
          </div>
          {/* Locked mock visualization */}
          <div className="opacity-35 pointer-events-none space-y-2">
            {GENRES.slice(0, 5).map((genre) => (
              <div key={genre} className="space-y-1">
                <div className="flex justify-between font-mono text-[9px] uppercase font-bold text-void">
                  <span>{genre}</span>
                  <span>{(100 / 15).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-void/10 brutalist-border" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-void text-chalk p-2 font-mono text-[9px] uppercase tracking-wide">
            <span>GENRE INTEREST MATRIX</span>
            <span className="text-glitch animate-pulse">ACTIVE</span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 brutalist-scrollbar">
            {GENRES.map((genre, idx) => {
              const val = interestVector[idx] || 0;
              const percent = (val * 100).toFixed(1);
              return (
                <div key={genre} className="space-y-1 group relative">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase truncate max-w-[155px] text-void font-bold">{genre}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-static bg-void/5 px-1 font-bold">{percent}%</span>
                      {/* Tune buttons */}
                      <div className="flex border border-void opacity-0 group-hover:opacity-100 transition-opacity bg-chalk">
                        <button
                          onClick={() => onTuneVector(idx, -0.05)}
                          className="px-1.5 bg-chalk hover:bg-signal/20 text-void border-r border-void font-mono text-[9px] font-bold transition-colors"
                          title="Decrease affinity"
                        >
                          -
                        </button>
                        <button
                          onClick={() => onTuneVector(idx, 0.05)}
                          className="px-1.5 bg-chalk hover:bg-byte/20 text-void font-mono text-[9px] font-bold transition-colors"
                          title="Increase affinity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-chalk brutalist-border overflow-hidden relative">
                    <div 
                      className="absolute inset-y-0 left-0 bg-byte transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[8px] text-static leading-tight uppercase text-center mt-2 border-t border-void/10 pt-2">
            Hover element to fine-tune affinity vector.
          </p>
        </div>
      )}
    </Card>
  );
};
