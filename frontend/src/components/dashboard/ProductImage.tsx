import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useLazyResolveProductPhotoQuery } from '@/api/wbApi';
import { allPhotoCandidates } from '@/utils/wbPhoto';
import { NoPhoto, PhotoWrap } from './dashboard.styles';

interface Props {
  nm: string;
  photo?: string | null;
}

export const ProductImage = memo(function ProductImage({ nm, photo }: Props) {
  const localCandidates = useMemo(() => allPhotoCandidates(photo, nm), [nm, photo]);
  const [candidates, setCandidates] = useState(localCandidates);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const resolvedRef = useRef(false);

  const [resolvePhoto, { data: resolved, isFetching }] = useLazyResolveProductPhotoQuery();

  useEffect(() => {
    setCandidates(localCandidates);
    setIndex(0);
    setFailed(false);
    resolvedRef.current = false;
  }, [localCandidates]);

  useEffect(() => {
    if (!resolved?.url) return;
    setCandidates((prev) => (prev.includes(resolved.url!) ? prev : [resolved.url!, ...prev]));
    setIndex(0);
    setFailed(false);
  }, [resolved?.url]);

  const src = candidates[index];

  const handleError = () => {
    if (index < candidates.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    if (!resolvedRef.current && !isFetching) {
      resolvedRef.current = true;
      void resolvePhoto(nm);
      return;
    }
    if (!isFetching) {
      setFailed(true);
    }
  };

  if (!src || failed) {
    return (
      <PhotoWrap>
        <NoPhoto>{isFetching ? '…' : 'Нет фото'}</NoPhoto>
      </PhotoWrap>
    );
  }

  return (
    <PhotoWrap>
      <img src={src} alt={`SKU ${nm}`} loading="lazy" decoding="async" onError={handleError} />
    </PhotoWrap>
  );
});
