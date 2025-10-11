import React, { useEffect, useState } from 'react';

interface LinkPreviewProps {
  url: string;
}

interface NoEmbedResponse {
  title?: string;
  author_name?: string;
  provider_name?: string;
  thumbnail_url?: string;
  url?: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [data, setData] = useState<NoEmbedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setError(null);
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error('Failed to fetch link preview');
        const json = await res.json();
        if (isMounted) setData(json);
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Preview error');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [url]);

  const displayUrl = url.replace(/^https?:\/\//, '');

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow transition-shadow"
    >
      <div className="flex">
        {data?.thumbnail_url ? (
          <img
            src={data.thumbnail_url}
            alt={data.title || displayUrl}
            className="w-32 h-32 object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.172-1.172M10.172 13.828a4 4 0 005.656 0l3-3a4 4 0 10-5.656-5.656L12 5" />
            </svg>
          </div>
        )}
        <div className="p-3 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {data?.title || displayUrl}
          </div>
          {data?.provider_name && (
            <div className="text-xs text-gray-500 mt-1 truncate">{data.provider_name}</div>
          )}
          <div className="text-xs text-blue-600 mt-2 truncate">{displayUrl}</div>
          {error && (
            <div className="text-xs text-gray-500 mt-1 truncate">Xem tại {displayUrl}</div>
          )}
        </div>
      </div>
    </a>
  );
};


