import { useEffect, useState, type ImgHTMLAttributes } from "react";

type PromisedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: () => Promise<string>;
};

export default function PromisedImage({
  src,
  style,
  ...props
}: PromisedImageProps) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!src) setCurrent(null);
    else src().then(setCurrent);
  }, [src]);

  return (
    <img
      src={current ?? undefined}
      style={{
        ...style,
        visibility: current === null ? "hidden" : style?.visibility,
      }}
      {...props}
    />
  );
}
