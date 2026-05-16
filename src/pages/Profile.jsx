import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { uploadImage } from '../lib/cloudinary';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Award, 
  Sword, 
  Target, 
  Trophy, 
  Calendar,
  Zap,
  Camera,
  Loader2
} from 'lucide-react';

export const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      await updateDoc(doc(db, 'users', user.uid), {
        avatarUrl: url
      });
      // User state will update via useAuth hook
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to upload image. Check console.");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-glitch" size={48} />
          <span className="ml-4 font-bebas text-2xl">AWAITING_IDENTITY...</span>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <Card className="p-12 text-center">
          <h2 className="text-4xl mb-4">NOT_LOGGED_IN</h2>
          <p className="font-mono text-static mb-8 uppercase">You must be authenticated to view your terminal profile.</p>
          <Button onClick={() => window.location.href = '/auth'}>Authenticate Now</Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Profile Hero */}
        <div className="relative pt-12">
          <Card className="bg-chalk relative z-10 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-void bg-glitch shadow-brutalist overflow-hidden relative">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bebas">
                    {user.username?.substring(0, 2).toUpperCase() || '??'}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-void/50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-chalk" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-chalk border-2 border-void p-2 rounded-full cursor-pointer hover:bg-glitch transition-colors">
                <Camera size={20} className="text-void" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
                <h2 className="text-6xl leading-none uppercase">{user.username || user.displayName || 'Anon_Operator'}</h2>
                <Badge variant="warning" className="w-fit mx-auto md:mx-0 text-sm py-1">
                  {user.level > 10 ? 'Kernel Sage' : 'Circuit Apprentice'}
                </Badge>
              </div>
              <p className="font-mono text-sm text-ink/70 max-w-xl">
                {user.bio || "No bio decrypted. Update your profile in settings to reveal your tech stack."}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-static font-mono text-xs uppercase">
                <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(user.createdAt?.seconds * 1000).toLocaleDateString() || 'Recently'}</span>
                <span>•</span>
                <span>{user.followers?.length || 0} Followers</span>
              </div>
              <div className="flex gap-4 pt-2">
                <Button className="flex-1 md:flex-none">Follow</Button>
                <Button variant="secondary" className="flex-1 md:flex-none">Message</Button>
              </div>
            </div>
          </Card>
          {/* Decorative background card */}
          <div className="absolute top-16 left-4 w-full h-full bg-void -z-10 opacity-5" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={<Sword size={24} />} label="Debates" value={user.debatesEntered || 0} />
          <StatCard icon={<Trophy size={24} className="text-glitch" />} label="Wins" value={user.debatesWon || 0} />
          <StatCard icon={<Target size={24} className="text-signal" />} label="Win Rate" value={`${user.winRate || 0}%`} />
          <StatCard icon={<Award size={24} className="text-terminal" />} label="XP Points" value={user.xp?.toLocaleString() || 0} />
        </div>

        {/* XP Progress Bar */}
        <Card className="p-6">
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
              <span className="font-mono text-xs uppercase text-static">Level {user.level || 1}</span>
              <span className="font-bebas text-3xl">Progress to Next Milestone</span>
            </div>
            <span className="font-mono text-xs font-bold">{user.xp % 1000} / 1000 XP</span>
          </div>
          <div className="w-full h-8 brutalist-border bg-static/20 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-glitch transition-all duration-1000" style={{ width: `${(user.xp % 1000) / 10}%` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center gap-4 mb-6 border-b-2 border-void pb-2">
                <h3 className="text-3xl">Recent Debates</h3>
                <span className="font-mono text-xs text-static">[{user.debatesEntered || 0}]</span>
              </div>
              <div className="space-y-4">
                {user.debatesEntered > 0 ? (
                  <p className="font-mono text-sm text-static italic">Debate history decryption in progress...</p>
                ) : (
                  <div className="p-8 border-2 border-dashed border-static/30 text-center">
                    <p className="font-mono text-sm text-static uppercase">No debates recorded. Enter the Pit to build history.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section>
              <h3 className="text-3xl mb-6 border-b-2 border-void pb-2">Badge Shelf</h3>
              <div className="grid grid-cols-3 gap-4">
                {user.badges?.map((badge, i) => (
                  <BadgeItem key={i} icon={<Zap size={20} />} name={badge} color="bg-glitch" />
                )) || <p className="col-span-3 text-center font-mono text-[10px] text-static uppercase">No badges earned</p>}
              </div>
            </section>

            <section>
              <h3 className="text-3xl mb-6 border-b-2 border-void pb-2">Top Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="os">#rust</Badge>
                <Badge variant="pro">#distributed</Badge>
                <Badge variant="con">#java</Badge>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value }) => (
  <Card className="flex flex-col items-center justify-center p-6 text-center group hover:bg-void hover:text-chalk transition-all">
    <div className="mb-2 transition-transform group-hover:scale-110">{icon}</div>
    <span className="font-bebas text-4xl leading-none">{value}</span>
    <span className="font-mono text-[10px] uppercase text-static group-hover:text-chalk/60">{label}</span>
  </Card>
);

const BadgeItem = ({ icon, name, color }) => (
  <div className="flex flex-col items-center gap-2 group cursor-help">
    <div className={`w-12 h-12 flex items-center justify-center border-2 border-void ${color} shadow-brutalist transition-transform group-hover:-translate-y-1`}>
      {icon}
    </div>
    <span className="font-mono text-[8px] uppercase font-bold text-center">{name}</span>
  </div>
);
