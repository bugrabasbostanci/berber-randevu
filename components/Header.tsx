"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FeedbackButton from "./feedback/FeedbackButton";
import FeedbackForm from "./feedback/FeedbackForm";
import { useState } from "react";
import { Menu, MessageSquare, User, LogOut, LogIn } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { data: session } = useSession();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  
  return (
    <header className="bg-background border-b sticky top-0 z-10 shadow-sm">
      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold tracking-tight">The Barber Shop</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-auto">
              <FeedbackButton />
            </div>
            {session ? (
              <Button
                variant="destructive"
                onClick={() => signOut()}
                size="sm"
              >
                Çıkış Yap
              </Button>
            ) : (
              <Link href="/auth/signin">
                <Button 
                  variant="default"
                  className="bg-black hover:bg-gray-800"
                  size="sm"
                >
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-1">
            {/* Feedback button as dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  aria-label="Geri bildirim menüsü"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-md">
                <DropdownMenuItem asChild>
                  <FeedbackButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User actions as dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  aria-label="Kullanıcı menüsü"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-md">
                {session ? (
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-destructive rounded-md"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signin" className="flex items-center gap-2 rounded-md">
                      <LogIn className="h-4 w-4" />
                      <span>Giriş Yap</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Main Menu Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label="Ana menüyü aç"
                  tabIndex={0}
                  className="h-8 w-8 rounded-md"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] rounded-l-md p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-center text-lg font-bold">The Barber Shop</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 space-y-6">
                  
                  {/* Menü Öğeleri */}
                  <nav className="flex flex-col space-y-3">
                    {/* Geri Bildirim Butonu */}
                    <div className="flex">
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2 justify-center rounded-md h-10 border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                        onClick={() => setFeedbackOpen(true)}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-medium">Geri Bildirim</span>
                      </Button>
                    </div>
                    
                    {/* Giriş Çıkış Butonu */}
                    <div className="pt-4 border-t border-gray-100">
                      {session ? (
                        <Button
                          variant="destructive"
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-2 justify-center rounded-md h-11"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Çıkış Yap</span>
                        </Button>
                      ) : (
                        <Link href="/auth/signin" className="w-full">
                          <Button 
                            variant="default"
                            className="bg-black hover:bg-gray-800 w-full flex items-center gap-2 justify-center rounded-md h-11"
                          >
                            <LogIn className="h-4 w-4" />
                            <span>Giriş Yap</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </nav>
                  
                  {/* Alt Kısım */}
                  <div className="mt-auto pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">© 2025 The Barber Shop</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Geri Bildirim Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-center">Geri Bildirim</DialogTitle>
          </DialogHeader>
          <FeedbackForm onClose={() => setFeedbackOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
} 