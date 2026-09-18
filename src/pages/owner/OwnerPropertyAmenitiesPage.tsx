import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import * as amenitiesApi from '@api/amenitiesApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import type { Amenity } from '@/types';
import { cn } from '@utils/format';

export function OwnerPropertyAmenitiesPage() {
  const { id } = useParams();
  const [catalog, setCatalog] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const [all, current] = await Promise.all([
          amenitiesApi.listAmenities(),
          amenitiesApi.getPropertyAmenities(id),
        ]);
        if (!active) return;
        setCatalog(all.data ?? []);
        setSelected((current.data ?? []).map((a) => a.id));
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load amenities'
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  function toggle(amenityId: number) {
    setSelected((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  }

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await amenitiesApi.replacePropertyAmenities(id, selected);
      setSelected((response.data ?? []).map((a) => a.id));
      setSuccess(response.message || 'Amenities updated');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to save amenities'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading amenities..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <Link
        to="/owner/properties"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-orange"
      >
        <FiArrowLeft /> Back to properties
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Property amenities
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Choose amenities available at this property
        </p>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {success ? <Alert tone="success">{success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.map((amenity) => {
          const isSelected = selected.includes(amenity.id);
          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggle(amenity.id)}
              className={cn(
                'rounded-2xl border px-4 py-4 text-left transition',
                isSelected
                  ? 'border-brand-orange bg-brand-orange/10 text-white shadow-glow-sm'
                  : 'border-brand-border bg-brand-surface text-gray-300 hover:border-brand-orange/40'
              )}
            >
              <p className="font-medium">{amenity.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                {isSelected ? 'Selected' : 'Tap to select'}
              </p>
            </button>
          );
        })}
      </div>

      <Button onClick={() => void handleSave()} loading={saving}>
        Save amenities
      </Button>
    </div>
  );
}
