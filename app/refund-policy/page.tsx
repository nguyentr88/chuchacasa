import { getSettingAction } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";

const SETTING_KEY = "refund_policy";

const DEFAULT_POLICY = `Chính sách hoàn tiền

Tại chucha.casa, tụi mình luôn mong bạn hài lòng với mỗi món đồ nhỏ xinh mà chúng mình gửi đến. Nếu có bất kỳ sự cố nào xảy ra, chucha.casa cam kết hỗ trợ hoàn tiền theo chính sách dưới đây:

### 1. Trường hợp được hoàn tiền
Bạn có thể yêu cầu hoàn tiền nếu gặp các tình huống sau:
- Sản phẩm bị lỗi kỹ thuật do quá trình sản xuất (mực in nhòe, vỡ mica, vải rách...)
- Sản phẩm bị hư hỏng trong quá trình vận chuyển
- Giao sai mẫu, sai số lượng so với đơn đặt

📌 **Lưu ý quan trọng:**
Để đảm bảo quyền lợi của bạn và tụi mình xử lý đơn chính xác hơn, vui lòng quay video rõ nét toàn bộ quá trình mở gói hàng (khui hàng) ngay khi nhận được.
Video khui hàng là bằng chứng bắt buộc để xác nhận yêu cầu hoàn tiền.

### 2. Trường hợp không áp dụng hoàn tiền
chucha.casa rất tiếc không thể hỗ trợ hoàn tiền nếu:
- Bạn đổi ý sau khi đã đặt hàng
- Sản phẩm đã qua sử dụng hoặc bảo quản sai cách
- Không có video khui hàng đi kèm
- Yêu cầu hoàn tiền được gửi quá 3 ngày sau khi nhận hàng

### 3. Hình thức hoàn tiền
- Tiền sẽ được chuyển lại vào tài khoản ngân hàng (hoặc ví điện tử) trong vòng 3 – 5 ngày làm việc sau khi yêu cầu được duyệt.
- chucha.casa sẽ chủ động liên hệ xác minh thông tin thanh toán với bạn.

### 4. Cách gửi yêu cầu hoàn tiền
Vui lòng nhắn cho tụi mình kèm video khui hàng và mô tả vấn đề qua:
- 📩 Instagram: @chuchacasa
- 📧 Email: chucha.casa.vn@gmail.com
- 📞 Zalo: 0901923469`;

/**
 * Bộ phân giải Markdown cho giao diện khách hàng
 */
function parseMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const cleanLine = line.trim();

    if (cleanLine === "") {
      return <div key={i} className="h-2"></div>;
    }

    if (cleanLine.startsWith("# ")) {
      return (
        <h1 key={i} className="text-3xl sm:text-4xl font-heading text-accent-red mt-6 mb-6 tracking-wide text-center">
          {cleanLine.replace("# ", "")}
        </h1>
      );
    }

    if (cleanLine.startsWith("### ")) {
      return (
        <h3 key={i} className="text-xl font-bold text-primary-brown mt-6 mb-3 flex items-center gap-2 border-b border-primary-brown/5 pb-1">
          <span className="w-1.5 h-4 bg-accent-red rounded-full block shadow-sm"></span>
          {cleanLine.replace("### ", "")}
        </h3>
      );
    }

    // Badge liên lạc động
    if (
      cleanLine.includes("Instagram:") || 
      cleanLine.includes("Email:") || 
      cleanLine.includes("Zalo :") || 
      cleanLine.includes("Zalo:")
    ) {
      let badgeStyle = "bg-secondary-pink/30 hover:bg-secondary-pink/50 text-accent-red border-secondary-pink/20";
      let icon = "📩";
      let href = "#";
      let textToShow = cleanLine.replace("- ", "");

      if (cleanLine.includes("Instagram")) {
        badgeStyle = "bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200";
        icon = "📸";
        href = "https://instagram.com/chuchacasa";
        textToShow = "Instagram: @chuchacasa";
      } else if (cleanLine.includes("Email")) {
        badgeStyle = "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200";
        icon = "📧";
        href = "mailto:chucha.casa.vn@gmail.com";
        textToShow = "Email: chucha.casa.vn@gmail.com";
      } else if (cleanLine.includes("Zalo")) {
        badgeStyle = "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200";
        icon = "📞";
        href = "https://zalo.me/0901923469";
        textToShow = "Zalo: 0901923469";
      }

      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 my-1 mr-2 cursor-pointer duration-300 ${badgeStyle}`}
        >
          <span>{icon}</span>
          <span>{textToShow}</span>
        </a>
      );
    }

    if (cleanLine.startsWith("- ")) {
      let content: React.ReactNode = cleanLine.replace("- ", "");
      if (typeof content === "string" && content.includes("**")) {
        const parts = content.split("**");
        content = parts.map((part, index) =>
          index % 2 === 1 ? <strong key={index} className="font-extrabold text-accent-red">{part}</strong> : part
        );
      }
      return (
        <li key={i} className="ml-5 list-disc text-primary-brown/90 mb-1 leading-relaxed pl-1">
          {content}
        </li>
      );
    }

    if (cleanLine.startsWith("📌 ")) {
      let content: React.ReactNode = cleanLine.replace("📌 ", "");
      if (typeof content === "string" && content.includes("**")) {
        const parts = content.split("**");
        content = parts.map((part, index) =>
          index % 2 === 1 ? <strong key={index} className="font-extrabold text-accent-red">{part}</strong> : part
        );
      }
      return (
        <div key={i} className="p-6 bg-highlight-yellow/45 border-l-4 border-highlight-yellow rounded-r-3xl my-5 text-sm leading-relaxed text-primary-brown/95 shadow-sm">
          <div className="flex gap-3">
            <span className="text-base select-none">📌</span>
            <div>{content}</div>
          </div>
        </div>
      );
    }

    let content: React.ReactNode = cleanLine;
    if (cleanLine.includes("**")) {
      const parts = cleanLine.split("**");
      content = parts.map((part, index) =>
        index % 2 === 1 ? <strong key={index} className="font-extrabold text-accent-red">{part}</strong> : part
      );
    }
    return (
      <p key={i} className="text-primary-brown/85 leading-relaxed mb-3">
        {content}
      </p>
    );
  });
}

export const revalidate = 0; // Luôn đảm bảo render động mới nhất từ DB

export default async function PublicRefundPolicyPage() {
  // Lấy dữ liệu chính sách mới nhất từ Database ở phía Server
  const res = await getSettingAction(SETTING_KEY, DEFAULT_POLICY);
  const policyText = res.value;

  return (
    <div className="min-h-screen bg-background text-primary-brown font-body py-12 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center">
      {/* Các hình trang trí mờ ảo aesthetic làm nền */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-secondary-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-highlight-yellow/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary-pink/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full flex flex-col gap-6 relative z-10">
        {/* Nút quay lại trang chủ */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 hover:bg-white border border-primary-brown/10 rounded-full font-bold text-xs shadow-sm hover:shadow-md transition-all hover:-translate-x-0.5 duration-300"
          >
            <ArrowLeft size={14} className="text-accent-red" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        {/* Khung nội dung Glassmorphism cao cấp */}
        <div className="bg-white/40 backdrop-blur-md border border-primary-brown/10 rounded-[3rem] p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-pink/20 rounded-full blur-2xl pointer-events-none" />
          
          {/* Header trong trang */}
          <div className="flex flex-col items-center text-center border-b border-primary-brown/10 pb-6 mb-6">
            <div className="p-4 bg-secondary-pink rounded-3xl shadow-sm text-accent-red mb-3">
              <FileText size={32} />
            </div>
            <h1 className="text-3xl font-heading tracking-wide text-accent-red mb-2">
              Chính sách hoàn tiền
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-primary-brown/5 rounded-full text-[10px] font-bold tracking-widest text-primary-brown/60 uppercase">
              <Sparkles size={10} className="text-accent-red animate-pulse" />
              Chu Cha Casa Cam Kết Hỗ Trợ
            </div>
          </div>

          {/* Render Nội dung chính sách đã được parse */}
          <div className="max-w-none">
            {policyText ? (
              <div className="space-y-1">
                {parseMarkdown(policyText)}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-primary-brown/40 gap-2">
                <FileText size={40} className="stroke-[1.5]" />
                <p className="text-sm font-semibold">Chính sách đang được cập nhật...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer nhỏ dễ thương */}
        <div className="text-center text-[10px] font-bold tracking-widest text-primary-brown/40 uppercase mt-4">
          © {new Date().getFullYear()} chucha.casa • crafted with care 🧸
        </div>
      </div>
    </div>
  );
}
