import "server-only";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

/**
 * Gửi email thông báo đơn hàng mới + ghi đơn vào Google Sheet.
 *
 * Cả hai đều là "best-effort": nếu chưa cấu hình biến môi trường, hoặc gọi lỗi,
 * thì chỉ ghi log cảnh báo chứ KHÔNG làm hỏng luồng đặt hàng.
 *
 * Biến môi trường cần cấu hình (xem .env.example):
 *  - Email (Gmail SMTP):  GMAIL_USER, GMAIL_APP_PASSWORD, ORDER_NOTIFY_EMAIL
 *  - Google Sheet:        GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL,
 *                         GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, (tuỳ chọn) GOOGLE_SHEETS_RANGE
 */

export interface OrderNotificationItem {
  name: string;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
}

export interface OrderNotificationPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  shippingCity?: string | null;
  shippingDistrict?: string | null;
  shippingWard?: string | null;
  shippingNotes?: string | null;
  paymentMethod: string;
  packaging: string;
  shippingMethod: string;
  paymentProof?: string | null;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  items: OrderNotificationItem[];
  createdAt: Date;
}

const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

const paymentLabel = (m: string) =>
  m === "TRANSFER_FULL"
    ? "Chuyển khoản toàn bộ"
    : m === "TRANSFER_PARTIAL"
    ? "Cọc 50k (cũ)"
    : "Thanh toán khi nhận hàng (COD)";

const packagingLabel = (p: string) =>
  p === "GIFT" ? "Hộp quà + thắt nơ (mua tặng)" : "Gói thường";

const fullAddress = (o: OrderNotificationPayload) =>
  [o.shippingAddress, o.shippingWard, o.shippingDistrict, o.shippingCity]
    .filter(Boolean)
    .join(", ");

const itemsText = (o: OrderNotificationPayload) =>
  o.items
    .map((it) => {
      const variant = [it.color, it.size].filter(Boolean).join(" / ");
      return `• ${it.name}${variant ? ` (${variant})` : ""} x${it.quantity} — ${vnd(
        it.price * it.quantity
      )}`;
    })
    .join("\n");

/** Ghi 1 dòng đơn hàng vào Google Sheet qua Sheets REST API + service account. */
async function appendOrderToSheet(order: OrderNotificationPayload): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Private key trong .env thường có \n dạng literal, cần đổi về xuống dòng thật.
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.warn(
      "[order-notifications] Bỏ qua ghi Google Sheet: thiếu GOOGLE_SHEETS_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
    return;
  }

  const range = process.env.GOOGLE_SHEETS_RANGE || "A:M";

  const row = [
    new Date(order.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
    order.orderNumber,
    order.customerName,
    order.customerPhone,
    order.customerEmail || "",
    fullAddress(order),
    order.items
      .map((it) => {
        const variant = [it.color, it.size].filter(Boolean).join("/");
        return `${it.name}${variant ? ` (${variant})` : ""} x${it.quantity}`;
      })
      .join("\n"),
    order.subtotal,
    order.shippingFee,
    order.totalAmount,
    paymentLabel(order.paymentMethod),
    packagingLabel(order.packaging),
    order.shippingNotes || "",
  ];

  const client = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  await client.request({
    url,
    method: "POST",
    data: { values: [row] },
  });
}

/** Gửi email thông báo đơn hàng mới tới hộp thư cửa hàng qua Gmail SMTP. */
async function sendOrderEmail(order: OrderNotificationPayload): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.ORDER_NOTIFY_EMAIL || user;

  if (!user || !pass || !to) {
    console.warn(
      "[order-notifications] Bỏ qua gửi email: thiếu GMAIL_USER / GMAIL_APP_PASSWORD / ORDER_NOTIFY_EMAIL."
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const itemsRows = order.items
    .map((it) => {
      const variant = [it.color, it.size].filter(Boolean).join(" / ");
      return `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${it.name}${
        variant ? `<br/><span style="color:#888;font-size:12px">${variant}</span>` : ""
      }</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${it.quantity}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${vnd(
          it.price * it.quantity
        )}</td>
      </tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#3a2a20;max-width:600px;margin:auto">
    <h2 style="color:#c0392b">🛍️ Đơn hàng mới ${order.orderNumber}</h2>
    <p><strong>Khách hàng:</strong> ${order.customerName}<br/>
       <strong>SĐT:</strong> ${order.customerPhone}<br/>
       ${order.customerEmail ? `<strong>Email:</strong> ${order.customerEmail}<br/>` : ""}
       <strong>Địa chỉ:</strong> ${fullAddress(order)}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <thead>
        <tr style="background:#faf0ec">
          <th style="padding:6px 10px;text-align:left">Sản phẩm</th>
          <th style="padding:6px 10px">SL</th>
          <th style="padding:6px 10px;text-align:right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p style="margin-top:16px">
      <strong>Tạm tính:</strong> ${vnd(order.subtotal)}<br/>
      <strong>Phí ship:</strong> ${vnd(order.shippingFee)}<br/>
      <strong style="font-size:16px;color:#c0392b">Tổng cộng: ${vnd(order.totalAmount)}</strong>
    </p>
    <p>
      <strong>Thanh toán:</strong> ${paymentLabel(order.paymentMethod)}<br/>
      <strong>Gói hàng:</strong> ${packagingLabel(order.packaging)}<br/>
      ${order.shippingNotes ? `<strong>Ghi chú:</strong> ${order.shippingNotes}<br/>` : ""}
    </p>
    ${
      order.paymentProof
        ? `<p><strong>Ảnh chuyển khoản:</strong><br/><a href="${order.paymentProof}">${order.paymentProof}</a></p>`
        : ""
    }
  </div>`;

  await transporter.sendMail({
    from: `"chucha.casa" <${user}>`,
    to,
    replyTo: order.customerEmail || undefined,
    subject: `🛍️ Đơn mới ${order.orderNumber} — ${vnd(order.totalAmount)} (${paymentLabel(
      order.paymentMethod
    )})`,
    text: `Đơn hàng mới ${order.orderNumber}\n\nKhách: ${order.customerName} - ${order.customerPhone}\nĐịa chỉ: ${fullAddress(
      order
    )}\n\n${itemsText(order)}\n\nTổng: ${vnd(order.totalAmount)} | ${paymentLabel(
      order.paymentMethod
    )} | ${packagingLabel(order.packaging)}`,
    html,
  });
}

/**
 * Chạy song song việc gửi email + ghi Sheet. Mỗi việc tự bọc try/catch để
 * lỗi của việc này không ảnh hưởng việc kia, và không bao giờ throw ra ngoài.
 */
export async function notifyNewOrder(order: OrderNotificationPayload): Promise<void> {
  await Promise.allSettled([
    sendOrderEmail(order).catch((e) =>
      console.error("[order-notifications] Lỗi gửi email:", e?.message || e)
    ),
    appendOrderToSheet(order).catch((e) =>
      console.error("[order-notifications] Lỗi ghi Google Sheet:", e?.message || e)
    ),
  ]);
}
