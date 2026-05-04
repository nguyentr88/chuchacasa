import Image from "next/image";
import { ChevronLeft, ShoppingBag, CreditCard } from "lucide-react";
import Link from "next/link";

// Mock data helper
const getProduct = (id: string) => ({
  id,
  name: id === "1" ? "Lót ly hoa nhí" : id === "2" ? "Pouch thêu tay" : "Ví nhỏ Chu Cha",
  price: id === "1" ? "45.000VNĐ" : id === "2" ? "95.000VNĐ" : "65.000VNĐ",
  size: id === "1" ? "10 x 10 cm" : id === "2" ? "15 x 12 cm" : "12 x 8 cm",
  description: "Một sản phẩm thủ công tinh xảo từ chucha.casa. Với chất liệu vải canvas cao cấp kết hợp cùng các đường thêu tỉ mỉ, món đồ này không chỉ tiện dụng mà còn là một điểm nhấn phong cách cho bạn.",
  image: "/globe.svg"
});

export default function ProductDetail({ params }: { params: { id: string } }) {
  const product = getProduct(params.id);

  return (
    <div className="min-h-screen bg-background text-primary-brown pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/products" className="flex items-center gap-2 font-medium hover:text-accent-red transition-colors mb-8">
          <ChevronLeft size={20} />
          Quay lại danh sách
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: Image */}
          <div className="flex-1">
            <div className="aspect-square relative bg-white rounded-[3rem] border-4 border-secondary-pink/20 overflow-hidden shadow-sm">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-12"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-heading mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-accent-red mb-6">{product.price}</p>
              
              <div className="space-y-6 text-lg">
                <div>
                  <h4 className="font-heading text-xl mb-2 opacity-80 text-secondary-pink-dark">Kích thước</h4>
                  <p className="bg-secondary-pink/20 inline-block px-4 py-2 rounded-xl font-medium border border-secondary-pink/30">
                    {product.size}
                  </p>
                </div>

                <div>
                  <h4 className="font-heading text-xl mb-2 opacity-80">Mô tả</h4>
                  <p className="leading-relaxed opacity-90">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white border-4 border-accent-red text-accent-red font-bold rounded-full text-xl hover:bg-accent-red hover:text-white transition-all shadow-md active:scale-95">
                <ShoppingBag size={24} />
                Thêm vào giỏ
              </button>
              <button className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-accent-red text-white font-bold rounded-full text-xl hover:shadow-lg hover:scale-105 transition-all shadow-md active:scale-95">
                <CreditCard size={24} />
                Mua ngay
              </button>
            </div>
            
            <div className="mt-12 p-6 bg-highlight-yellow/30 rounded-[2rem] border-2 border-highlight-yellow/50">
              <h4 className="font-heading text-lg mb-2 italic">Ghi chú từ Chu Cha:</h4>
              <p className="text-sm opacity-80 italic">
                Sản phẩm được làm thủ công nên mỗi chiếc sẽ có một chút khác biệt nhỏ, tạo nên sự độc bản cho món quà của bạn. ✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
