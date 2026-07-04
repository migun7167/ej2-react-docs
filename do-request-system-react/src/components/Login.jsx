import React, { useState } from "react";
import { Plane, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Card } from "./ui/card.jsx";

const DEMO_ACCOUNTS = [
  { label: "TMO – สมชาย", sub: "คลังสินค้า / ผู้อนุมัติ", username: "tmo.somchai", password: "aot2026" },
  { label: "Forwarder – Kerry", sub: "kerry.agent", username: "kerry.agent", password: "kerry2026" },
  { label: "Forwarder – DHL", sub: "dhl.agent", username: "dhl.agent", password: "dhl2026" },
  { label: "Forwarder – ABC", sub: "abc.agent", username: "abc.agent", password: "abc2026" },
  { label: "Shipping – สมศรี", sub: "shipping.somsri", username: "shipping.somsri", password: "ship2026" },
  { label: "Customs – พิชัย", sub: "customs.pichai", username: "customs.pichai", password: "cus2026" },
  { label: "AOT – Oversight", sub: "aot.admin", username: "aot.admin", password: "aot2026" },
];

const HERO_POINTS = [
  "Freight กรอกเฉพาะ MAWB / HAWB – ระบบดึง Consignee อัตโนมัติ",
  "ตรวจสิทธิ์จาก Tax ID / Company ID / Delegation",
  "คลังสินค้า (TMO) Scan และแนบเอกสารก่อน Approve",
  "DO ออกตามแบบมาตรฐาน Air Cargo Delivery Order",
];

export default function Login() {
  const { login, showToast } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function doLogin(u, p) {
    const res = login(u, p);
    if (!res.ok) setError(res.error);
  }

  function handleSubmit(e) {
    e.preventDefault();
    doLogin(username, password);
  }

  function quickLogin(acc) {
    setError("");
    doLogin(acc.username, acc.password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_15%_15%,hsl(var(--gold)/.18),transparent_40%),radial-gradient(circle_at_85%_85%,hsl(var(--primary)/.35),transparent_45%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.75))] p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl md:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-between gap-6 bg-gradient-to-br from-primary via-primary to-primary/80 p-8 text-primary-foreground">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-gold-foreground shadow ring-2 ring-white/20">
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Airports of Thailand PCL</div>
                <div className="text-[11px] text-primary-foreground/75">AOT Cargo Community System</div>
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-bold leading-snug">
              Request / Assign Delivery Order
              <br />
              แบบกรอกน้อยที่สุด แต่ยืนยันตัวตนได้จริง
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
              Freight / Forwarder กรอกเพียง MAWB/HAWB ระบบดึง Consignee และสถานะจาก Shipment จริง
              ก่อนเข้าสู่การอนุมัติ DO จะต้องผ่านการสแกนเอกสารโดยคลังสินค้า (TMO)
            </p>
          </div>
          <div className="space-y-2.5">
            {HERO_POINTS.map((p) => (
              <div key={p} className="flex items-start gap-2 text-[12.5px] text-primary-foreground/90">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-gold" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-none border-0 p-7 shadow-none">
          <h2 className="text-lg font-bold">เข้าสู่ระบบ</h2>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">เลือกบัญชีทดลองด้านล่าง หรือกรอกเอง</p>

          {error && (
            <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
            </div>
            <Button type="submit" className="w-full">
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="my-4 h-px bg-border" />

          <p className="mb-2 text-xs text-muted-foreground">บัญชีทดลอง (คลิกเพื่อเข้าสู่ระบบทันที)</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                onClick={() => quickLogin(acc)}
                className="rounded-md border border-dashed px-2.5 py-2 text-left text-[11.5px] transition-colors hover:border-primary hover:bg-accent"
              >
                <div className="text-xs font-semibold">{acc.label}</div>
                <div className="text-muted-foreground">{acc.sub}</div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-[10.5px] text-muted-foreground">
            Prototype สำหรับออกแบบระบบเท่านั้น ข้อมูลทั้งหมดเป็น Mock Data
          </p>
        </Card>
      </div>
    </div>
  );
}
