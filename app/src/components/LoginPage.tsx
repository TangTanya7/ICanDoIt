"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE } from "@/lib/api-base";

export default function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    setError("");
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入正确的11位手机号");
      return;
    }

    const res = await fetch(`${API_BASE}/api/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (res.ok) {
      setStep("code");
      setCountdown(60);
    } else {
      const data = await res.json();
      setError(data.error || "发送失败");
    }
  }, [phone]);

  const handleVerify = useCallback(async () => {
    setError("");
    if (code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }

    setLoading(true);
    const result = await login(phone, code);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "验证失败");
    }
  }, [phone, code, login]);

  const isPhoneValid = /^1\d{10}$/.test(phone);

  return (
    <div className="mobile-container flex flex-col relative overflow-hidden bg-[#FBFBFB]">
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="mb-12 text-center">
          <div className="text-[48px] mb-3">⭐</div>
          <h1 className="text-[24px] font-extrabold text-[#222]">ICanDoIt</h1>
          <p className="text-[14px] text-black/50 mt-1.5">让坚持自然发生</p>
        </div>

        <div className="bg-white rounded-[24px] p-6">
          {step === "phone" ? (
            <>
              <p className="text-[13px] font-bold text-[#222] mb-3">手机号登录</p>
              <div className="flex items-center gap-2 border border-black/10 rounded-[16px] px-4 h-[52px] focus-within:border-black/30 transition-colors">
                <span className="text-[14px] text-black/40 font-medium">+86</span>
                <div className="w-px h-5 bg-black/10" />
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="输入手机号"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
                    setError("");
                  }}
                  className="flex-1 text-[15px] outline-none bg-transparent placeholder:text-black/25"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={!isPhoneValid}
                className={`w-full h-[52px] rounded-[16px] mt-4 font-bold text-[15px] transition-all ${
                  isPhoneValid
                    ? "bg-[#222] text-white active:scale-[0.98]"
                    : "bg-[#E8E8E8] text-black/25"
                }`}
              >
                获取验证码
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                  className="text-[13px] text-black/40"
                >
                  ←
                </button>
                <p className="text-[13px] font-bold text-[#222]">
                  输入验证码
                </p>
              </div>
              <p className="text-[12px] text-black/40 mb-3">
                已发送至 {phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
              </p>
              <div className="flex items-center gap-2 border border-black/10 rounded-[16px] px-4 h-[52px] focus-within:border-black/30 transition-colors">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6位验证码"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  className="flex-1 text-[15px] outline-none bg-transparent placeholder:text-black/25 tracking-[8px] text-center font-bold"
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={code.length !== 6 || loading}
                className={`w-full h-[52px] rounded-[16px] mt-4 font-bold text-[15px] transition-all ${
                  code.length === 6 && !loading
                    ? "bg-[#222] text-white active:scale-[0.98]"
                    : "bg-[#E8E8E8] text-black/25"
                }`}
              >
                {loading ? "登录中..." : "登录"}
              </button>
              <button
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="w-full text-center text-[12px] text-black/40 mt-3"
              >
                {countdown > 0 ? `${countdown}s 后重新发送` : "重新发送验证码"}
              </button>
            </>
          )}

          {error && (
            <p className="text-[12px] text-red-500 text-center mt-3">{error}</p>
          )}
        </div>

        <p className="text-[11px] text-black/25 text-center mt-6">
          演示模式：验证码固定为 123456
        </p>
      </div>
    </div>
  );
}
