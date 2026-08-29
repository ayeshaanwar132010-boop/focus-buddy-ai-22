import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed", { description: result.error.message });
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Google sign-in failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full" onClick={onClick} disabled={loading}>
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.6-4H3.1v2.6A10 10 0 0 0 12 22Z"
        />
        <path fill="#FBBC05" d="M6.4 14.1a6 6 0 0 1 0-3.8V7.7H3.1a10 10 0 0 0 0 8.9l3.3-2.5Z" />
        <path
          fill="#EA4335"
          d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.7l3.3 2.6A5.9 5.9 0 0 1 12 6.1Z"
        />
      </svg>
      {loading ? "Connecting…" : label}
    </Button>
  );
}
