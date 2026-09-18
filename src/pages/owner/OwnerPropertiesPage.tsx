import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiImage, FiPlus, FiSettings } from 'react-icons/fi';
import * as propertiesApi from '@api/propertiesApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { Spinner } from '@components/ui/Spinner';
import type { PropertySummary } from '@/types';
import { formatCurrency } from '@utils/format';

export function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await propertiesApi.listMyProperties();
      setProperties(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load properties'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggleStatus(property: PropertySummary) {
    setActionError('');
    try {
      await propertiesApi.updatePropertyStatus(
        property.id,
        !(property.is_active ?? true)
      );
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to update status'
      );
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            My properties
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage listings, images, and amenities
          </p>
        </div>
        <Link to="/owner/properties/new">
          <Button>
            <FiPlus />
            Add property
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading properties..." />
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}
      {actionError ? <Alert>{actionError}</Alert> : null}

      {!loading && !error && properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Create your first listing to start receiving bookings."
          action={
            <Link to="/owner/properties/new">
              <Button>
                <FiPlus />
                Create property
              </Button>
            </Link>
          }
        />
      ) : null}

      <div className="space-y-3">
        {properties.map((property) => (
          <div
            key={property.id}
            className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-4 sm:flex-row sm:items-center"
          >
            <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-brand-charcoal sm:w-36">
              {property.main_image ? (
                <img
                  src={property.main_image}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-600">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-white">
                  {property.name}
                </h2>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                    property.is_active
                      ? 'border-emerald-500/30 text-emerald-400'
                      : 'border-gray-500/30 text-gray-400'
                  }`}
                >
                  {property.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {property.city || '—'} · {formatCurrency(property.price_per_day)}
                /day · {property.bedrooms} bed · {property.max_guests} guests
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to={`/owner/properties/${property.id}/edit`}>
                <Button variant="secondary" className="!px-3">
                  <FiEdit2 />
                  Edit
                </Button>
              </Link>
              <Link to={`/owner/properties/${property.id}/images`}>
                <Button variant="secondary" className="!px-3">
                  <FiImage />
                  Images
                </Button>
              </Link>
              <Link to={`/owner/properties/${property.id}/amenities`}>
                <Button variant="secondary" className="!px-3">
                  <FiSettings />
                  Amenities
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="!px-3"
                onClick={() => void toggleStatus(property)}
              >
                {property.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
