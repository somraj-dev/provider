'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    // Handle auth flow
    console.log('Logging in with:', { email, password });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-white">
      {/* Left side: Accent pane with logo and illustration */}
      <div className="flex flex-col flex-1 bg-[#d0f4f0] p-8 justify-between min-h-[350px] md:min-h-screen">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="AxioVital Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-semibold text-xl text-[#0d7a86] tracking-tight">AxioVital</span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 my-8">
          <div className="relative w-full max-w-[320px] aspect-square md:max-w-[400px]">
            <Image
              src="/illustration.png"
              alt="Healthcare workspace illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex flex-col flex-1 justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Workspace app required
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your administrator requires you to use the locally installed AxioVital Workspace app
              for secure authentication and local healthcare system access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Workspace Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@provider.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#0d7a86] focus:ring-[#0d7a86] rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Security Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#0d7a86] focus:ring-[#0d7a86] rounded-md"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#0d7a86] hover:bg-[#085f68] text-white font-medium py-2.5 px-4 rounded-md transition-colors shadow-sm"
            >
              Open AxioVital Workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
