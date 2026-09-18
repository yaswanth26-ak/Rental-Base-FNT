import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { z } from 'zod';
import * as propertiesApi from '@api/propertiesApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Textarea } from '@components/ui/FormControls';
import { Spinner } from '@components/ui/Spinner';

const propertySchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  description: z.string().optional(),
  address: z.string().trim().min(3, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  price_per_day: z.coerce.number().positive('Price must be greater than 0'),
  max_guests: z.coerce.number().int().positive().optional(),
  bedrooms: z.coerce.number().int().positive().optional(),
  bathrooms: z.coerce.number().int().positive().optional(),
});

export function OwnerPropertyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [maxGuests, setMaxGuests] = useState('1');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const response = await propertiesApi.getProperty(id!);
        const property = response.data;
        if (!active || !property) return;
        setName(property.name);
        setDescription(property.description ?? '');
        setAddress(property.address);
        setCity(property.city ?? '');
        setState(property.state ?? '');
        setPricePerDay(String(property.price_per_day));
        setMaxGuests(String(property.max_guests));
        setBedrooms(String(property.bedrooms));
        setBathrooms(String(property.bathrooms));
      } catch (err) {
        if (!active) return;
        setApiError(
          err instanceof ApiError ? err.message : 'Failed to load property'
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setApiError('');

    const parsed = propertySchema.safeParse({
      name,
      description,
      address,
      city,
      state,
      price_per_day: pricePerDay,
      max_guests: maxGuests,
      bedrooms,
      bathrooms,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? 'form');
        if (!next[key]) next[key] = issue.message;
      });
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: parsed.data.name,
        description: parsed.data.description || undefined,
        address: parsed.data.address,
        city: parsed.data.city || undefined,
        state: parsed.data.state || undefined,
        price_per_day: parsed.data.price_per_day,
        max_guests: parsed.data.max_guests,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
      };

      if (isEdit && id) {
        await propertiesApi.updateProperty(id, payload);
        navigate('/owner/properties');
      } else {
        const response = await propertiesApi.createProperty(payload);
        const createdId = response.data?.id;
        navigate(
          createdId
            ? `/owner/properties/${createdId}/images`
            : '/owner/properties'
        );
      }
    } catch (err) {
      setApiError(
        err instanceof ApiError ? err.message : 'Failed to save property'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading property..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <Link
        to="/owner/properties"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-orange"
      >
        <FiArrowLeft /> Back to properties
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          {isEdit ? 'Edit property' : 'New property'}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {isEdit
            ? 'Update listing details'
            : 'Add a new rental listing to your portfolio'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5"
      >
        {apiError ? <Alert>{apiError}</Alert> : null}
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />
        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
          />
          <Input
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            error={errors.state}
          />
        </div>
        <Input
          label="Price per day"
          type="number"
          min={1}
          value={pricePerDay}
          onChange={(e) => setPricePerDay(e.target.value)}
          error={errors.price_per_day}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Max guests"
            type="number"
            min={1}
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
            error={errors.max_guests}
          />
          <Input
            label="Bedrooms"
            type="number"
            min={1}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            error={errors.bedrooms}
          />
          <Input
            label="Bathrooms"
            type="number"
            min={1}
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            error={errors.bathrooms}
          />
        </div>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Save changes' : 'Create property'}
        </Button>
      </form>
    </div>
  );
}
