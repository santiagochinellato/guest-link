interface GuestHeroProps {
  image: string;
  name: string;
  address: string;
  hostName?: string;
  hostImage?: string;
}

export function GuestHero({
  image,
  name,
  address,
  hostName,
  hostImage,
}: GuestHeroProps) {
  return (
    <div className="relative w-full h-[380px] group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
        style={{
          backgroundImage: `url(${image || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2942&auto=format&fit=crop"})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-10 left-0 w-full p-6 flex flex-col gap-4">
        <div>
          <span className="inline-block px-3 py-1 mb-2 text-xs font-medium tracking-wider text-white uppercase bg-[#0f756d]/90 backdrop-blur-sm rounded-full shadow-lg">
            Bienvenido a
          </span>
          <h1 className="text-white text-4xl font-bold leading-tight drop-shadow-lg">
            {name} <br />
            {/* <span className="text-white/95 font-normal text-2xl drop-shadow-md">
              {address}
            </span> */}
          </h1>
        </div>
      </div>
    </div>
  );
}
