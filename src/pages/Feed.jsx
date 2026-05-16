import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Users, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CATEGORIES = ["All", "Security", "Languages", "AI", "OS", "Web", "Hardware"];

export const Feed = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const q = query(
      collection(db, 'rooms'),
      orderBy('createdAt', 'desc'),
      limit(20)
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

  const filteredRooms = useMemo(() => {
    if (filter === 'All') return rooms;
    return rooms.filter(r => r.category === filter);
  }, [rooms, filter]);

  const liveRooms = useMemo(() => filteredRooms.filter(r => r.status === 'live'), [filteredRooms]);
  const lobbyRooms = useMemo(() => filteredRooms.filter(r => r.status === 'lobby'), [filteredRooms]);
  const closedRooms = useMemo(() => filteredRooms.filter(r => r.status === 'closed'), [filteredRooms]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-4xl">The Pit</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-static" size={18} />
            <Input className="pl-10" placeholder="Search topics..." />
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
                      proRatio={50} // Mock ratio for now
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
                      <p className="font-mono text-xs text-static uppercase">No active lobbies. Create one!</p>
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

const DebateCard = ({ id, topic, category, voices, proRatio, timeLeft }) => (
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
        <div className="absolute inset-y-0 left-0 bg-byte" style={{ width: `${proRatio}%` }} />
        <div className="absolute inset-y-0 right-0 bg-signal" style={{ width: `${100 - proRatio}%` }} />
      </div>
    </div>
    <Link to={`/room/${id}`} className="mt-2">
      <Button className="w-full">Enter Room</Button>
    </Link>
  </Card>
);

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
