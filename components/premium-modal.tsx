"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[32px] p-6 sm:p-8 bg-white border border-gray-100 shadow-xl gap-0">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-serif text-gray-800 text-center leading-tight">
            Voice features are available in KALL AI Plus
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-500 mt-3 block w-full">
            Upgrade to unlock premium voice guidance and deeper reflections.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-col gap-3 mt-4 w-full">
          <Button 
            className="w-full bg-[#E9B87D] hover:bg-[#d4a55d] text-white rounded-full py-6 text-base font-medium shadow-sm transition-all active:scale-95"
            onClick={() => {
              onClose();
              router.push('/pricing');
            }}
          >
            Upgrade to Plus
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-gray-400 hover:text-gray-600 rounded-full py-2"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}