import os
import json
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    """Отправляет уведомление администратору в Telegram о новой заявке на пополнение или вывод."""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": ""
        }

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "bad json"})}

    tx_type = body.get("type", "")
    login = body.get("login", "—")
    amount = body.get("amount", 0)
    details = body.get("details", "—")
    tx_id = body.get("txId", "—")

    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_ADMIN_CHAT_ID", "")

    if not bot_token or not chat_id:
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"ok": False, "reason": "no secrets"})}

    if tx_type == "deposit":
        icon = "💰"
        action = "ПОПОЛНЕНИЕ"
        color = "🟡"
    else:
        icon = "🏦"
        action = "ВЫВОД"
        color = "🔴"

    text = (
        f"{color} <b>Новая заявка: {action}</b>\n\n"
        f"{icon} <b>Сумма:</b> {amount} ₽\n"
        f"👤 <b>Игрок:</b> {login}\n"
        f"📋 <b>Детали:</b> {details}\n"
        f"🆔 <b>ID заявки:</b> <code>{tx_id}</code>\n\n"
        f"➡️ Перейди в <b>ADMIN панель</b> на сайте для подтверждения."
    )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            ok = result.get("ok", False)
    except Exception as e:
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"ok": False, "error": str(e)})}

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": ok})
    }
