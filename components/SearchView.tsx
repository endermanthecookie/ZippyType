import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    
    // Encode the query according to standard URL encoding
    const encodedQuery = encodeURIComponent(query.trim());
    
    // Using igu=1 allows Google Search to be embedded in an iframe in some cases,
    // but we stick to the requested format as closely as possible.
    setSearchUrl(`https://www.google.com/search?igu=1&q=${encodedQuery}`);
    
    // Simulate a short loading state for UX
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <div className="glass rounded-[2rem] p-10 space-y-10 animate-in zoom-in-95 duration-300 border border-white/10 shadow-2xl flex flex-col h-[80vh]">
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
          <Search size={22} />
        </div>
        <h2 className="text-base font-black text-white uppercase tracking-tighter">Zippy Search</h2>
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
                        // Scroll to bottom
                        window.scrollTo(0, document.body.scrollHeight);
                        
                        // Google's "Accept All" button usually has the jsname "b3V6yc" 
                        // or is the second primary button in that specific modal.
                        var acceptBtn = document.querySelector('button[jsname="b3V6yc"]');
                        
                        if (acceptBtn) {
                            acceptBtn.click();
                        } else {
                            // Fallback: Find the button that isn't "More options" or "Reject"
                            // In the EU/Global layout, it's typically the last button in the footer
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
                // This will likely be hit due to cross-origin resource sharing (CORS) policies
                console.warn("Cross-origin iframe access blocked by browser security policy. Cannot auto-click accept button.");
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SearchView;
