import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'plant' | 'post' | 'tip' | 'guide' | 'program';
  description?: string;
  url: string;
  relevance?: number;
}

interface SearchSuggestion {
  query: string;
  count: number;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    if (open && !query) {
      loadSuggestions();
      loadRecentSearches();
    }
  }, [open, query]);

  useEffect(() => {
    if (query.length > 2) {
      const delayedSearch = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      setResults([]);
    }
  }, [query]);

  const loadSuggestions = async () => {
    try {
      const { data } = await supabase
        .from('search_suggestions')
        .select('query, search_count')
        .order('search_count', { ascending: false })
        .limit(5);

      if (data) {
        setSuggestions(data.map(item => ({ query: item.query, count: item.search_count })));
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const saveSearch = async (searchQuery: string) => {
    // Save to recent searches
    const recent = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));

    // Save to database if user is logged in
    if (user) {
      try {
        await supabase
          .from('search_suggestions')
          .upsert({
            user_id: user.id,
            query: searchQuery,
            result_type: 'search',
            search_count: 1,
          }, {
            onConflict: 'user_id,query',
            ignoreDuplicates: false
          });
      } catch (error) {
        console.error('Error saving search:', error);
      }
    }
  };

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search plants
      const { data: plants } = await supabase
        .from('plants')
        .select('id, plant_name, scientific_name')
        .or(`plant_name.ilike.%${searchQuery}%,scientific_name.ilike.%${searchQuery}%`)
        .limit(5);

      if (plants) {
        searchResults.push(...plants.map(plant => ({
          id: plant.id,
          title: plant.plant_name,
          type: 'plant' as const,
          description: plant.scientific_name,
          url: `/my-garden?plant=${plant.id}`,
        })));
      }

      // Search community posts
      const { data: posts } = await supabase
        .from('community_posts')
        .select('id, title, description, type')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('status', 'active')
        .limit(5);

      if (posts) {
        searchResults.push(...posts.map(post => ({
          id: post.id,
          title: post.title,
          type: 'post' as const,
          description: post.description?.substring(0, 100) + '...',
          url: `/community-marketplace?post=${post.id}`,
        })));
      }

      // Search daily tips
      const { data: tips } = await supabase
        .from('daily_tips')
        .select('id, title, content, category')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .eq('is_active', true)
        .limit(3);

      if (tips) {
        searchResults.push(...tips.map(tip => ({
          id: tip.id,
          title: tip.title,
          type: 'tip' as const,
          description: tip.content.substring(0, 100) + '...',
          url: `/plant-guide?tip=${tip.id}`,
        })));
      }

      // Search propagation guides
      const { data: guides } = await supabase
        .from('propagation_guides')
        .select('id, plant_name, propagation_method')
        .ilike('plant_name', `%${searchQuery}%`)
        .limit(3);

      if (guides) {
        searchResults.push(...guides.map(guide => ({
          id: guide.id,
          title: `${guide.plant_name} - ${guide.propagation_method}`,
          type: 'guide' as const,
          description: `Propagation guide for ${guide.plant_name}`,
          url: `/propagation-guides?guide=${guide.id}`,
        })));
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveSearch(query);
    navigate(result.url);
    setOpen(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plant': return '🌱';
      case 'post': return '💬';
      case 'tip': return '💡';
      case 'guide': return '📖';
      case 'program': return '🎯';
      default: return '🔍';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative w-64 justify-start text-muted-foreground">
          <Search className="mr-2 h-4 w-4" />
          Search everything...
          <Badge variant="outline" className="ml-auto text-xs">
            ⌘K
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plants, guides, tips, community..."
            className="border-0 focus-visible:ring-0 text-sm"
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {!query && recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  Recent searches
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-auto p-1 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={() => handleSuggestionClick(search)}
                >
                  <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                  {search}
                </Button>
              ))}
            </div>
          )}

          {!query && suggestions.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Popular searches
                </span>
              </div>
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={() => handleSuggestionClick(suggestion.query)}
                >
                  <TrendingUp className="mr-2 h-3 w-3 text-muted-foreground" />
                  {suggestion.query}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {suggestion.count}
                  </Badge>
                </Button>
              ))}
            </div>
          )}

          {loading && query && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {results.length > 0 && (
            <div>
              <div className="px-2 py-1 mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Results ({results.length})
                </span>
              </div>
              {results.map((result) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <span className="text-lg">{getTypeIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {result.description}
                        </div>
                      )}
                      <Badge variant="outline" className="mt-1 text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}