import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CONNECTING_WORDS: Set<string> = new Set([
  // Articles and basic connectors
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 
  'the', 'to', 'with', 'yet', 'so', 'nor',
  
  // Question words
  'who', 'what', 'where', 'when', 'why', 'how', 'which',
  
  // Temporal words
  'ago', 'now', 'then', 'soon', 'later', 'after', 'before', 'during', 'while',
  'till', 'until', 'since', 'already',
  
  // Prepositions
  'from', 'into', 'onto', 'upon', 'within', 'without', 'through', 'throughout',
  'between', 'among', 'across', 'behind', 'beyond', 'under', 'over', 'above',
  'below', 'up', 'down',
  
  // Common filler words
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'has', 'have', 'had', 'do', 'does', 'did',
  'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would',
  'if', 'once', 'than', 'that', 'just', 'very', 'too', 'also', 'only', 'its'
]);

export function filterText(inputText: string | null | undefined): string {
    if (!inputText || typeof inputText !== 'string') {
        return '';
    }

    // First clean the text by converting to lowercase and removing unwanted punctuation
    // but preserve alphanumeric combinations
    const cleanedText = inputText.toLowerCase().replace(/[.,!?;:'"]/g, ' ');

    // Split into words, keeping alphanumeric combinations together
    return cleanedText
        .split(/\s+/)
        .filter(word => {
            // Skip empty strings
            if (!word) return false;
            
            // Filter out:
            // 1. Connecting words
            // 2. Single characters
            // 3. Numbers (any string that consists only of digits)
            return !(
                CONNECTING_WORDS.has(word) ||         // Remove connecting words
                word.length === 1 ||                  // Remove any single character
                /^\d+$/.test(word)                   // Remove standalone numbers
            );
        })
        .join(' ');
}
