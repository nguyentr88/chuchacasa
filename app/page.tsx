import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-primary-brown">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="relative w-56 h-56 mb-10">
          <div className="absolute inset-0 bg-secondary-pink rounded-full -rotate-6 scale-110 opacity-50 blur-xl"></div>
          <div className="absolute inset-0 bg-highlight-yellow rounded-full rotate-3 opacity-30 blur-lg"></div>
          <div className="relative z-10 w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-inner border-4 border-white overflow-hidden">
            <Image
              src="/logo/chucha-avatar.jpg"
              alt="chucha.casa mascot"
              fill
              className="object-cover opacity-80"
            />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-heading text-primary-brown mb-2">
          chucha.casa
        </h1>

        <p className="text-2xl md:text-3xl font-subheading text-accent-red mb-10 italic">
          Mang hạnh phúc về nhà
        </p>

        <div className="max-w-2xl bg-white/40 p-8 rounded-[2rem] backdrop-blur-sm border-2 border-secondary-pink/30 shadow-sm mb-12">
          <p className="text-lg md:text-xl text-primary-brown/90 leading-relaxed">
            Welcome to <span className="font-bold text-accent-red">chucha.casa</span>.
            Nơi bạn “mang hạnh phúc về nhà” bằng những món quà nhỏ xinh.
            Tại ngôi nhà nhỏ của Chu và Cha, mỗi sản phẩm như lót ly, pouch, ví, thúng vải,...
            đều mang một câu chuyện và niềm vui riêng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <button className="px-10 py-5 bg-accent-red text-white font-bold rounded-full text-xl shadow-[0_8px_0_rgb(130,46,38)] hover:shadow-[0_4px_0_rgb(130,46,38)] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all">
            Khám phá ngay
          </button>
          <button className="px-10 py-5 bg-highlight-yellow text-primary-brown font-bold rounded-full text-xl border-2 border-primary-brown/10 hover:bg-highlight-yellow/80 transition-colors">
            Xem sản phẩm mới
          </button>
        </div>

        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
          <div className="group p-10 bg-white/60 rounded-[3rem] border-2 border-secondary-pink transition-all hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-6 group-hover:scale-125 transition-transform inline-block">🧸</div>
            <h3 className="text-2xl font-heading mb-3 text-primary-brown">Đồ chơi gấu bông</h3>
            <p className="text-base opacity-70">Những người bạn mềm mại, sẵn sàng ôm ấp mọi lúc.</p>
          </div>

          <div className="group p-10 bg-white/60 rounded-[3rem] border-2 border-highlight-yellow transition-all hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-6 group-hover:scale-125 transition-transform inline-block">🎁</div>
            <h3 className="text-2xl font-heading mb-3 text-primary-brown">Quà tặng độc đáo</h3>
            <p className="text-base opacity-70">Mỗi món quà là một câu chuyện riêng biệt.</p>
          </div>

          <div className="group p-10 bg-white/60 rounded-[3rem] border-2 border-secondary-pink transition-all hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-6 group-hover:scale-125 transition-transform inline-block">✨</div>
            <h3 className="text-2xl font-heading mb-3 text-primary-brown">Phụ kiện cute</h3>
            <p className="text-base opacity-70">Nhấn nhá cho cuộc sống thêm phần sắc màu.</p>
          </div>
        </section>
      </main>

      <footer className="p-10 bg-secondary-pink/20 text-center text-sm opacity-50 font-medium">
        &copy; 2024 chucha.casa. Made with ❤️ and Cute vibes.
      </footer>
    </div>
  );
}
