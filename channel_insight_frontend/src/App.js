import React, { useState, useRef } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * fetchChannelInfo attempts to retrieve channel data by:
 * 1. Trying with forUsername for direct username lookup.
 * 2. If not found, searching by name, and then refetching by channelId.
 * Caches results in the provided cacheRef (useRef).
 * @param {string} query
 * @param {string} apiKey
 * @param {object} cacheRef - React ref object for caching
 * @returns {Promise<object>} Channel data.
 */
async function fetchChannelInfo(query, apiKey, cacheRef) {
  // Check in-memory cache first (by user input)
  const trimmedQuery = query.trim().toLowerCase();
  if (cacheRef.current[trimmedQuery]) {
    return cacheRef.current[trimmedQuery];
  }

  const base = "https://www.googleapis.com/youtube/v3/channels";
  let url = `${base}?part=snippet,statistics,brandingSettings&forUsername=${encodeURIComponent(
    query
  )}&key=${apiKey}`;
  let res = await fetch(url);
  let data = await res.json();

  // Fallback: search by channel name/ID
  if (!data.items || data.items.length === 0) {
    // Search endpoint to get channelId
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(
      query
    )}&key=${apiKey}`;
    let searchRes = await fetch(searchUrl);
    let searchData = await searchRes.json();
    if (
      searchData.items &&
      searchData.items.length > 0 &&
      searchData.items[0].snippet
    ) {
      const channelId =
        searchData.items[0].snippet.channelId ||
        searchData.items[0].id.channelId;
      if (channelId) {
        url = `${base}?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`;
        res = await fetch(url);
        data = await res.json();
      }
    }
  }

  if (data.items && data.items.length > 0) {
    cacheRef.current[trimmedQuery] = data.items[0];
    return data.items[0];
  } else {
    throw new Error("Channel not found");
  }
}

// Style helpers for theme (could be replaced by CSS vars, but we inline for style override)
const themeVars = {
  "--primary": "#FF0000",
  "--secondary": "#FFFFFF",
  "--accent": "#0000FF",
  "--light-bg": "#f8f9fa",
  "--header-bg": "#fff",
  "--footer-bg": "#f5f5f5",
  "--shadow": "0 2px 18px rgba(0, 0, 0, 0.08)",
};

function App() {
  const YOUTUBE_API_KEY = "AIzaSyByHWpHYeLN9akvKuRB4l1PbKvQt1pGkao";
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef({});

  /**
   * PUBLIC_INTERFACE
   * handleSubmit processes user form input to fetch & display channel info.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setChannel(null);
    setLoading(true);
    try {
      const channelData = await fetchChannelInfo(
        search,
        YOUTUBE_API_KEY,
        cacheRef
      );
      setChannel(channelData);
    } catch (err) {
      setError(err.message || "Could not find channel");
    } finally {
      setLoading(false);
    }
  };

  // Extract accent color for image border, button, etc.
  const accentColor = themeVars["--accent"];
  const primaryColor = themeVars["--primary"];
  const secondaryColor = themeVars["--secondary"];

  return (
    <div
      className="app"
      style={{
        minHeight: "100vh",
        background: themeVars["--light-bg"],
        color: "#161616",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        className="navbar"
        style={{
          background: themeVars["--header-bg"],
          borderBottom: `1px solid #efefef`,
          boxShadow: themeVars["--shadow"],
          color: primaryColor,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: 980,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            height: 64,
            justifyContent: "space-between",
          }}
        >
          <div
            className="logo"
            style={{
              fontWeight: 700,
              fontSize: "1.6rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: primaryColor,
              letterSpacing: 0.5,
            }}
          >
            <span
              className="logo-symbol"
              style={{
                fontSize: 40,
                color: primaryColor,
                fontWeight: 800,
                marginTop: -6,
                marginRight: 4,
              }}
            >
              ▶
            </span>
            ChannelInsight
          </div>
        </div>
      </header>
      {/* Content */}
      <main style={{ flex: 1, background: themeVars["--light-bg"] }}>
        <div
          className="container"
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 20px",
            paddingTop: 56,
            paddingBottom: 40,
          }}
        >
          <section
            className="hero"
            style={{
              minHeight: "380px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 32,
            }}
          >
            <h1
              className="title"
              style={{
                marginBottom: 7,
                fontWeight: 700,
                fontSize: "2.6rem",
                letterSpacing: -0.5,
                color: "#222",
              }}
            >
              Get YouTube Channel Insights
            </h1>
            <div
              className="subtitle"
              style={{
                marginBottom: 19,
                color: accentColor,
                fontSize: "1.25rem",
                fontWeight: 500,
              }}
            >
              Instant lookup for any channel — subscribers, videos & info
            </div>
            <form
              style={{
                width: "100%",
                maxWidth: 440,
                display: "flex",
                gap: 12,
                marginBottom: 32,
              }}
              onSubmit={handleSubmit}
              autoComplete="off"
              role="search"
              aria-label="Channel search"
            >
              <input
                type="text"
                placeholder="Enter YouTube channel name, username, or ID"
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 6,
                  border: `1px solid #d2d2d8`,
                  fontSize: "1.09rem",
                  background: "#fff",
                  color: "#101010",
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  transition: "border 0.18s",
                }}
                spellCheck={false}
                aria-label="YouTube Channel Search"
                required
                disabled={loading}
              />
              <button
                className="btn btn-large"
                type="submit"
                disabled={loading}
                style={{
                  background: primaryColor,
                  color: "#fff",
                  padding: "12px 24px",
                  fontSize: "1.07rem",
                  fontWeight: 600,
                  letterSpacing: 0.05,
                  border: "none",
                  borderRadius: 6,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  opacity: loading ? 0.82 : 1,
                  boxShadow: "0 1px 8px rgba(255,0,0,0.08)",
                }}
                aria-busy={loading ? "true" : undefined}
              >
                {loading ? "Searching..." : "Fetch Channel Info"}
              </button>
            </form>
            {/* Error */}
            {error && (
              <div
                style={{
                  color: "#b20000",
                  fontSize: "1.1rem",
                  marginBottom: 18,
                  fontWeight: 500,
                  background: "#ffeaea",
                  padding: "7px 14px",
                  borderRadius: 6,
                  border: `1px solid #ffccd1`,
                  maxWidth: 360,
                }}
                role="alert"
              >
                {error}
              </div>
            )}
            {/* Channel card */}
            {channel && (
              <div
                className="channel-card"
                style={{
                  width: "100%",
                  maxWidth: 480,
                  background: "#fff",
                  border: `1.5px solid ${accentColor}`,
                  borderRadius: 12,
                  padding: 26,
                  boxShadow: "0 3px 18px rgba(0,0,255,0.06)",
                  margin: "0 auto",
                  color: "#0d0220",
                  transition: "box-shadow 0.2s",
                  marginTop: 6,
                }}
                aria-label="YouTube Channel Info"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    marginBottom: 11,
                  }}
                >
                  <img
                    src={
                      channel.snippet?.thumbnails?.high?.url ||
                      channel.snippet?.thumbnails?.default?.url
                    }
                    alt="Channel avatar"
                    style={{
                      borderRadius: "50%",
                      width: 66,
                      height: 66,
                      border: `2.5px solid ${accentColor}`,
                      background: "#fffc",
                    }}
                  />
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "1.45rem",
                        fontWeight: 700,
                        color: primaryColor,
                        letterSpacing: "-.5px",
                      }}
                    >
                      {channel.snippet.title}
                    </h2>
                    <div
                      style={{
                        color: "#3a4455",
                        fontSize: 15,
                        fontWeight: 400,
                        marginTop: 2,
                      }}
                    >
                      @{channel.snippet?.customUrl || channel.id}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    color: "#51525e",
                    marginBottom: 13,
                    fontSize: "1.01rem",
                  }}
                >
                  {channel.snippet.description
                    ? channel.snippet.description.length > 160
                      ? channel.snippet.description.substring(0, 157) + "..."
                      : channel.snippet.description
                    : "No description available."}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 22,
                    marginBottom: 13,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong style={{ color: accentColor }}>Subscribers:</strong>{" "}
                    {Number(channel.statistics.subscriberCount).toLocaleString()}
                  </div>
                  <div>
                    <strong style={{ color: accentColor }}>Videos:</strong>{" "}
                    {Number(channel.statistics.videoCount).toLocaleString()}
                  </div>
                  <div>
                    <strong style={{ color: accentColor }}>Views:</strong>{" "}
                    {Number(channel.statistics.viewCount).toLocaleString()}
                  </div>
                </div>
                <a
                  href={`https://youtube.com/channel/${channel.id}`}
                  className="btn"
                  style={{
                    marginTop: 8,
                    background: accentColor,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                    border: "none",
                    borderRadius: 4,
                    padding: "10px 20px",
                    display: "inline-block",
                    boxShadow: "0 1px 8px rgba(0,0,255,0.1)",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Youtube Channel"
                >
                  Visit Channel
                </a>
              </div>
            )}
            {!channel && !error && !loading && (
              <div
                style={{
                  color: "#898daa",
                  marginTop: 36,
                  textAlign: "center",
                  fontStyle: "italic",
                  fontSize: "1.13rem",
                }}
              >
                Try searching for channel names like &ldquo;
                <span style={{ color: accentColor }}>LinusTechTips</span>
                &rdquo;, &ldquo;
                <span style={{ color: accentColor }}>Veritasium</span>
                &rdquo; or &ldquo;
                <span style={{ color: accentColor }}>Vox</span>
                &rdquo;.
              </div>
            )}
          </section>
        </div>
      </main>
      {/* Footer */}
      <footer
        style={{
          background: themeVars["--footer-bg"],
          color: "#767676",
          boxShadow: "0 -1px 18px rgba(0,0,0,0.02)",
          fontSize: "0.98rem",
          letterSpacing: 0.08,
          textAlign: "center",
          padding: "22px 0 16px 0",
          position: "relative",
          width: "100%",
          marginTop: "auto",
        }}
        className="footer"
      >
        ChannelInsight &copy; {new Date().getFullYear()} &mdash; Powered by the YouTube Data API. &nbsp;
        <a
          href="https://www.youtube.com/"
          style={{ color: accentColor, textDecoration: "none", fontWeight: 500 }}
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
        </a>
        .
      </footer>
    </div>
  );
}

export default App;
