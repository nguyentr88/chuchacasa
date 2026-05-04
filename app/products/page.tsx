"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categories = [
  "Tất cả sản phẩm", "Lót ly", "Túi vải/Pouch", "Ví tiền", "Hộp bút", "Thúng vải", "Phụ kiện"
];

const products = [
  { id: 1, name: "Lót ly hoa nhí", price: "45.000VNĐ", image: "/globe.svg", category: "Lót ly" },
  { id: 2, name: "Pouch thêu tay", price: "95.000VNĐ", image: "/globe.svg", category: "Túi vải/Pouch" },
  { id: 3, name: "Ví nhỏ Chu Cha", price: "65.000VNĐ", image: "/globe.svg", category: "Ví tiền" },
  { id: 4, name: "Hộp bút hoa văn", price: "75.000VNĐ", image: "/globe.svg", category: "Hộp bút" },
  { id: 5, name: "Thúng vải đựng đồ", price: "155.000VNĐ", image: "/globe.svg", category: "Thúng vải" },
  { id: 6, name: "Móc khóa len", price: "35.000VNĐ", image: "/globe.svg", category: "Phụ kiện" },
];

export default function ProductsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary-brown">
      {/* Category Pills */}
      <div className="px-6 py-8 flex flex-wrap gap-3 justify-center max-w-7xl mx-auto w-full">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`px-6 py-2 rounded-full border-2 border-primary-brown/10 text-sm font-medium transition-all hover:bg-highlight-yellow ${i === 0 ? 'bg-accent-red text-white border-accent-red shadow-md' : 'bg-white/50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex max-w-7xl mx-auto w-full px-6 gap-8 pb-20">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 hidden md:block">
          <div className="border-2 border-primary-brown/10 rounded-[2.5rem] overflow-hidden bg-white/30 backdrop-blur-sm sticky top-28">
            {/* Filter Section */}
            <div className="border-b border-primary-brown/10">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full p-6 flex justify-between items-center transition-colors ${isFilterOpen ? 'bg-accent-red/5' : 'hover:bg-accent-red/5'}`}
              >
                <span className="font-heading text-xl">BỘ LỌC</span>
                {isFilterOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
              
              {isFilterOpen && (
                <div className="px-6 pb-6 pt-2 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center text-base font-medium opacity-80 hover:opacity-100 cursor-pointer transition-opacity">
                    <span>KÍCH THƯỚC</span>
                    <Plus size={18} />
                  </div>
                  <div className="flex justify-between items-center text-base font-medium opacity-80 hover:opacity-100 cursor-pointer transition-opacity">
                    <span>CHẤT LIỆU</span>
                    <Plus size={18} />
                  </div>
                  <div className="flex justify-between items-center text-base font-medium opacity-80 hover:opacity-100 cursor-pointer transition-opacity">
                    <span>MÀU SẮC</span>
                    <Plus size={18} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Sort Section */}
            <div>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`w-full p-6 flex justify-between items-center transition-colors ${isSortOpen ? 'bg-accent-red/5' : 'hover:bg-accent-red/5'}`}
              >
                <span className="font-heading text-xl">SẮP XẾP THEO</span>
                {isSortOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
              
              {isSortOpen && (
                <div className="px-6 pb-8 pt-2 space-y-4 text-base font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="flex items-center gap-3 opacity-70 hover:opacity-100 cursor-pointer transition-all group">
                    <div className="w-5 h-5 rounded-full border-2 border-primary-brown flex items-center justify-center group-hover:border-accent-red">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-red scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                    <span>Tên A-Z</span>
                  </label>
                  <label className="flex items-center gap-3 opacity-70 hover:opacity-100 cursor-pointer transition-all group">
                    <div className="w-5 h-5 rounded-full border-2 border-primary-brown flex items-center justify-center group-hover:border-accent-red">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-red scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                    <span>Tên Z-A</span>
                  </label>
                  <label className="flex items-center gap-3 opacity-70 hover:opacity-100 cursor-pointer transition-all group">
                    <div className="w-5 h-5 rounded-full border-2 border-primary-brown flex items-center justify-center group-hover:border-accent-red">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-red scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                    <span>Giá thấp đến cao</span>
                  </label>
                  <label className="flex items-center gap-3 opacity-70 hover:opacity-100 cursor-pointer transition-all group">
                    <div className="w-5 h-5 rounded-full border-2 border-primary-brown flex items-center justify-center group-hover:border-accent-red">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-red scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                    <span>Giá cao xuống thấp</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex flex-col bg-white/40 border-2 border-primary-brown/5 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-[4/5] relative bg-secondary-pink/20 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 border-t-2 border-primary-brown/5">
                  <h3 className="font-heading text-lg mb-1">{product.name}</h3>
                  <p className="font-bold text-accent-red">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
