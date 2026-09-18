import { useEffect, useState } from 'react';
import { ApiError } from '@api/apiClient';
import { HouseDetail } from '@components/properties/HouseDetail';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { Spinner } from '@components/ui/Spinner';
import { useAuth } from '@context/AuthContext';
import type { Property } from '@/types';
import { fetchFixedProperty } from '@utils/fixedProperty';

export function HomePage() {
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const house = await fetchFixedProperty();
        if (!active) return;
        setProperty(house);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load the rental house'
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading the house..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <EmptyState
          title="House unavailable"
          description="Please try again in a moment."
          action={
            <Button type="button" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  if (!property) {
    return <Alert>Rental house not found</Alert>;
  }

  return (
    <HouseDetail
      property={property}
      greetingName={user?.name?.split(' ')[0]}
    />
  );
}
