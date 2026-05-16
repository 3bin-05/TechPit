import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { ArrowUp, ArrowDown, Minus, Crown } from 'lucide-react';

const MOCK_LEADERS = [
  { rank: 4, name: 'LogicPhantom', xp: '12,450', wins: 89, trend: 'up' },
  { rank: 5, name: 'BitBasher', xp: '11,200', wins: 76, trend: 'down' },
  { rank: 6, name: 'CodeNinja', xp: '10,800', wins: 72, trend: 'stable' },
  { rank: 7, name: 'DebugMaster', xp: '10,500', wins: 68, trend: 'up' },
  { rank: 8, name: 'Rustacean', xp: '9,900', wins: 65, trend: 'up' },
  { rank: 9, name: 'KernelPanick', xp: '9,200', wins: 58, trend: 'stable' },
  { rank: 10, name: 'VoidWalker', xp: '8,800', wins: 52, trend: 'down' },
];

export const Leaderboard = () => {
  const [period, setPeriod] = useState('Weekly');

  return (
    <MainLayout>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h2 className="text-6xl leading-none">The Hall of Bytes</h2>
            <p className="font-mono text-static uppercase text-xs">Where legends are compiled and bugs are feared.</p>
          </div>
          <div className="flex border-4 border-void bg-chalk p-1 w-full md:w-auto">
            {['Weekly', 'Monthly', 'All-Time'].map((p) => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 md:w-32 py-2 font-bebas text-xl transition-all ${period === p ? 'bg-void text-chalk' : 'hover:bg-static/10'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 pt-12">
          {/* Rank 2 */}
          <PodiumPlace 
            rank={2} 
            name="NEON_WALRUS" 
            xp="15,820" 
            height="h-64" 
            color="bg-static"
            avatarColor="bg-terminal"
          />
          {/* Rank 1 */}
          <PodiumPlace 
            rank={1} 
            name="EBIN_REJI" 
            xp="24,450" 
            height="h-80" 
            color="bg-glitch"
            avatarColor="bg-void text-chalk"
            hasCrown
          />
          {/* Rank 3 */}
          <PodiumPlace 
            rank={3} 
            name="GHOST_BYTE" 
            xp="14,210" 
            height="h-48" 
            color="bg-[#CD7F32]"
            avatarColor="bg-byte"
          />
        </div>

        {/* List */}
        <Card className="p-0 overflow-hidden">
          <table className="w-full border-collapse font-mono text-sm">
            <thead className="bg-void text-chalk text-left">
              <tr>
                <th className="p-4 font-bebas text-xl uppercase">Rank</th>
                <th className="p-4 font-bebas text-xl uppercase">Legend</th>
                <th className="p-4 font-bebas text-xl uppercase hidden md:table-cell">Wins</th>
                <th className="p-4 font-bebas text-xl uppercase">XP Points</th>
                <th className="p-4 font-bebas text-xl uppercase text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADERS.map((leader) => (
                <tr key={leader.name} className="border-b-2 border-void hover:bg-static/10 transition-colors">
                  <td className="p-4 font-bebas text-2xl">#{leader.rank}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-void bg-static/20" />
                      <span className="font-bold">{leader.name}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">{leader.wins}</td>
                  <td className="p-4 font-bold">{leader.xp}</td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      {leader.trend === 'up' && <ArrowUp size={18} className="text-byte" />}
                      {leader.trend === 'down' && <ArrowDown size={18} className="text-signal" />}
                      {leader.trend === 'stable' && <Minus size={18} className="text-static" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-glitch p-4 flex justify-between items-center border-t-4 border-void sticky bottom-0">
            <div className="flex items-center gap-4">
              <span className="font-bebas text-3xl">#42</span>
              <div className="flex flex-col">
                <span className="font-bold uppercase text-[10px]">Your Current Rank</span>
                <span className="font-bold">EBIN_REJI</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bebas text-3xl">12,450 XP</span>
              <span className="font-mono text-[10px] uppercase">+450 XP this week</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

const PodiumPlace = ({ rank, name, xp, height, color, avatarColor, hasCrown }) => (
  <div className="flex flex-col items-center flex-1 max-w-[280px]">
    {hasCrown && <Crown size={40} className="text-glitch fill-glitch mb-2 animate-bounce" />}
    <div className={`w-24 h-24 rounded-full border-4 border-void mb-4 flex items-center justify-center text-3xl font-bebas shadow-brutalist ${avatarColor}`}>
      {name[0]}{name[name.indexOf('_') + 1] || ''}
    </div>
    <div className={`w-full ${height} ${color} border-4 border-void border-b-0 flex flex-col items-center justify-center p-6 brutalist-shadow-none`}>
      <span className="font-bebas text-5xl mb-1">#{rank}</span>
      <span className="font-mono text-xs font-bold uppercase truncate w-full text-center">{name}</span>
      <span className="font-mono text-[10px] uppercase font-bold mt-2 opacity-60">{xp} XP</span>
    </div>
  </div>
);
