import { SseEvent, SseResponseEvent } from "../../type";

export function sseEvent(event: SseEvent): string {
  let types: string[] = ["warn", "info", "error", "result"];

  if (!types.includes(event.type)) {
    event.type = "info";
  }

  let obj: SseResponseEvent = {
    ...event,
    date: new Date().toISOString(),
  };

  return JSON.stringify(obj) + "\n\n";
}
