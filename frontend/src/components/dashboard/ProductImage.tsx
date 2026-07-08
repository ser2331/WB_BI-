import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { PictureOutlined } from '@ant-design/icons';
import { Flex, Skeleton, theme } from 'antd';
import { useLazyResolveProductPhotoQuery } from '@/api/wbApi';
import { allPhotoCandidates } from '@/utils/wbPhoto';

interface Props {
  nm: string;
  photo?: string | null;
  width?: number | string;
}

export const ProductImage = memo(function ProductImage({ nm, photo, width = '100%' }: Props) {
  const { token } = theme.useToken();
  const localCandidates = useMemo(() => allPhotoCandidates(photo, nm), [nm, photo]);
  const [candidates, setCandidates] = useState(localCandidates);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolvedRef = useRef(false);

  const [resolvePhoto, { data: resolved, isFetching }] = useLazyResolveProductPhotoQuery();

  useEffect(() => {
    setCandidates(localCandidates);
    setIndex(0);
    setFailed(false);
    setLoaded(false);
    resolvedRef.current = false;
  }, [localCandidates]);

  useEffect(() => {
    if (!resolved?.url) return;
    setCandidates((prev) => (prev.includes(resolved.url!) ? prev : [resolved.url!, ...prev]));
    setIndex(0);
    setFailed(false);
    setLoaded(false);
  }, [resolved?.url]);

  useEffect(() => {
    if (resolvedRef.current || isFetching) return;
    resolvedRef.current = true;
    void resolvePhoto(nm);
  }, [isFetching, nm, resolvePhoto]);

  const src = candidates[index];
  const showSkeleton = Boolean(src) && !failed && (!loaded || isFetching);

  const handleError = () => {
    if (index < candidates.length - 1) {
      setIndex((i) => i + 1);
      setLoaded(false);
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

  return (
    <div
      style={{
        position: 'relative',
        width,
        aspectRatio: '3 / 4',
        overflow: 'hidden',
        background: token.colorFillTertiary,
        borderRadius: token.borderRadius,
      }}
    >
      {showSkeleton ? (
        <Skeleton.Image
          active
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />
      ) : null}

      {!src || failed ? (
        <Flex
          align="center"
          justify="center"
          vertical
          gap={8}
          style={{ width: '100%', height: '100%', color: token.colorTextSecondary }}
        >
          {isFetching ? (
            <Skeleton.Avatar active size="large" shape="square" />
          ) : (
            <PictureOutlined />
          )}
          <span style={{ fontSize: 12 }}>{isFetching ? 'Загрузка…' : 'Нет фото'}</span>
        </Flex>
      ) : (
        <img
          src={src}
          alt={`SKU ${nm}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}
    </div>
  );
});
