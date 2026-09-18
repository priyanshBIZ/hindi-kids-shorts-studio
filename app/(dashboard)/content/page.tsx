"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Search, Filter, Sparkles } from "lucide-react";
import { StoryCard } from "@/components/content/StoryCard";
import { Button } from "@/components/ui/Button";

export default function ContentLibraryPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/stories" : `/api/stories?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setStories(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filter]);

  const filteredStories = stories.filter((s) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(query) ||
      s.concept.toLowerCase().includes(query) ||
      s.moral.toLowerCase().includes(query)
    );
  });

  const filterOptions = [
    { label: "All Content", value: "ALL" },
    { label: "Ready to Publish", value: "READY_TO_PUBLISH" },
    { label: "Video Pending", value: "VIDEO_PENDING" },
    { label: "Prompts Ready", value: "PROMPTS_READY" },
    { label: "Published", value: "PUBLISHED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-orange-400" />
            <span>Content Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, manage, and filter your Hindi animated children's Shorts library.
          </p>
        </div>

        <Link href="/content/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New Story</span>
          </Button>
        </Link>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search stories by title, concept, or moral..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                filter === opt.value
                  ? "bg-orange-500 text-white font-medium"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
          <p className="text-sm text-slate-400">No stories found matching your filter criteria.</p>
          <Link href="/content/new">
            <Button size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Create New Story</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
