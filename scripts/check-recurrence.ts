import { occursOn } from "../lib/recurrence";
import type { Task } from "../lib/types";
const mk = (start: string, recurrence: Task["recurrence"], until: string | null = null) =>
  ({ start_date: start, recurrence, until_date: until } as Task);
let f = 0; const ok = (c: boolean, m: string) => { console.log(c ? "✓" : "✗", m); if (!c) f++; };
ok(occursOn(mk("2026-11-08", "none"), "2026-11-08") && !occursOn(mk("2026-11-08", "none"), "2026-11-09"), "مرة واحدة");
ok(occursOn(mk("2026-11-08", "weekly"), "2026-11-22") && !occursOn(mk("2026-11-08", "weekly"), "2026-11-20"), "أسبوعي");
ok(occursOn(mk("2026-11-08", "biweekly"), "2026-11-22") && !occursOn(mk("2026-11-08", "biweekly"), "2026-11-15"), "كل أسبوعين");
ok(occursOn(mk("2026-01-31", "monthly"), "2026-02-28") && occursOn(mk("2026-01-31", "monthly"), "2026-03-31"), "شهري (31 → آخر الشهر)");
ok(occursOn(mk("2024-02-29", "yearly"), "2027-02-28") && occursOn(mk("2024-02-29", "yearly"), "2028-02-29"), "سنوي (29 فبراير)");
ok(!occursOn(mk("2026-11-08", "daily", "2026-11-10"), "2026-11-11") && !occursOn(mk("2026-11-08", "daily"), "2026-11-07"), "حدود البداية والنهاية");
process.exit(f ? 1 : 0);
