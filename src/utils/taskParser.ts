
import { ParsedTask, Priority } from '@/types/task';

export function parseNaturalLanguageTask(input: string): ParsedTask {
  const lowerInput = input.toLowerCase();
  
  // Extract priority (P1, P2, P3, P4)
  const priorityMatch = input.match(/\bp([1-4])\b/i);
  const priority: Priority = priorityMatch ? `P${priorityMatch[1]}` as Priority : 'P3';
  
  // Remove priority from input for further parsing
  const withoutPriority = input.replace(/\bp[1-4]\b/gi, '').trim();
  
  // Extract assignee (common patterns: "John", "by John", "for John", etc.)
  const assigneePatterns = [
    /\b(?:by|for|to|assign(?:ed)?\s+to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:by|on|at)/i,
    /\b([A-Z][a-z]+)\s+(?:tomorrow|today|by)/i
  ];
  
  let assignee: string | undefined;
  let workingText = withoutPriority;
  
  for (const pattern of assigneePatterns) {
    const match = workingText.match(pattern);
    if (match) {
      assignee = match[1].trim();
      workingText = workingText.replace(match[0], '').trim();
      break;
    }
  }
  
  // If no assignee found with patterns, look for capitalized names
  if (!assignee) {
    const nameMatch = workingText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
    if (nameMatch) {
      // Check if it's likely a name (not a month or common word)
      const possibleName = nameMatch[1];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      const commonWords = ['Call', 'Send', 'Review', 'Finish', 'Complete', 'Update', 'Create'];
      
      if (!months.includes(possibleName) && !commonWords.includes(possibleName)) {
        assignee = possibleName;
        workingText = workingText.replace(nameMatch[0], '').trim();
      }
    }
  }
  
  // Extract due date/time
  let dueDate: string | undefined;
  
  // Handle "tomorrow" and "today"
  const now = new Date();
  if (lowerInput.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Extract time if present
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const isPM = timeMatch[3].toLowerCase() === 'pm';
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      tomorrow.setHours(hours, minutes, 0, 0);
    } else {
      tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM
    }
    
    dueDate = tomorrow.toISOString().slice(0, 16);
  } else if (lowerInput.includes('today')) {
    const today = new Date(now);
    
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const isPM = timeMatch[3].toLowerCase() === 'pm';
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      today.setHours(hours, minutes, 0, 0);
    } else {
      today.setHours(17, 0, 0, 0); // Default to 5 PM
    }
    
    dueDate = today.toISOString().slice(0, 16);
  } else {
    // Handle specific dates like "20th June", "June 20", "20/06", etc.
    const datePatterns = [
      /(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)/i,
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
      /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/,
      /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/
    ];
    
    for (const pattern of datePatterns) {
      const match = input.match(pattern);
      if (match) {
        let day: number, month: number, year: number = now.getFullYear();
        
        if (pattern.source.includes('January|February')) {
          // Month name first
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                             'july', 'august', 'september', 'october', 'november', 'december'];
          month = monthNames.indexOf(match[1].toLowerCase()) + 1;
          day = parseInt(match[2]);
        } else if (pattern.source.includes('st|nd|rd|th')) {
          // Day first with suffix
          day = parseInt(match[1]);
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                             'july', 'august', 'september', 'october', 'november', 'december'];
          month = monthNames.indexOf(match[2].toLowerCase()) + 1;
        } else {
          // Numeric format
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          if (match[3]) {
            year = parseInt(match[3]);
            if (year < 100) year += 2000;
          }
        }
        
        // Extract time
        const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
        let hours = 23, minutes = 59; // Default to end of day
        
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const isPM = timeMatch[3].toLowerCase() === 'pm';
          
          if (isPM && hours !== 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
        }
        
        const parsedDate = new Date(year, month - 1, day, hours, minutes);
        dueDate = parsedDate.toISOString().slice(0, 16);
        break;
      }
    }
  }
  
  // Extract task name (what's left after removing assignee and date info)
  let taskName = workingText
    .replace(/\b(?:by|for|to|tomorrow|today)\b/gi, '')
    .replace(/\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)/gi, '')
    .replace(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?/gi, '')
    .replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g, '')
    .replace(/\d{1,2}-\d{1,2}(?:-\d{2,4})?/g, '')
    .replace(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // If task name is empty or too short, use the original input
  if (!taskName || taskName.length < 3) {
    taskName = input.replace(/\bp[1-4]\b/gi, '').trim();
  }
  
  return {
    taskName,
    assignee,
    dueDate,
    priority
  };
}
