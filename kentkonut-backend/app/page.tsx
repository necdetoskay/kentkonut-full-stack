"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("Root page loaded, session status:", status);
    console.log("Session data:", session);

    if (status === "loading") {
      console.log("Session still loading...");
      return;
    }

    if (session?.user) {
      console.log("User authenticated, redirecting to dashboard");
      router.push("/dashboard");
    } else {
      console.log("User not authenticated, redirecting to login");
      router.push("/auth/login");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Yönlendiriliyor...</h2>
        <p className="text-gray-600">
          {status === "loading" ? "Oturum kontrol ediliyor..." :
           session?.user ? "Dashboard'a yönlendiriliyor..." : "Giriş sayfasına yönlendiriliyor..."}
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Status: {status}</p>
          <p>User: {session?.user ? "Authenticated" : "Not authenticated"}</p>
        </div>
      </div>
    </div>
  );
}