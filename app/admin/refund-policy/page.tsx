"use client";

import { useState, useEffect, useTransition } from "react";
import { Save, Sparkles, Loader2, FileText, Check, AlertCircle } from "lucide-react";
import { getSettingAction, updateSettingAction } from "@/app/actions/admin";

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
 * Bộ phân giải Markdown gọn nhẹ, thiết kế riêng cho aesthetic của Chu Cha Casa
 */
function parseMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const cleanLine = line.trim();

    // Dòng trống
    if (cleanLine === "") {
      return <div key={i} className="h-2"></div>;
    }

    // Tiêu đề chính (# )
    if (cleanLine.startsWith("# ")) {
      return (
        <h1 key={i} className="text-3xl font-heading text-accent-red mt-6 mb-4 tracking-wide animate-fade-in">
          {cleanLine.replace("# ", "")}
        </h1>
      );
    }

    // Tiêu đề phụ (### )
    if (cleanLine.startsWith("### ")) {
      return (
        <h3 key={i} className="text-lg font-bold text-primary-brown mt-5 mb-2.5 flex items-center gap-2 border-b border-primary-brown/5 pb-1">
          <span className="w-1.5 h-4 bg-accent-red rounded-full block shadow-sm"></span>
          {cleanLine.replace("### ", "")}
        </h3>
      );
    }

    // Các thẻ badge liên lạc (Instagram, Zalo, Email)
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
        badgeStyle = "bg-pink-100/80 hover:bg-pink-200/80 text-pink-700 border-pink-200/60";
        icon = "📸";
        href = "https://instagram.com/chuchacasa";
        textToShow = "Instagram: @chuchacasa";
      } else if (cleanLine.includes("Email")) {
        badgeStyle = "bg-blue-100/80 hover:bg-blue-200/80 text-blue-700 border-blue-200/60";
        icon = "📧";
        href = "mailto:chucha.casa.vn@gmail.com";
        textToShow = "Email: chucha.casa.vn@gmail.com";
      } else if (cleanLine.includes("Zalo")) {
        badgeStyle = "bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-700 border-emerald-200/60";
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

    // Gạch đầu dòng (- )
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

    // Hộp cảnh báo lưu ý bắt đầu bằng 📌
    if (cleanLine.startsWith("📌 ")) {
      let content: React.ReactNode = cleanLine.replace("📌 ", "");
      if (typeof content === "string" && content.includes("**")) {
        const parts = content.split("**");
        content = parts.map((part, index) =>
          index % 2 === 1 ? <strong key={index} className="font-extrabold text-accent-red">{part}</strong> : part
        );
      }
      return (
        <div key={i} className="p-5 bg-highlight-yellow/40 border-l-4 border-highlight-yellow rounded-r-3xl my-4 text-sm leading-relaxed text-primary-brown/95 shadow-sm">
          <div className="flex gap-2.5">
            <span className="text-base select-none">📌</span>
            <div>{content}</div>
          </div>
        </div>
      );
    }

    // Dòng chữ bình thường, có thể chứa chữ in đậm **...**
    let content: React.ReactNode = cleanLine;
    if (cleanLine.includes("**")) {
      const parts = cleanLine.split("**");
      content = parts.map((part, index) =>
        index % 2 === 1 ? <strong key={index} className="font-extrabold text-accent-red">{part}</strong> : part
      );
    }
    return (
      <p key={i} className="text-primary-brown/85 leading-relaxed mb-2.5">
        {content}
      </p>
    );
  });
}

export default function AdminRefundPolicyPage() {
  const [policyText, setPolicyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Load nội dung chính sách hiện tại từ Database khi render
  useEffect(() => {
    async function loadPolicy() {
      setIsLoading(true);
      const res = await getSettingAction(SETTING_KEY, DEFAULT_POLICY);
      setPolicyText(res.value);
      setIsLoading(false);
    }
    loadPolicy();
  }, []);

  // Xử lý lưu nội dung
  const handleSave = () => {
    setSaveError("");
    setSaveSuccess(false);
    startTransition(async () => {
      const res = await updateSettingAction(SETTING_KEY, policyText);
      if (res.error) {
        setSaveError(res.error);
      } else {
        setSaveSuccess(true);
        // Tự động tắt trạng thái thành công sau 3 giây
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/40 backdrop-blur-md border border-primary-brown/10 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary-pink rounded-2xl shadow-sm text-accent-red">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-heading tracking-wide text-accent-red leading-none mb-1">
              Chính sách hoàn tiền
            </h1>
            <p className="text-xs text-primary-brown/60">
              Điều chỉnh nội dung trang Chính sách hoàn tiền hiển thị cho khách hàng
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading || isPending}
          className="px-6 py-3.5 bg-accent-red hover:bg-accent-red/90 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveSuccess ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          <span>{isPending ? "Đang lưu..." : saveSuccess ? "Đã lưu!" : "Lưu thay đổi"}</span>
        </button>
      </div>

      {/* Thông báo trạng thái */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check size={16} className="text-emerald-600" />
          <span>Lưu chính sách hoàn tiền thành công! Trang công khai của bạn đã được cập nhật.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={16} className="text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-96 bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-primary-brown/10 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-accent-red" size={32} />
          <p className="text-sm font-bold text-primary-brown/60">Đang tải dữ liệu chính sách từ Supabase...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trình soạn thảo (Left Column) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-extrabold tracking-widest text-primary-brown/50 uppercase">
                Trình soạn thảo Markdown
              </span>
              <span className="text-xs font-bold text-primary-brown/40">
                {policyText.length} ký tự
              </span>
            </div>

            <div className="flex-1 bg-white/60 backdrop-blur-md border border-primary-brown/10 rounded-[2.5rem] p-6 shadow-inner flex flex-col min-h-[500px]">
              <textarea
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder="Nhập nội dung chính sách tại đây..."
                className="w-full flex-1 min-h-[450px] bg-transparent outline-none border-none resize-none font-mono text-sm leading-relaxed text-primary-brown focus:ring-0"
              />
              
              <div className="mt-4 pt-4 border-t border-primary-brown/10 flex items-center justify-between text-xs text-primary-brown/50">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-accent-red" />
                  Bạn có thể dùng cú pháp Markdown cơ bản như:
                </span>
                <div className="flex gap-3 font-semibold">
                  <code># Tiêu đề 1</code>
                  <code>### Mục con</code>
                  <code>**In đậm**</code>
                  <code>- Danh sách</code>
                </div>
              </div>
            </div>
          </div>

          {/* Bản xem trước trực quan (Right Column) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-extrabold tracking-widest text-primary-brown/50 uppercase flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent-red animate-pulse" />
                Live Preview (Khách hàng sẽ nhìn thấy)
              </span>
            </div>

            <div className="bg-white/40 backdrop-blur-md border border-primary-brown/10 rounded-[2.5rem] p-8 shadow-sm flex flex-col min-h-[500px] relative overflow-hidden">
              {/* Trang trí nền cute */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary-pink/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-highlight-yellow/10 rounded-full blur-3xl pointer-events-none" />

              {/* Khung nội dung Preview */}
              <div className="relative flex-1 max-w-none overflow-y-auto pr-1">
                {policyText ? (
                  <div className="space-y-1">
                    {parseMarkdown(policyText)}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-primary-brown/40 gap-2">
                    <FileText size={40} className="stroke-[1.5]" />
                    <p className="text-sm font-semibold">Bản xem trước trống. Hãy viết gì đó!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
