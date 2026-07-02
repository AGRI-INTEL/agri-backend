'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Sprout,
  Wheat,
  Fish,
  TreePine,
  CloudSun,
  Map,
  MessageSquare,
  Bell,
  PlusCircle,
  Send,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Settings,
  X,
  History,
  Trash2,
} from 'lucide-react';
import { useCommandPalette, initCommandPaletteShortcut } from '@/hooks/use-command-palette';

interface PageItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface ActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

const PAGES: PageItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'production', label: 'Production végétale', href: '/production', icon: <Sprout size={16} /> },
  { id: 'elevage', label: 'Élevage', href: '/animal', icon: <Wheat size={16} /> },
  { id: 'halieutique', label: 'Pêche / Halieutique', href: '/halieutique', icon: <Fish size={16} /> },
  { id: 'forestier', label: 'Secteur forestier', href: '/forestier', icon: <TreePine size={16} /> },
  { id: 'weather', label: 'Météo', href: '/weather', icon: <CloudSun size={16} /> },
  { id: 'map', label: 'Carte interactive', href: '/map', icon: <Map size={16} /> },
  { id: 'chatbot', label: 'Assistant IA', href: '/chatbot', icon: <MessageSquare size={16} /> },
  { id: 'alerts', label: 'Alertes', href: '/alerts', icon: <Bell size={16} /> },
  { id: 'indicators', label: 'Indicateurs', href: '/indicators', icon: <BarChart3 size={16} /> },
  { id: 'analytics', label: 'Analyses', href: '/analytics', icon: <TrendingUp size={16} /> },
  { id: 'community', label: 'Communauté', href: '/community', icon: <Users size={16} /> },
  { id: 'files', label: 'Fichiers', href: '/files', icon: <FileText size={16} /> },
  { id: 'messages', label: 'Messages', href: '/messages', icon: <MessageSquare size={16} /> },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: <Bell size={16} /> },
  { id: 'settings', label: 'Paramètres', href: '/settings', icon: <Settings size={16} /> },
];

export function CommandPalette() {
  const {
    isOpen,
    close,
    query,
    setQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  } = useCommandPalette();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<{ label: string; href: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return initCommandPaletteShortcut();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.results)) {
          setSearchResults(
            data.results
              .map((r: { title?: string; name?: string; url?: string; href?: string }) => ({
                label: r.title || r.name || '',
                href: r.url || r.href || '#',
              }))
              .filter((r: { label: string }) => r.label)
          );
        }
      } catch {
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      addRecentSearch(query);
      close();
      router.push(href);
    },
    [close, router, query, addRecentSearch]
  );

  const ACTIONS: ActionItem[] = [
    {
      id: 'new-alert',
      label: 'Créer une alerte',
      description: 'Configurer une nouvelle alerte personnalisée',
      icon: <PlusCircle size={16} />,
      onSelect: () => navigate('/alerts/new'),
    },
    {
      id: 'new-message',
      label: 'Nouveau message',
      description: 'Envoyer un message à un membre',
      icon: <Send size={16} />,
      onSelect: () => navigate('/messages/new'),
    },
    {
      id: 'new-post',
      label: 'Publier dans la communauté',
      description: 'Créer un post dans un groupe',
      icon: <Users size={16} />,
      onSelect: () => navigate('/community/new'),
    },
  ];

  const handleSelect = useCallback(
    (value: string) => {
      const page = PAGES.find((p) => p.id === value);
      if (page) {
        navigate(page.href);
        return;
      }
      const action = ACTIONS.find((a) => a.id === value);
      if (action) {
        action.onSelect();
        return;
      }
      const searchResult = searchResults.find((_, i) => `search-${i}` === value);
      if (searchResult) {
        navigate(searchResult.href);
      }
    },
    [navigate, searchResults]
  );

  const handleRecentSearchClick = useCallback(
    (search: string) => {
      setQuery(search);
    },
    [setQuery]
  );

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
          setQuery('');
          setSearchResults([]);
        }
      }}
      label="Palette de commandes"
      className="cmdk-dialog"
    >
      <Command.Input
        ref={inputRef}
        placeholder="Rechercher une page, une action..."
        value={query}
        onValueChange={setQuery}
        className="cmdk-input"
        autoFocus
      />
      <Command.List className="cmdk-list">
        <Command.Empty className="cmdk-empty">
          <div className="cmdk-empty-inner">
            <Search size={20} />
            <span>Aucun résultat pour &quot;{query}&quot;</span>
          </div>
        </Command.Empty>

        {query.length < 2 && recentSearches.length > 0 && (
          <>
            <Command.Group heading="Recherches récentes" className="cmdk-group">
              {recentSearches.map((search, i) => (
                <div key={`recent-${i}`} className="cmdk-recent-row">
                  <Command.Item
                    value={`recent-${i}`}
                    onSelect={() => handleRecentSearchClick(search)}
                    className="cmdk-item cmdk-recent-item"
                  >
                    <span className="cmdk-item-icon">
                      <History size={14} />
                    </span>
                    <span className="cmdk-item-label">{search}</span>
                  </Command.Item>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                    className="cmdk-recent-remove"
                    title="Supprimer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div className="cmdk-recent-clear">
                <button
                  onClick={clearRecentSearches}
                  className="cmdk-recent-clear-btn"
                >
                  <Trash2 size={12} />
                  Effacer l&apos;historique
                </button>
              </div>
            </Command.Group>
            <Command.Separator className="cmdk-separator" />
          </>
        )}

        {query.length < 2 && (
          <>
            <Command.Group heading="Pages" className="cmdk-group">
              {PAGES.map((page) => (
                <Command.Item
                  key={page.id}
                  value={page.id}
                  onSelect={handleSelect}
                  className="cmdk-item"
                >
                  <span className="cmdk-item-icon">{page.icon}</span>
                  <span className="cmdk-item-label">{page.label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="cmdk-separator" />

            <Command.Group heading="Actions rapides" className="cmdk-group">
              {ACTIONS.map((action) => (
                <Command.Item
                  key={action.id}
                  value={action.id}
                  onSelect={handleSelect}
                  className="cmdk-item"
                >
                  <span className="cmdk-item-icon">{action.icon}</span>
                  <div className="cmdk-item-content">
                    <span className="cmdk-item-label">{action.label}</span>
                    <span className="cmdk-item-desc">{action.description}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </>
        )}

        {searchResults.length > 0 && (
          <>
            <Command.Separator className="cmdk-separator" />
            <Command.Group heading="Résultats de recherche" className="cmdk-group">
              {searchResults.map((result, i) => (
                <Command.Item
                  key={`search-${i}`}
                  value={`search-${i}`}
                  onSelect={handleSelect}
                  className="cmdk-item"
                >
                  <span className="cmdk-item-icon">
                    <Search size={16} />
                  </span>
                  <span className="cmdk-item-label">{result.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </>
        )}

        {searching && (
          <div className="cmdk-loading">
            <div className="cmdk-spinner" />
            <span>Recherche en cours&hellip;</span>
          </div>
        )}
      </Command.List>

      <div className="cmdk-footer">
        <span className="cmdk-footer-hint">
          <kbd>&uarr;&darr;</kbd> naviguer
        </span>
        <span className="cmdk-footer-hint">
          <kbd>&crarr;</kbd> sélectionner
        </span>
        <span className="cmdk-footer-hint">
          <kbd>Esc</kbd> fermer
        </span>
      </div>

      <style>{`
        .cmdk-dialog {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 12vh 1rem 1rem;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          border: none;
        }

        .cmdk-dialog[data-state='open'] {
          animation: cmdk-fade-in 0.15s ease;
        }

        .cmdk-dialog[data-state='closed'] {
          animation: cmdk-fade-out 0.1s ease;
        }

        @keyframes cmdk-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cmdk-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .cmdk-dialog > div {
          width: 100%;
          max-width: 580px;
          border-radius: 16px;
          overflow: hidden;
          background: #0C1810;
          border: 1px solid rgba(196,146,58,0.15);
          box-shadow:
            0 0 0 1px rgba(196,146,58,0.08),
            0 20px 60px rgba(0,0,0,0.5),
            0 8px 24px rgba(0,0,0,0.3);
        }

        .cmdk-input {
          width: 100%;
          padding: 1rem 1.125rem;
          font-size: 0.9375rem;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(196,146,58,0.12);
          color: #E4DBC8;
          outline: none;
          font-family: inherit;
        }

        .cmdk-input::placeholder {
          color: #5E7A68;
        }

        .cmdk-list {
          max-height: 360px;
          overflow-y: auto;
          padding: 0.5rem 0;
          overscroll-behavior: contain;
        }

        .cmdk-list::-webkit-scrollbar {
          width: 6px;
        }
        .cmdk-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .cmdk-list::-webkit-scrollbar-thumb {
          background: rgba(196,146,58,0.15);
          border-radius: 3px;
        }
        .cmdk-list::-webkit-scrollbar-thumb:hover {
          background: rgba(196,146,58,0.25);
        }

        .cmdk-group [cmdk-group-heading] {
          padding: 0.5rem 1.125rem 0.375rem;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #C4923A;
        }

        .cmdk-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 1.125rem;
          cursor: pointer;
          transition: background 0.12s ease;
          color: #E4DBC8;
          font-size: 0.875rem;
          border-left: 2px solid transparent;
          user-select: none;
        }

        .cmdk-item[data-selected='true'] {
          background: rgba(196,146,58,0.10);
          border-left-color: #C4923A;
        }

        .cmdk-item[data-disabled='true'] {
          opacity: 0.4;
          pointer-events: none;
        }

        .cmdk-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: #C4923A;
        }

        .cmdk-item-label {
          flex: 1;
          color: #E4DBC8;
        }

        .cmdk-item-content {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }

        .cmdk-item-desc {
          font-size: 0.75rem;
          color: #5E7A68;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cmdk-separator {
          height: 1px;
          margin: 0.375rem 1.125rem;
          background: rgba(196,146,58,0.08);
        }

        .cmdk-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        .cmdk-empty-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.625rem;
          color: #5E7A68;
          font-size: 0.875rem;
        }

        .cmdk-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          padding: 1.5rem;
          color: #5E7A68;
          font-size: 0.8125rem;
        }

        .cmdk-spinner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(196,146,58,0.15);
          border-top-color: #C4923A;
          animation: cmdk-spin 0.6s linear infinite;
        }

        @keyframes cmdk-spin {
          to { transform: rotate(360deg); }
        }

        .cmdk-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.625rem 1.125rem;
          border-top: 1px solid rgba(196,146,58,0.08);
          background: rgba(0,0,0,0.15);
        }

        .cmdk-footer-hint {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.6875rem;
          color: #5E7A68;
        }

        .cmdk-footer-hint kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 4px;
          font-size: 0.625rem;
          font-family: inherit;
          font-weight: 600;
          background: rgba(196,146,58,0.08);
          border: 1px solid rgba(196,146,58,0.15);
          color: #C4923A;
        }

        .cmdk-recent-row {
          display: flex;
          align-items: center;
        }

        .cmdk-recent-item {
          flex: 1;
        }

        .cmdk-recent-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          margin-right: 0.75rem;
          border: none;
          background: transparent;
          color: #5E7A68;
          cursor: pointer;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.12s, color 0.12s, background 0.12s;
          flex-shrink: 0;
        }

        .cmdk-recent-row:hover .cmdk-recent-remove {
          opacity: 1;
        }

        .cmdk-recent-remove:hover {
          color: #F87171;
          background: rgba(248,113,113,0.1);
        }

        .cmdk-recent-clear {
          padding: 0.25rem 1.125rem 0.5rem;
        }

        .cmdk-recent-clear-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.5rem;
          border: none;
          background: transparent;
          color: #5E7A68;
          font-size: 0.6875rem;
          cursor: pointer;
          border-radius: 4px;
          transition: color 0.12s;
        }

        .cmdk-recent-clear-btn:hover {
          color: #F87171;
        }

        @media (prefers-reduced-motion: reduce) {
          .cmdk-dialog[data-state='open'],
          .cmdk-dialog[data-state='closed'],
          .cmdk-spinner {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </Command.Dialog>
  );
}
