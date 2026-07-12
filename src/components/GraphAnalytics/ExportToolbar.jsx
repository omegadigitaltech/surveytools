import React, { useState } from 'react';
import { Download, Copy, Image as ImageIcon, FileText, FileDown, Check } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';

const ExportToolbar = ({ targetRef, fileName = 'chart', textToCopy = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedType, setCopiedType] = useState(null); // 'image' or 'text'

  const toggleMenu = () => setIsOpen(!isOpen);

  const getOptions = () => {
    if (!targetRef.current) return {};
    
    const node = targetRef.current;
    
    // Get actual computed background color of the element or fallback to theme
    let bgColor = window.getComputedStyle(node).backgroundColor;
    if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      bgColor = isDark ? '#0f172a' : '#ffffff'; // slate-900 or white
    }

    // Capture the full scrollable area
    const width = node.scrollWidth;
    const height = node.scrollHeight;

    return {
      backgroundColor: bgColor,
      pixelRatio: 2,
      width: width,
      height: height,
      style: {
        overflow: 'visible',
        maxHeight: 'none',
        width: `${width}px`,
        height: `${height}px`
      },
      filter: (node) => {
        // Exclude the toolbar itself from the screenshot
        if (node.classList?.contains('export-exclude-toolbar')) {
          return false;
        }
        return true;
      }
    };
  };

  const copyAsImage = async () => {
    try {
      setIsExporting(true);
      setIsOpen(false);
      
      if (!targetRef.current) throw new Error("Target element not found.");
      const blob = await htmlToImage.toBlob(targetRef.current, getOptions());
      
      if (!blob) throw new Error("Failed to create image blob");
      
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        setCopiedType('image');
        toast.success("Image copied to clipboard!");
        setTimeout(() => setCopiedType(null), 2000);
      } catch (err) {
        console.error("Clipboard API error:", err);
        toast.error("Failed to copy image. Your browser might not support this feature.");
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Error capturing image.");
    } finally {
      setIsExporting(false);
    }
  };

  const copyText = async () => {
    if (!textToCopy) return;
    
    try {
      setIsOpen(false);
      await navigator.clipboard.writeText(textToCopy);
      
      setCopiedType('text');
      toast.success("Text copied to clipboard!");
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Clipboard API error:", err);
      toast.error("Failed to copy text.");
    }
  };

  const downloadPNG = async () => {
    try {
      setIsExporting(true);
      setIsOpen(false);
      
      if (!targetRef.current) throw new Error("Target element not found.");
      const dataUrl = await htmlToImage.toPng(targetRef.current, getOptions());
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("PNG downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error generating PNG.");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsExporting(true);
      setIsOpen(false);
      
      if (!targetRef.current) throw new Error("Target element not found.");
      
      // We use toCanvas so we can easily get the width and height for jsPDF
      const canvas = await htmlToImage.toCanvas(targetRef.current, getOptions());
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
      
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error generating PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="absolute top-2 right-2 z-50 export-exclude-toolbar">
      <div className="relative">
        <button
          onClick={toggleMenu}
          disabled={isExporting}
          className="p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 transition-all flex items-center gap-2"
          title="Export"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="text-xs font-medium hidden sm:inline">Export</span>
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            ></div>
            
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 py-1">
              {textToCopy && (
                <button
                  onClick={copyText}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
                >
                  {copiedType === 'text' ? <Check className="w-4 h-4 text-green-500" /> : <FileText className="w-4 h-4 text-gray-400" />}
                  Copy Text
                </button>
              )}
              
              <button
                onClick={copyAsImage}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
              >
                {copiedType === 'image' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                Copy as Image
              </button>
              
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
              
              <button
                onClick={downloadPNG}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-gray-400" />
                Download PNG
              </button>
              
              <button
                onClick={downloadPDF}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
              >
                <FileDown className="w-4 h-4 text-gray-400" />
                Download PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExportToolbar;
