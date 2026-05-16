import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sword, Award, MessageSquare, ChevronRight } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0A0A0A 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="warning" className="mb-4">v1.0.0 Alpha — ByteRing</Badge>
              <h1 className="text-6xl md:text-8xl mb-6 leading-[0.9]">
                Where <span className="text-terminal">Netizens</span> Clash <br />
                Over <span className="text-signal">Tech</span>.
              </h1>
              <p className="text-lg md:text-xl font-mono text-ink/70 mb-8 max-w-xl mx-auto lg:mx-0">
                Join anonymous topic-based chat rooms, argue tech positions, get graded by peers & AI, and build a public reputation profile.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link to="/auth">
                  <Button className="text-xl px-8 py-4">
                    Pick a Side <ChevronRight className="inline-block ml-2" />
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="secondary" className="text-xl px-8 py-4">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-0 overflow-hidden shadow-brutalist-xl rotate-1">
                <div className="bg-void p-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-signal" />
                    <div className="w-3 h-3 rounded-full bg-glitch" />
                    <div className="w-3 h-3 rounded-full bg-byte" />
                  </div>
                  <div className="text-chalk font-mono text-xs uppercase tracking-widest">
                    debate_room: rust_vs_cpp
                  </div>
                </div>
                <div className="bg-chalk p-6 h-[400px] font-mono text-sm overflow-hidden relative">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="text-signal font-bold">[CON]</span>
                      <span className="text-void font-bold">NeonWalrus#7741:</span>
                      <p>Rust's borrow checker is basically a digital nanny. C++ gives you freedom.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-byte font-bold">[PRO]</span>
                      <span className="text-void font-bold">GhostByte#0032:</span>
                      <p>Freedom to segfault? No thanks. Memory safety isn't a luxury, it's a requirement in 2025.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-terminal font-bold">[NEUTRAL]</span>
                      <span className="text-void font-bold">LogicPhantom#1337:</span>
                      <p>Both have their place, but the DX in Rust is undeniably superior for modern tooling.</p>
                    </div>
                    <div className="border-t-2 border-static pt-4 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-static uppercase">Verdict Phase Starting...</span>
                        <span className="text-signal animate-pulse">00:45</span>
                      </div>
                      <div className="w-full bg-static h-4 border-2 border-void">
                        <div className="bg-byte h-full w-[65%]" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute bottom-4 right-4 animate-bounce">
                    <Badge variant="pro">+50 XP</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <div className="bg-void py-4 border-y-4 border-void overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-chalk font-bebas text-4xl mx-8 inline-flex items-center gap-4">
              <span className="w-3 h-3 bg-glitch rounded-full" />
              LIVE: REACT VS SVELTE 5 [32 VOICES]
              <span className="w-3 h-3 bg-signal rounded-full" />
              LIVE: KERNEL EXPLOITS IN RUST [12 VOICES]
              <span className="w-3 h-3 bg-byte rounded-full" />
              LIVE: THE DEATH OF LOCALHOST [88 VOICES]
            </span>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="py-24 px-4 bg-chalk border-b-4 border-void">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl text-center mb-16">The Pipeline</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <StepCard 
              icon={<MessageSquare size={32} />}
              step="01"
              title="Join a Debate"
              description="Pick a side (Pro/Con/Neutral) and get assigned a random codename. Your ego stays at the door."
            />
            <StepCard 
              icon={<Sword size={32} />}
              step="02"
              title="Clash & Grade"
              description="Make your case. Your arguments are graded by peers and AI for logic, clarity, and impact."
            />
            <StepCard 
              icon={<Award size={32} />}
              step="03"
              title="Earn Reputation"
              description="Wins flow back to your real profile. Build your rank from Rookie Bit to Void Architect."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-void text-chalk py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-bebas text-4xl tracking-widest">TECHPIT</div>
          <div className="flex gap-8 font-mono text-sm uppercase">
            <a href="#" className="hover:text-glitch">Twitter</a>
            <a href="#" className="hover:text-glitch">GitHub</a>
            <a href="#" className="hover:text-glitch">Discord</a>
            <a href="#" className="hover:text-glitch">Privacy</a>
          </div>
          <div className="text-static font-mono text-xs">
            © 2026 BYTE_RING_FOUNDATION. NO RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* Marquee Style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

const StepCard = ({ icon, step, title, description }) => (
  <Card className="relative pt-12">
    <div className="absolute -top-6 left-6 bg-glitch border-2 border-void p-4 brutalist-shadow">
      {icon}
    </div>
    <div className="text-static font-bebas text-6xl opacity-20 absolute top-4 right-6">
      {step}
    </div>
    <h3 className="text-3xl mb-4 mt-2">{title}</h3>
    <p className="font-mono text-ink/70">{description}</p>
  </Card>
);
