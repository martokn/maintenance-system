import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";

import AuthLayout from "@/components/AuthLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LogIn, Mail, Lock, Loader2, Building2 } from "lucide-react";

const DESTINATIONS = [
  { id: "inspection", label: "Inspection Department", role: "inspector", path: "/inspection" },
  { id: "approver", label: "Department Approver", role: "approver", path: "/approver" },
  { id: "workshop", label: "Maintenance Workshop", role: "mechanic", path: "/workshop" },
  { id: "stores", label: "Inventory / Stores", role: "stores", path: "/stores" },
];

function getSavedDestination(email) {
  if (!email) return "";
  try {
    return localStorage.getItem("login_dest_" + email) || "";
  } catch { return ""; }
}

function saveDestination(email, dest) {
  try { localStorage.setItem("login_dest_" + email, dest); } catch {}
}

export default function Login() {
  const { login: setAuthUser, isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = getSavedDestination(email);
    if (saved) setDestination(saved);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination) { setError("Please select your department"); return; }
    setError("");
    setLoading(true);

    try {
      const result = await api.auth.login(email, password);
      const user = result.user;

      const dest = DESTINATIONS.find((d) => d.id === destination);
      if (user.role !== "admin" && user.role !== dest?.role) {
        throw new Error("This account does not have access to " + dest?.label);
      }

      api.setToken(result.token);
      api.setUser(user);
      setAuthUser(user);
      saveDestination(email, destination);
      window.location.href = dest.path;
    } catch (err) {
      api.clearAuth();
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>

            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">I'm here to work in</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Select value={destination} onValueChange={setDestination} required>
              <SelectTrigger className="pl-10 h-12 w-full">
                <SelectValue placeholder="Select your department..." />
              </SelectTrigger>
              <SelectContent>
                {DESTINATIONS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}