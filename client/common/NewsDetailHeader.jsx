'use client';

import Link from 'next/link';
import { shareNewsItem } from '@/services/newsService';
import NewsActions from '@/common/NewsActions';
import ShareButton from '@/common/ShareButton';
import MetaInfo from '@/common/MetaInfo'; // ✅ Import MetaInfo

export default function NewsDetailHeader({ news, newsUrl }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-loose">
        {news.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-text text-sm">
        {/* ✅ MetaInfo Component */}
        <MetaInfo
          author={news.authoredBy}
          location={news.deskLocation}
          date={news.createdAt}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-4 ml-auto">
          <NewsActions news={news} />
          <ShareButton
            title={news.title}
            byline={news.byline}
            url={newsUrl}
            image={news.imageUrl}
            onShareSuccess={() => shareNewsItem(news._id)}
          />
        </div>
      </div>
    </div>
  );
}
