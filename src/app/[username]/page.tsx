import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Camera, X, Globe, CheckCircle2 } from "lucide-react";

export default async function VitrinePublicPage({
  params
}: {
  params: { username: string }
}) {
  const { username } = params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      products: {
        where: { 
          status: "ACTIVE",
          showInShowcase: true 
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) notFound();

  const showcaseConfig = (user.showcaseConfig as any) || {};
  const socialLinks = (user.socialLinks as any) || {};

  return (
    <div className="min-h-screen bg-[#030507] text-[#f0f4f8] font-sans">
      {/* Header / Banner */}
      <div className="relative h-[300px] w-full overflow-hidden">
        {showcaseConfig.bannerUrl ? (
          <img 
            src={showcaseConfig.bannerUrl} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#030507]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030507] to-transparent opacity-60" />
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-32 h-32 rounded-3xl p-1 bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] shadow-2xl">
            <div className="w-full h-full bg-[#111820] rounded-[22px] flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl font-bold text-[#7c3aed]">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center gap-2">
              {user.name}
              <CheckCircle2 className="w-6 h-6 text-[#3b82f6] fill-[#3b82f6]/10" />
            </h1>
            <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg leading-relaxed">
              {showcaseConfig.bio || "Empresa verificada parceira PulsePay."}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 pt-4">
              <a href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`} target="_blank" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-pink-500">
                <Camera className="w-6 h-6" />
              </a>
            {socialLinks.twitter && (
              <a href={`https://twitter.com/${socialLinks.twitter.replace('@', '')}`} target="_blank" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-blue-400">
                <X className="w-6 h-6" />
              </a>
            )}
            <a href="#" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[#94a3b8]">
              <Globe className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-24 space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-[#7c3aed]">Nossos Produtos</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {user.products.length === 0 ? (
              <div className="col-span-full text-center py-20 opacity-30">
                Nenhum produto disponível no momento.
              </div>
            ) : (
              user.products.map((product) => (
                <div 
                  key={product.id}
                  className="group bg-[#0d1117] border border-white/5 rounded-[32px] overflow-hidden hover:border-[#7c3aed]/50 transition-all duration-500 shadow-xl hover:shadow-[#7c3aed]/10 flex flex-col h-full"
                >
                  <div className="aspect-[4/3] bg-[#111820] relative overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <ShoppingBag className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold">
                       PIX
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1 gap-6">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-bold line-clamp-2 leading-snug group-hover:text-[#7c3aed] transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-[#94a3b8] line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold opacity-50">R$</span>
                        <span className="text-3xl font-black text-white">
                          {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <Link 
                        href={`/c/${product.slug}`}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-[#7c3aed] hover:text-white transition-all duration-300 shadow-lg"
                      >
                        COMPRAR AGORA
                        <ShoppingBag className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-xs text-[#94a3b8]/30 font-bold tracking-[0.3em]">POWERED BY PULSEPAY</p>
      </footer>
    </div>
  );
}
