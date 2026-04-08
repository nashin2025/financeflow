"use client";

import * as React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { Camera, Upload, Scan, Loader2 } from "lucide-react";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (transactionData: unknown) => void;
}

export function ReceiptScannerModal({ isOpen, onClose, onScanComplete }: ReceiptScannerModalProps) {
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<unknown>(null);
  const [error, setError] = React.useState("");
  const { categories, accounts, addTransaction } = useAppStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setError("");

    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock OCR result - in a real app, this would call an OCR API
      const mockResult = {
        merchant: "Sample Store",
        amount: 45.67,
        date: new Date().toISOString().split('T')[0],
        items: [
          { description: "Item 1", price: 15.99 },
          { description: "Item 2", price: 29.68 }
        ]
      };

      setScanResult(mockResult);
    } catch (err) {
      setError('Failed to scan receipt. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!scanResult) return;

    try {
      const transaction = {
        type: 'expense' as const,
        amount: scanResult.amount,
        description: `Receipt: ${scanResult.merchant}`,
        merchantName: scanResult.merchant,
        date: scanResult.date,
        categoryId: categories.find(c => c.type === 'expense')?.id || '1',
        accountId: accounts[0]?.id || '1',
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }

      const { transaction: savedTransaction } = await response.json();
      addTransaction(savedTransaction);

      if (onScanComplete) {
        onScanComplete(savedTransaction);
      }

      onClose();
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScanResult(null);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            <Scan className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Scan Receipt</h2>
          <p className="text-foreground-secondary">
            Upload a receipt image to automatically extract transaction details
          </p>
        </div>

        {/* Image Upload */}
        {!imagePreview && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-12 w-12 text-foreground-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Upload Receipt</h3>
              <p className="text-foreground-secondary mb-4">
                Take a photo or upload an image of your receipt
              </p>
              <Button variant="secondary">
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && !scanResult && (
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Receipt preview"
                width={400}
                height={256}
                className="w-full max-h-64 rounded-lg bg-white/5"
                style={{ objectFit: 'contain' }}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="flex-1"
              >
                Change Image
              </Button>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan Receipt
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Scan Results */}
        {scanResult && (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="font-medium text-foreground mb-3">Extracted Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Merchant:</span>
                  <span className="text-foreground">{scanResult.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Amount:</span>
                  <span className="text-foreground">${scanResult.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Date:</span>
                  <span className="text-foreground">{new Date(scanResult.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setScanResult(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="flex-1"
              >
                Scan Again
              </Button>
              <Button
                onClick={handleSaveTransaction}
                className="flex-1"
              >
                Save Transaction
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}