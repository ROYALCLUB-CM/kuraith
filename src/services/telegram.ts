/**
 * KURAITH Telegram Notification Service
 *
 * Setup:
 *   1. Create bot via @BotFather on Telegram
 *   2. Get bot token
 *   3. Send any message to your bot, then get chat_id from:
 *      https://api.telegram.org/bot<TOKEN>/getUpdates
 *   4. Set env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export function isTelegramEnabled(): boolean {
  return !!(BOT_TOKEN && CHAT_ID);
}

async function sendMessage(text: string, parseMode: string = "HTML"): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) return false;

  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: parseMode,
      }),
    });

    if (!res.ok) {
      console.error(`Telegram API error: ${res.status}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Telegram send error:", err);
    return false;
  }
}

// ─── Notification Types ───

export async function notifyHandoff(agent: string, nextSteps: string[], warnings: string[]) {
  const steps = nextSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n");
  const warns = warnings.length > 0
    ? `\n⚠️ <b>Warnings:</b>\n${warnings.map((w) => `  • ${w}`).join("\n")}`
    : "";

  await sendMessage(
    `📤 <b>KURAITH Handoff</b>\n\n` +
    `Agent: <code>${agent}</code>\n\n` +
    `📋 <b>Next Steps:</b>\n${steps}${warns}`
  );
}

export async function notifyWorkflowCreated(name: string, taskCount: number) {
  await sendMessage(
    `🔧 <b>Workflow Created</b>\n\n` +
    `Name: <b>${name}</b>\n` +
    `Tasks: ${taskCount}`
  );
}

export async function notifyTaskCompleted(workflowName: string, taskTitle: string, agent: string) {
  await sendMessage(
    `✅ <b>Task Completed</b>\n\n` +
    `Workflow: ${workflowName}\n` +
    `Task: <b>${taskTitle}</b>\n` +
    `Agent: <code>${agent}</code>`
  );
}

export async function notifyWorkflowCompleted(name: string) {
  await sendMessage(
    `🎉 <b>Workflow Completed!</b>\n\n` +
    `<b>${name}</b> — all tasks done`
  );
}

export async function notifyWorkflowFailed(name: string, taskTitle: string, agent: string) {
  await sendMessage(
    `❌ <b>Task Failed</b>\n\n` +
    `Workflow: ${name}\n` +
    `Task: <b>${taskTitle}</b>\n` +
    `Agent: <code>${agent}</code>`
  );
}

export async function notifyLearn(title: string, type: string, stage: string) {
  await sendMessage(
    `📝 <b>New Learning</b>\n\n` +
    `<b>${title}</b>\n` +
    `Type: ${type} | Stage: ${stage}`
  );
}

export async function notifyCustom(message: string) {
  await sendMessage(`📡 <b>KURAITH</b>\n\n${message}`);
}
