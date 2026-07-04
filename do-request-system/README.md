# AOT Cargo Community — DO Request & Assign (Prototype)

Interactive, self-contained prototype for the flow described in
`minimal_do_request_assign_with_warehouse_scan.md`: Freight Forwarders submit
a DO request with only MAWB/HAWB, the system pulls shipment data and checks
entitlement automatically, TMO (warehouse) scans/attaches documents, then
approves and assigns the DO — issued on a TG-style standard air cargo
Delivery Order with a watermark and an APPROVED stamp.

## Run it

Just open `index.html` in a browser (no build step, no server required).
Everything (auth, shipments, documents, audit log) is mock data kept in
`localStorage` — use "รีเซ็ตข้อมูลตัวอย่าง" in the TMO sidebar to reset it.

## Demo accounts (OTP for all: `123456`)

| Role | Username | Password |
|---|---|---|
| TMO (warehouse/approver) | `tmo.somchai` | `aot2026` |
| Freight Forwarder — Kerry | `kerry.agent` | `kerry2026` |
| Freight Forwarder — DHL | `dhl.agent` | `dhl2026` |
| Freight Forwarder — ABC | `abc.agent` | `abc2026` |

## Try these MAWB/HAWB combos (as a Forwarder, on "+ ขอ DO ใหม่")

| MAWB | HAWB | Try with | Expected result |
|---|---|---|---|
| 217-12345678 | – | Kerry | PASS_MASTER, straight to document scan |
| 217-88990011 | THB-556677 | DHL | PASS_HOUSE |
| 217-45671234 | – | Kerry | PASS_DELEGATED |
| 217-99887766 | – | ABC | PASS_DELEGATED, but Customs HELD → Pending Status |
| 217-77778888 | – | any | Ambiguous (2 shipments share this MAWB) → Manual Review |
| 217-77778888 | THB-100200 | Kerry | PASS_HOUSE |
| 217-12345678 | – | ABC/DHL | FAIL (no entitlement) → auto-rejected |
| 217-00000000 | – | any | Not found → auto-rejected |

After a Forwarder submits, log in as a TMO account to scan/attach the
required documents and approve — that generates the DO document (open it
from the request's timeline once status is `DO_ASSIGNED`).

## Dashboards

Both the Forwarder and TMO dashboards ship with realistic seeded history
(a handful of past requests at various ages) so charts and KPIs aren't
empty on first login:

- **Status-distribution chart** — bar chart of requests by bucket (in
  progress / manual review / assigned / rejected), scoped to "my requests"
  for Forwarders and system-wide for TMO.
- **Aging / SLA badges** — active requests are flagged "รอมา Xชม." (≥4h) or
  "ล่าช้า" (≥24h) so TMO can prioritize the oldest items first.
- **Turnaround KPIs** — average hours from submit to `DO_ASSIGNED` (per
  forwarder, and system-wide for TMO), plus "Assign DO วันนี้" (approved
  today) on the TMO side.
- **Recent activity feed** — last 6 audit events, scoped to the current
  user for Forwarders and system-wide for TMO.
- **Search & filter** — Forwarders can filter their own requests by
  MAWB/HAWB and status bucket; TMO can filter every queue by MAWB/HAWB/
  forwarder company.

This is a UI/UX design prototype only — it is not connected to any real
airline, customs, or AOT system, and the Delivery Order it renders is a
mockup (clearly watermarked as such).
