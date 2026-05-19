'use client';

import React, { useState } from 'react';
import { Plus, RefreshCw, FolderSearch } from 'lucide-react';
import AuthGuard from '@/components/layout/AuthGuard';
import MobileLayout from '@/components/layout/MobileLayout';
import PageHeader from '@/components/layout/PageHeader';
import PlaceSearchBar from '@/components/places/PlaceSearchBar';
import PlaceCard from '@/components/places/PlaceCard';
import AddPlaceSheet from '@/components/places/AddPlaceSheet';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { usePlaces } from '@/hooks/usePlaces';
import { useToast } from '@/components/ui/ToastProvider';
import { useLanguage } from '@/components/ui/LanguageProvider';

export default function PlacesPage() {
  const { places, isLoading, error, refetch, createPlace, isCreating } = usePlaces();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filter A-Z alphabetically sorted places
  const filteredPlaces = places.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddLocation = async (name: string) => {
    try {
      await createPlace(name);
      toast('Delivery place added successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to submit place.', 'error');
      throw err; // bubble error to sheets
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast('Places list refreshed!', 'info');
    } catch {
      toast('Refresh failed. Please check network connection.', 'error');
    }
  };

  return (
    <AuthGuard>
      <MobileLayout showNav={true}>
        {/* Sticky page header with action buttons */}
        <PageHeader
          title={t.deliveryPlaces}
          subtitle={t.billingHub}
          showLogout={true}
          rightAction={
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-white/80 hover:text-white hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all duration-100 disabled:opacity-50"
              title={t.refresh}
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        {/* Large search input */}
        <PlaceSearchBar value={search} onChange={setSearch} placeholder={t.searchPlaces} />

        <div className="flex-1 overflow-y-auto pt-2 pb-6 space-y-3">
          {isLoading ? (
            // Render Skeleton loaders
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="mx-4">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error panel
            <div className="p-6 text-center select-none">
              <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-100 rounded-2xl p-4.5">
                {t.language === 'ta' ? '⚠️ டெலிவரி இடங்களை ஏற்றுவதில் தோல்வி. புதுப்பிக்க கீழே இழுக்கவும்.' : '⚠️ Failed to load delivery locations. Please pull to refresh.'}
              </p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            // Empty state display
            <EmptyState
              icon={FolderSearch}
              title={search ? (t.language === 'ta' ? 'பொருத்தம் எதுவும் இல்லை' : 'No Match Found') : (t.language === 'ta' ? 'இடங்கள் எதுவும் இல்லை' : 'No Places Added')}
              description={
                search
                  ? (t.language === 'ta' ? `"${search}"-க்கு இணையான இடம் எதுவும் இல்லை. உங்கள் தேடலை மாற்றவும்.` : `We couldn't find any location matching "${search}". Please adjust your query.`)
                  : (t.language === 'ta' ? 'முதல் டெலிவரி இடத்தை பதிவு செய்து பில்களை கண்காணிக்க தொடங்குங்கள்.' : 'Start tracking delivery invoices by logging your first delivery place.')
              }
              action={
                !search ? (
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold px-4 py-2.5 text-xs shadow-md shadow-primary-500/20 active:scale-95 transition-all select-none"
                  >
                    {t.addFirstPlace}
                  </button>
                ) : undefined
              }
            />
          ) : (
            // List sorted cards
            filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))
          )}
        </div>

        {/* FAB (+) button to trigger slide sheet */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="fixed bottom-20 right-6 z-30 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(22,163,74,0.3)] active:scale-90 active:bg-primary-800 transition-all select-none focus:outline-none"
          title={t.addLocation}
          id="btn-add-place"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Bottom Slide-up Sheet form */}
        <AddPlaceSheet
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddLocation}
          isLoading={isCreating}
        />
      </MobileLayout>
    </AuthGuard>
  );
}
