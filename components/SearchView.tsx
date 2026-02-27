import React, { useState, useRef } from 'react';
import { Search, Loader2, ArrowLeft, ArrowRight, Copy, Globe } from 'lucide-react';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const encodedQuery = encodeURIComponent(query.trim());
    const newUrl = `https://www.google.com/search?igu=1&q=${encodedQuery}`;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSearchUrl(newUrl);
    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSearchUrl(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSearchUrl(history[newIndex]);
    }
  };

  const copyLink = () => {
    if (searchUrl) {
      navigator.clipboard.writeText(searchUrl);
    }
  };

  return (
    <div className="glass rounded-[2rem] p-10 space-y-6 animate-in zoom-in-95 duration-300 border border-white/10 shadow-2xl flex flex-col h-[80vh]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Search size={22} />
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-tighter">Zippy Search</h2>
        </div>

        {searchUrl && (
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 max-w-md overflow-hidden">
            <Globe size={14} className="text-cyan-400 shrink-0" />
            <span className="text-[10px] text-slate-400 font-mono truncate">{searchUrl}</span>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button 
                onClick={goBack} 
                disabled={historyIndex <= 0}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 transition-all"
                title="Back"
              >
                <ArrowLeft size={14} />
              </button>
              <button 
                onClick={goForward} 
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 transition-all"
                title="Forward"
              >
                <ArrowRight size={14} />
              </button>
              <button 
                onClick={copyLink}
                className="p-1.5 hover:bg-white/10 rounded-lg text-cyan-400 transition-all"
                title="Copy Link"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="relative shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Google..."
          className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-sm focus:border-cyan-500 transition-all outline-none shadow-inner"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black rounded-lg text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
        </button>
      </form>

      {searchUrl && (
        <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden border border-white/10 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Loader2 size={32} className="animate-spin text-cyan-600" />
            </div>
          )}
          <iframe 
            ref={iframeRef}
            src={searchUrl} 
            className="w-full h-full border-0"
            title="Google Search Results"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onLoad={(e) => {
              try {
                const iframe = e.target as HTMLIFrameElement;
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                  const script = doc.createElement('script');
                  script.textContent = `
                    (function() {
                        window.scrollTo(0, document.body.scrollHeight);
                        var acceptBtn = document.querySelector('button[jsname="b3V6yc"]');
                        if (acceptBtn) {
                            acceptBtn.click();
                        } else {
                            var buttons = document.querySelectorAll('button');
                            if (buttons.length >= 2) {
                                buttons[buttons.length - 1].click(); 
                            }
                        }
                    })();
                  `;
                  doc.body.appendChild(script);
                }
              } catch (err) {
                console.warn("Cross-origin iframe access blocked by browser security policy.");
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SearchView;
