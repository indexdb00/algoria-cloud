import mark from "@/assets/aurevia-mark.png.asset.json";

export function BrandMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={mark.url}
      alt="Aurevia"
      width={size}
      height={size}
      className={"shrink-0 select-none " + className}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
