const NOTIFY_URL = "https://functions.poehali.dev/8e721ad6-a4c1-4cba-b0d8-899018eb18ca";

export async function notifyAdmin(params: {
  type: "deposit" | "withdraw";
  login: string;
  amount: number;
  details: string;
  txId: string;
}) {
  try {
    await fetch(NOTIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    // silent — уведомление не блокирует работу сайта
  }
}
