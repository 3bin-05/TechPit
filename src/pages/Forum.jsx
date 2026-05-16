import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Plus, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Share2, 
  Bookmark,
  ExternalLink,
  Award,
  Loader2
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

export const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'forum'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!user) {
      alert("Authenticate first.");
      return;
    }
    const title = prompt("Enter post title:");
    if (!title) return;

    try {
      await addDoc(collection(db, 'forum'), {
        title,
        author: user.username || user.displayName || 'Anon_Operator',
        authorId: user.uid,
        preview: "New discussion started...",
        tags: ["general"],
        upvotes: 0,
        comments: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      alert("Failed to post. Check Firestore rules.");
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-4xl">The Forum</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-static" size={18} />
              <Input className="pl-10" placeholder="Search knowledge..." />
            </div>
            <Button onClick={handleCreatePost} className="flex items-center gap-2 px-4 py-2">
              <Plus size={20} /> <span className="hidden md:inline">New Post</span>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Categories */}
          <aside className="hidden lg:block space-y-6">
            <Card className="p-4">
              <h3 className="font-bebas text-2xl mb-4">Categories</h3>
              <div className="space-y-1">
                <CategoryItem label="All Posts" count={posts.length} active />
                <CategoryItem label="Security" count={0} />
                <CategoryItem label="AI & ML" count={0} />
                <CategoryItem label="Frontend" count={0} />
              </div>
            </Card>
          </aside>

          {/* Post Feed */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-4 border-b-2 border-void pb-2 mb-6 overflow-x-auto">
              <button className="font-bebas text-2xl border-b-4 border-glitch px-2">HOT</button>
              <button className="font-bebas text-2xl text-static px-2 hover:text-void">NEW</button>
              <button className="font-bebas text-2xl text-static px-2 hover:text-void">TOP</button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              posts.length > 0 ? posts.map(post => (
                <ForumPostCard 
                  key={post.id}
                  {...post}
                />
              )) : (
                <p className="font-mono text-xs text-static uppercase text-center py-12">No discussions yet. Start one!</p>
              )
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const CategoryItem = ({ label, count, active }) => (
  <button className={`w-full flex justify-between items-center p-2 font-mono text-xs uppercase transition-colors ${active ? 'bg-glitch font-bold' : 'hover:bg-static/10'}`}>
    <span>{label}</span>
    <span className="text-[10px] opacity-50">[{count}]</span>
  </button>
);

const ForumPostCard = ({ author, title, preview, tags, upvotes, comments, isVerified, hasDebate }) => (
  <Card className="flex gap-6 p-6">
    <div className="flex flex-col items-center gap-2 pt-1">
      <button className="p-1 border-2 border-void hover:bg-glitch transition-colors">
        <ArrowUp size={20} />
      </button>
      <span className="font-bebas text-2xl">{upvotes}</span>
      <button className="p-1 border-2 border-void hover:bg-signal hover:text-chalk transition-colors">
        <ArrowDown size={20} />
      </button>
    </div>

    <div className="flex-1 space-y-3 text-left">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-static border border-void" />
          <span className="font-mono text-xs font-bold">{author}</span>
        </div>
        <div className="flex gap-2">
          {isVerified && <Badge variant="pro" className="flex items-center gap-1"><Award size={10} /> Verified</Badge>}
          {hasDebate && <Badge variant="ai" className="flex items-center gap-1"><ExternalLink size={10} /> Linked Debate</Badge>}
        </div>
      </div>

      <h3 className="text-3xl leading-tight hover:text-terminal cursor-pointer transition-colors">{title}</h3>
      <p className="font-mono text-sm text-ink/70 line-clamp-2">{preview}</p>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex gap-2">
          {tags?.map(t => <Badge key={t} className="bg-static/10">#{t}</Badge>)}
        </div>
        
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 font-mono text-xs uppercase hover:text-terminal transition-colors">
            <MessageSquare size={16} /> {comments} Comments
          </button>
          <button className="hover:text-glitch transition-colors">
            <Bookmark size={18} />
          </button>
          <button className="hover:text-terminal transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  </Card>
);
