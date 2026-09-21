import { useState } from 'react';
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Eye,
  Sparkles,
} from 'lucide-react';
import { GalleryItem, GalleryCategory } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { formatDate } from '../utils/helpers';

interface GalleryPageProps {
  gallery: GalleryItem[];
}

export function GalleryPage({ gallery }: GalleryPageProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'campus', label: 'Campus & Ground' },
    { id: 'classroom', label: 'Classrooms' },
    { id: 'sports', label: 'Sports & Athletics' },
    { id: 'cultural', label: 'National & Cultural' },
    { id: 'science', label: 'Science & Exhibits' },
  ];

  const filteredItems =
    activeCategory === 'all'
      ? gallery
      : gallery.filter((item) => item.category === activeCategory);

  const handleOpenLightbox = (index: number) => {
    setSelectedItemIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedItemIndex(null);
  };

  const handleNext = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
    }
  };

  const handlePrev = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex(
        (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  const currentItem =
    selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;

  return (
    <div className="space-y-12 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Campus Moments in Kotauratla</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            School Photo Gallery
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            A glimpse into everyday learning, classroom environments, celebrations, and sports activities at
            Vidya Vikas EM School.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as GalleryCategory)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Image Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No photos in this category</h3>
            <p className="text-xs text-slate-500">
              Photographs for this section will be added during upcoming school events.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-semibold"
            >
              View All Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleOpenLightbox(index)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackTitle={item.title}
                    category={item.category}
                  />
                  <div className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-blue-950 group-hover:text-blue-800 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={handleCloseLightbox} />

          <div className="relative z-10 max-w-4xl w-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
            {/* Top Bar */}
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {currentItem.category}
                </span>
                <span className="text-xs text-slate-400">• {formatDate(currentItem.date)}</span>
              </div>
              <button
                onClick={handleCloseLightbox}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image Area */}
            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-hidden">
              <ImageWithFallback
                src={currentItem.imageUrl}
                alt={currentItem.title}
                className="max-h-[60vh] w-auto object-contain mx-auto"
                fallbackTitle={currentItem.title}
                category={currentItem.category}
              />

              {/* Prev / Next controls */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption */}
            <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-1">
              <h3 className="text-base font-bold text-white font-heading">{currentItem.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{currentItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
