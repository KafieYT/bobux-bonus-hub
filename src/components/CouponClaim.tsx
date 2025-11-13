import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, CheckCircle, XCircle, Loader2 } from "lucide-react";

const CouponClaim = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsSuccess(null);

    try {
      const res = await fetch("/api/coupons/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setIsSuccess(true);
        setMessage(
          data.message ||
            `🎉 Bravo ! Vous avez gagné ${data.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts !`
        );
        setCode("");
      } else {
        setIsSuccess(false);
        setMessage(data.error || "Erreur inconnue");
      }
    } catch (error) {
      setLoading(false);
      setIsSuccess(false);
      setMessage("Erreur de connexion");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="coupon" className="block text-sm font-medium text-muted-foreground mb-2">
            Code coupon
          </label>
          <div className="relative">
            <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="coupon"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-3"
              placeholder="Ex: JUNIKEITCODE"
              required
              disabled={loading}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Vérification...</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              Valider le code
            </>
          )}
        </Button>
      </form>
      {message && (
        <div
          className={`p-4 flex items-start gap-3 rounded-lg ${
            isSuccess
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
        </div>
      )}
    </div>
  );
};

export default CouponClaim;

