import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, Bell, Shield, Moon, Volume2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NotificationSettings } from './NotificationSettings';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="account" className="mt-6">
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => {
                  toast({
                    title: "Privacy Settings",
                    description: "Privacy settings coming soon!"
                  });
                }}
              >
                <Shield className="mr-3 h-4 w-4" />
                Privacy & Security
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={() => {
                  toast({
                    title: "Delete Account",
                    description: "Account deletion coming soon!"
                  });
                }}
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Delete Account
              </Button>
              
              <Separator className="bg-gray-700" />
              
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};