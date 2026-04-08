"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { Loader2, Camera, X } from "lucide-react";

interface ProfilePhotoUploadModalProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePhotoUploadModal({ user, isOpen, onClose }: ProfilePhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { setUser } = useAppStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsUploading(true);
    setError("");

    try {
      // In a real app, you would upload to a cloud storage service
      // For now, we'll store the base64 data directly
      // This is not recommended for production as it can be large

      // Update user avatar in store
      if (user) {
        setUser({ ...user, avatar: previewUrl });
      }

      // Close modal
      onClose();
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (user) {
      setUser({ ...user, avatar: undefined });
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
          <Camera className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Update Profile Photo</h2>
        <p className="text-foreground-secondary mb-6">
          Choose a new profile photo from your device
        </p>

        {/* Current/Preview Avatar */}
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/10">
            <Image
              src={previewUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
              alt="Profile preview"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* File Input */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            Choose Photo
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 mb-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1"
          >
            Cancel
          </Button>

          {user?.avatar && (
            <Button
              type="button"
              variant="danger"
              onClick={handleRemove}
              disabled={isUploading}
              className="px-4"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}