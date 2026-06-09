import mark from "@/assets/algoria-mark.png.asset.json";

export function BrandMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={mark.url}
      alt="Algoria"
      width={size}
      height={size}
      className={"shrink-0 select-none " + className}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
