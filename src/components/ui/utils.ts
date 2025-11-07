import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely copy text to clipboard with fallback methods
 * @param text - Text to copy to clipboard
 * @returns Promise<boolean> - True if copy was successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (clipboardErr) {
        // Clipboard API failed, fall through to legacy method
        console.log("Clipboard API blocked, using fallback method");
      }
    }

    // Fallback method for when clipboard API is blocked or not available
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      return successful;
    } catch (execErr) {
      console.log("Copy failed with execCommand");
      return false;
    } finally {
      textArea.remove();
    }
  } catch (err) {
    console.log("Copy operation encountered an issue");
    return false;
  }
}
