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
            Premium Stay
          </span>
          <h1 className="text-white text-4xl font-bold leading-tight drop-shadow-lg">
            {name} <br />
            <span className="text-white/95 font-normal text-2xl drop-shadow-md">
              {address}
            </span>
          </h1>
        </div>

        {/* Host Chip */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 pr-4 rounded-xl w-fit hover:bg-white/20 transition-colors cursor-pointer">
          <div className="size-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                hostImage ||
                "https://ui-avatars.com/api/?name=" +
                  (hostName || "Host") +
                  "&background=random"
              }
              alt="Host"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wide">
              Hosted by
            </span>
            <span className="text-white text-sm font-bold leading-none">
              {hostName || "Anfitrión"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
