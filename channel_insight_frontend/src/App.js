import React, { useState } from 'react';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Fetch channel info from YouTube Data API using channel username or ID.
 * @param {string} query - Channel name or ID to search.
 * @param {string} apiKey - YouTube Data API key.
 * @returns {Promise<object>} - Channel data or error object.
 */
async function fetchChannelInfo(query, apiKey) {
  // Try search by forUsername first, then fallback to search by channel ID or name query
  const base = 'https://www.googleapis.com/youtube/v3/channels';
  let url = `${base}?part=snippet,statistics,brandingSettings&forUsername=${encodeURIComponent(query)}&key=${apiKey}`;
  let res = await fetch(url);
  let data = await res.json();
  if (!data.items || data.items.length === 0) {
    // Fallback to search endpoint to find channel ID
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${apiKey}`;
    let searchRes = await fetch(searchUrl);
    let searchData = await searchRes.json();
    if (searchData.items && searchData.items.length > 0) {
      const channelId = searchData.items[0].snippet.channelId;
      // Fetch channel by channelId
      url = `${base}?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`;
      res = await fetch(url);
      data = await res.json();
    }
  }
  if (data.items && data.items.length > 0) {
    return data.items[0];
  } else {
    throw new Error('Channel not found');
  }
}

function App() {
  const YOUTUBE_API_KEY = "AIzaSyByHWpHYeLN9akvKuRB4l1PbKvQt1pGkao";
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  /**
   * Handle form submission to search for channels.
   * @param {Event} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setChannel(null);
    setError('');
    setLoading(true);

    try {
      const data = await fetchChannelInfo(search, YOUTUBE_API_KEY);
      setChannel(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
            <button className="btn" style={{visibility: 'hidden'}}>Template Button</button>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <div className="hero">
            <h1 className="title">ChannelInsight 🎬</h1>
            <div className="description">
              Enter a YouTube channel username, ID, or name to fetch channel information.
            </div>
            <form style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="YouTube channel name, username, or ID"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '1rem',
                  width: '320px',
                  background: '#111',
                  color: 'var(--text-color)'
                }}
                required
                aria-label="YouTube Channel Search"
              />
              <button className="btn btn-large" type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Fetch Channel Info'}
              </button>
            </form>
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
            {channel && (
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid var(--base-light)',
                borderRadius: 8,
                padding: 24,
                maxWidth: 500,
                margin: '0 auto',
                color: 'var(--text-color)',
                boxShadow: '0 2px 12px rgba(0,255,255,0.09)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <img
                    src={channel.snippet.thumbnails.default.url}
                    alt="Channel thumbnail"
                    style={{ borderRadius: '50%', width: 64, height: 64, border: '2px solid var(--base-light)' }}
                  />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600 }}>{channel.snippet.title}</h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      @{channel.snippet.customUrl || channel.id}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Description: </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{channel.snippet.description || "No description."}</span>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <strong>Subscribers:</strong> {Number(channel.statistics.subscriberCount).toLocaleString()}
                  </div>
                  <div>
                    <strong>Videos:</strong> {Number(channel.statistics.videoCount).toLocaleString()}
                  </div>
                  <div>
                    <strong>Views:</strong> {Number(channel.statistics.viewCount).toLocaleString()}
                  </div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <a
                    href={`https://youtube.com/channel/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: 'var(--base-light)',
                      color: '#222',
                      border: 'none',
                      marginTop: 6
                    }}
                  >
                    Visit Channel
                  </a>
                </div>
              </div>
            )}
            {(!channel && !loading && !error) && (
              <div style={{ color: 'var(--text-secondary)', marginTop: 24, fontStyle: 'italic' }}>
                Try searching for e.g. "LinusTechTips" or "PBS Space Time"
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;