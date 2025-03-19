'use client';

import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Twitter,
  Check,
  Camera,
  Globe,
  Sparkles,
  Award,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  badgeIcon: string;
  badgeColor: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  tier: number;
  isShareable: boolean;
  earnedAt?: Date;
  shareImage?: string;
}

interface AchievementShareModalProps {
  achievement: Achievement;
  onClose: () => void;
  onShare?: (platform: string) => Promise<void>;
}

/**
 * Modal component for sharing achievements to social media
 */
export function AchievementShareModal({
  achievement,
  onClose,
  onShare,
}: AchievementShareModalProps) {
  const [activeTab, setActiveTab] = useState<string>('share');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState(achievement.shareImage || '');

  // Handle generating a shareable image
  const generateShareCard = async () => {
    try {
      setIsGeneratingCard(true);

      // This would normally call your API to generate a shareable card
      // For demo purposes, we'll simulate a delay and return a mock URL
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockShareCardUrl = `https://this-or-that.example.com/api/og/achievement?id=${achievement.id}&name=${encodeURIComponent(achievement.name)}`;

      setShareCardUrl(mockShareCardUrl);

      // Update the share URL to include the card
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/achievement/${achievement.id}`);

      setIsGeneratingCard(false);
      toast({
        title: 'Share card created!',
        description: 'Your achievement card is ready to share',
      });
    } catch (error) {
      console.error('Error generating share card:', error);
      setIsGeneratingCard(false);
      toast({
        title: 'Error generating card',
        description: 'Could not create your achievement share card',
        variant: 'error',
      });
    }
  };

  // Generate shareable URL
  React.useEffect(() => {
    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin : 'https://this-or-that.example.com';

    setShareUrl(`${baseUrl}/achievements/${achievement.id}`);
  }, [achievement.id]);

  // Handle copying to clipboard
  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Copied to clipboard',
          description: 'Link has been copied to your clipboard',
          variant: 'success',
        });
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Error',
        description: 'Could not copy to clipboard',
        variant: 'error',
      });
    }
  };

  // Handle sharing to Twitter
  const handleShareTwitter = async () => {
    try {
      const text = `I just unlocked the "${achievement.name}" achievement on This or That! ${shareUrl} #ThisOrThat #Achievement`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');

      // Record the share if callback provided
      if (onShare) {
        await onShare('twitter');
      }
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
    }
  };

  // Handle sharing to Farcaster
  const handleShareFarcaster = async () => {
    try {
      const text = `I just unlocked the "${achievement.name}" achievement on This or That! ${shareUrl} #ThisOrThat #Achievement`;
      const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');

      // Record the share if callback provided
      if (onShare) {
        await onShare('farcaster');
      }
    } catch (error) {
      console.error('Error sharing to Farcaster:', error);
    }
  };

  // Get color class based on rarity
  const getRarityColorClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-orange-400 bg-orange-400/10';
      case 'epic':
        return 'text-purple-400 bg-purple-400/10';
      case 'rare':
        return 'text-blue-400 bg-blue-400/10';
      case 'uncommon':
        return 'text-emerald-400 bg-emerald-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Share Achievement</h2>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Achievement Info */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ background: achievement.badgeColor }}
              >
                {achievement.badgeIcon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <div className="flex items-center mt-1 gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getRarityColorClass(achievement.rarity)}`}
                  >
                    {capitalize(achievement.rarity)}
                  </span>
                  {achievement.earnedAt && (
                    <span className="text-xs text-muted-foreground">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="share" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="share" className="flex-1">
                  Share
                </TabsTrigger>
                <TabsTrigger value="card" className="flex-1">
                  Create Card
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Share Tab */}
            <TabsContent value="share" className="px-4 pb-4 pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Share your achievement with friends and followers:
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto py-3"
                  onClick={handleShareFarcaster}
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>Farcaster</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto py-3"
                  onClick={handleShareTwitter}
                >
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span>Twitter</span>
                </Button>
              </div>

              <div className="relative mb-2">
                <p className="text-xs text-muted-foreground mb-2">Or copy the link:</p>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-muted/30 border border-border rounded-l-md px-3 py-2 text-sm focus:outline-none"
                  />
                  <Button variant="default" className="rounded-l-none" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {shareCardUrl && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Your achievement card:</p>
                  <div className="relative aspect-video rounded-md overflow-hidden bg-muted/50 flex items-center justify-center">
                    <img
                      src={shareCardUrl}
                      alt={`${achievement.name} achievement card`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Card Tab */}
            <TabsContent value="card" className="px-4 pb-4 pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Create a custom shareable card for your achievement:
              </p>

              {!shareCardUrl ? (
                <div className="bg-muted/30 border border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center mb-4">
                  <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Generate a shareable image of your achievement to post on social media
                  </p>
                  <Button
                    onClick={generateShareCard}
                    disabled={isGeneratingCard}
                    className="w-full"
                  >
                    {isGeneratingCard ? 'Generating...' : 'Generate Share Card'}
                  </Button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="relative aspect-video rounded-md overflow-hidden bg-muted/50 flex items-center justify-center mb-3">
                    <img
                      src={shareCardUrl}
                      alt={`${achievement.name} achievement card`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      onClick={() => {
                        // In a real app, this would trigger a download
                        window.open(shareCardUrl, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>

                    <Button
                      className="flex items-center justify-center gap-2"
                      onClick={() => setActiveTab('share')}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share Now</span>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
