import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setLinks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search the web for real-time information about: ${query}. Focus on providing helpful, accurate, and concise information. If it's related to typing, keyboards, or productivity, provide extra detail.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setResults(response.text || "No results found.");

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedLinks = chunks
          .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
          .map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title
          }));
        
        // Remove duplicates
        const uniqueLinks = Array.from(new Map(extractedLinks.map((item: any) => [item.uri, item])).values());
        setLinks(uniqueLinks);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-[2rem] p-10 space-y-10 animate-in zoom-in-95 duration-300 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
          <Search size={22} />
        </div>
        <h2 className="text-base font-black text-white uppercase tracking-tighter">Zippy Search</h2>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about typing techniques, keyboard switches, or anything else..."
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

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-cyan-400" />
              <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">AI Summary</h3>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              {results.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-slate-300 leading-relaxed mb-2">{line}</p>
              ))}
            </div>
          </div>

          {links.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group"
                  >
                    <span className="text-xs font-medium text-slate-300 truncate mr-4">
                      {link.title}
                    </span>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;
