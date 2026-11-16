import React, { useState } from 'react';
import { ExternalLink, MapPin, X } from 'lucide-react';
import { BRAND_ASSETS } from '../lib/assets';
import { PageHeroBanner } from '../components/PageHeroBanner';
import type { SiteContentMap } from '../types/content';

interface AboutSectionProps {
  siteContent?: SiteContentMap;
}

const CAMPUS_GALLERY = [
  {
    src: BRAND_ASSETS.campusAerial,
    alt: 'Aerial panoramic view of Bearys Institute of Technology campus in Mangalore surrounded by lush greenery and river valley',
    caption: 'Bearys Institute of Technology — Aerial Campus Panorama',
  },
  {
    src: BRAND_ASSETS.campusBuilding,
    alt: 'Bearys Institute of Technology architectural campus building framed by green trees and lawns',
    caption: 'Campus Architecture Amid Greenery',
  },
];

export function AboutSection({ siteContent }: AboutSectionProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof CAMPUS_GALLERY)[number] | null>(null);

  const about = siteContent?.about_bit;
  const collegeName = about?.college_name || 'Bearys Institute of Technology';
  const location = about?.location || 'Mangalore, Karnataka';
  const intro =
    about?.introduction ||
    'Bearys Institute of Technology (BIT) in Mangalore, Karnataka is an engineering institution surrounded by coastal greenery. CORESPACE brings students together to explore emerging technologies, share knowledge, and build collaborative projects.';
  const officialUrl = about?.official_website || 'https://www.bitmangalore.edu.in/';

  return (
    <div>
      <PageHeroBanner
        kicker={location}
        title={collegeName}
        description={intro}
        backdrop="digitalNatureHorizon"
        action={
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] px-5 py-3 text-xs font-semibold text-white whitespace-nowrap"
          >
            <span>Visit Official College Website</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        }
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <MapPin className="h-4 w-4 text-[#16A34A]" />
          <span>Campus Photographs — {collegeName}, {location}</span>
        </div>

        {/* Authentic Campus Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAMPUS_GALLERY.map((photo) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="cyber-frame group overflow-hidden text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4 border-t border-slate-200/70 dark:border-slate-800/70">
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {photo.caption}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-2xl border border-slate-700 bg-[#070E20]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photograph"
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              className="w-full max-h-[80vh] object-contain bg-black"
            />
            <p className="p-4 text-sm text-slate-200">{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
