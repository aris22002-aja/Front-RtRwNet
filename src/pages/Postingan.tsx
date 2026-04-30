import React, { useEffect, useState } from 'react';
import { getPosts } from '../api';
import { MessageSquare, Search, Filter, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface Post {
  id?: number;
  title: string;
  content: string;
  author?: string;
  role?: string;
  date?: string;
  image?: string;
  likes?: number;
  comments?: number;
}

const Postingan = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((data: Post[]) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter((post) => {
    const keyword = search.toLowerCase();
    return (
      post.title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword) ||
      post.author?.toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <MessageSquare size={32} />
        <p>Memuat postingan...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Postingan</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Kabar dan cerita terbaru warga Graha Harmony 5
          </p>
        </div>
        <button className="btn">
          <Filter size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Filter
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            top: '50%',
            left: '12px',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Cari postingan..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem 0.6rem 2.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text)',
          }}
        />
      </div>

      {filteredPosts.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredPosts.map((post, index) => (
            <article key={post.id ?? index} className="card">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  style={{
                    width: '100%',
                    maxHeight: '260px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                  }}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{post.title}</h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {post.author || 'Anonim'} · {post.role || 'Warga'} · {post.date || '-'}
                  </p>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{post.content}</p>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ThumbsUp size={16} /> {post.likes || 0}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MessageCircle size={16} /> {post.comments || 0}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Share2 size={16} /> Bagikan
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Belum ada postingan yang cocok.</p>
        </div>
      )}
    </div>
  );
};

export default Postingan;
