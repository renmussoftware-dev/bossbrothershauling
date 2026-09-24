import { type SitePhoto, src, srcSet } from "@/lib/sitePhotos";

/**
 * A responsive <img> for the pre-resized photos in /public/photos.
 *
 * Plain <img> rather than next/image on purpose: the static export runs with
 * images.unoptimized, so next/image would add a wrapper and its own sizing
 * rules without optimizing anything. width/height come from the manifest so the
 * browser reserves the right box and the page doesn't jump as photos load.
 */
export function Photo({
  photo,
  sizes,
  className = "",
  priority = false,
}: {
  photo: SitePhoto;
  /** Tell the browser how wide this renders, so it picks the right srcset entry. */
  sizes: string;
  className?: string;
  /** Above the fold — skip lazy loading and fetch it early. */
  priority?: boolean;
}) {
  return (
    <img
      src={src(photo)}
      srcSet={srcSet(photo)}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}
