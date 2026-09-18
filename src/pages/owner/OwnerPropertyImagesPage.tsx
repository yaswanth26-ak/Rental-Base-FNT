import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import * as propertiesApi from '@api/propertiesApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/FormControls';
import { Spinner } from '@components/ui/Spinner';
import type { ImageType, PropertyImage } from '@/types';

const IMAGE_TYPES: ImageType[] = [
  'main',
  'living_room',
  'bedroom',
  'kitchen',
  'bathroom',
  'parking',
  'other',
];

export function OwnerPropertyImagesPage() {
  const { id } = useParams();
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageType, setImageType] = useState<ImageType>('main');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const response = await propertiesApi.listPropertyImages(id);
      setImages(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load images'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!id) return;
    setFormError('');
    if (!imageUrl.trim()) {
      setFormError('Image URL is required');
      return;
    }

    setSubmitting(true);
    try {
      await propertiesApi.addPropertyImage(id, {
        image_url: imageUrl.trim(),
        image_type: imageType,
        display_order: Number(displayOrder) || 0,
      });
      setImageUrl('');
      setDisplayOrder('0');
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Failed to add image'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(imageId: number) {
    if (!id) return;
    setFormError('');
    try {
      await propertiesApi.deletePropertyImage(id, imageId);
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Failed to delete image'
      );
    }
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
          Property images
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Add image URLs for this listing
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5"
      >
        <Input
          label="Image URL"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Image type"
            value={imageType}
            onChange={(e) => setImageType(e.target.value as ImageType)}
          >
            {IMAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input
            label="Display order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>
        {formError ? <Alert>{formError}</Alert> : null}
        <Button type="submit" loading={submitting}>
          Add image
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Loading images..." />
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
          >
            <div className="aspect-video bg-brand-charcoal">
              <img
                src={image.image_url}
                alt={image.image_type}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {image.image_type}
                </p>
                <p className="text-xs text-gray-500">
                  Order {image.display_order}
                </p>
              </div>
              <Button
                variant="danger"
                className="!px-3"
                onClick={() => void handleDelete(image.id)}
              >
                <FiTrash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
