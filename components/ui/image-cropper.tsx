"use client";

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Icons } from '@/components/icons'

interface ImageCropperProps {
    imageSrc: string | null
    open: boolean
    onClose: () => void
    onCropComplete: (croppedImageBlob: Blob) => void
}

export function ImageCropper({ imageSrc, open, onClose, onCropComplete }: ImageCropperProps) {
    const [zoom, setZoom] = useState(1)
    const [loading, setLoading] = useState(false)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [startPan, setStartPan] = useState({ x: 0, y: 0 })

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)

    // Load image
    useEffect(() => {
        if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                imageRef.current = img;
                draw();
            };
        }
    }, [imageSrc]);

    // Redraw when state changes
    useEffect(() => {
        draw();
    }, [zoom, pan, open]);

    const draw = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const img = imageRef.current;

        if (!canvas || !container || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate image dimensions with zoom
        const scaledWidth = img.width * zoom;
        const scaledHeight = img.height * zoom;

        // Center image + pan
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const x = centerX - (scaledWidth / 2) + pan.x;
        const y = centerY - (scaledHeight / 2) + pan.y;

        // Draw image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Draw Overlay (Black with hole)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Darker overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Crop Area (Circle) - Larger Area (90%)
        const cropSize = Math.min(canvas.width, canvas.height) * 0.9;

        // Draw hole
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Draw Border for Crop Area
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2);
        ctx.stroke();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch support for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        const touch = e.touches[0];
        setStartPan({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        setPan({ x: touch.clientX - startPan.x, y: touch.clientY - startPan.y });
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        setLoading(true);

        try {
            // Create a temporary canvas for the final cropped image
            const cropCanvas = document.createElement('canvas');
            const cropSize = 512; // Final resolution
            cropCanvas.width = cropSize;
            cropCanvas.height = cropSize;

            const ctx = cropCanvas.getContext('2d');
            if (!ctx) return;

            const screenCanvas = canvasRef.current;
            const screenCropSize = Math.min(screenCanvas.width, screenCanvas.height) * 0.9; // Updated to 0.9
            const screenCenterX = screenCanvas.width / 2;
            const screenCenterY = screenCanvas.height / 2;

            // Scale factor between screen crop size and final crop size
            const scale = cropSize / screenCropSize;

            // Clear with white (just in case)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cropSize, cropSize);

            // Make transparent for PNG/Circular feel (optional, but good for avatar)
            // ctx.clearRect(0,0, cropSize, cropSize);

            // Calculate drawn image position relative to the circle center on screen
            const imgXOnScreen = (screenCenterX - (img.width * zoom / 2) + pan.x);
            const imgYOnScreen = (screenCenterY - (img.height * zoom / 2) + pan.y);

            // Relative to the Crop Circle Top-Left
            const cropCircleLeft = screenCenterX - screenCropSize / 2;
            const cropCircleTop = screenCenterY - screenCropSize / 2;

            const relativeX = imgXOnScreen - cropCircleLeft;
            const relativeY = imgYOnScreen - cropCircleTop;

            // Apply to new canvas
            ctx.drawImage(
                img,
                relativeX * scale,
                relativeY * scale,
                img.width * zoom * scale,
                img.height * zoom * scale
            );

            // Convert to Blob
            cropCanvas.toBlob((blob) => {
                if (blob) {
                    onCropComplete(blob);
                }
                setLoading(false);
                onClose();
            }, 'image/jpeg', 0.9);

        } catch (e) {
            console.error(e);
            setLoading(false);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>ปรับแต่งรูปโปรไฟล์</DialogTitle>
                </DialogHeader>

                <div
                    ref={containerRef}
                    className="relative w-full h-80 bg-black rounded-md overflow-hidden my-4 cursor-move touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                >
                    <canvas ref={canvasRef} className="w-full h-full block" />

                    {!imageSrc && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            Loading image...
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Icons.minus className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[zoom]}
                            min={0.1} // Allow zooming out very far
                            max={3}
                            step={0.05}
                            onValueChange={(value) => setZoom(value[0])}
                            className="flex-1"
                        />
                        <Icons.plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        ใช้นิ้วหรือเมาส์เลื่อนรูปภาพเพื่อจัดตำแหน่ง
                    </p>
                </div>

                <DialogFooter className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        ยกเลิก
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'กำลังประมวลผล...' : 'บันทึก'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
