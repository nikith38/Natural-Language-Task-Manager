import { ParsedTask, Priority } from '@/types/task';
import { parseNaturalLanguageTask } from './taskParser';

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

/**
 * Parse a natural language task input using OpenAI's GPT-4o
 * @param input The natural language task description
 * @returns A promise that resolves to a ParsedTask object
 */
export async function parseTaskWithAI(input: string): Promise<ParsedTask> {
  try {
    // Default task in case of failure
    const defaultTask: ParsedTask = {
      taskName: input,
      priority: 'P3'
    };

    // Check if API key is available
    if (!API_KEY) {
      console.warn('OpenAI API key not found. Using fallback parser.');
      return defaultTask;
    }

    // Calculate dates for examples
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const friday = new Date(today);
    friday.setDate(today.getDate() + ((7 + 5 - today.getDay()) % 7)); // Next Friday
    
    const fifteenth = new Date(today);
    fifteenth.setDate(15);
    if (fifteenth < today) {
      fifteenth.setMonth(fifteenth.getMonth() + 1);
    }
    
    // Format dates as ISO strings
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    const fridayDate = friday.toISOString().split('T')[0];
    const fifteenthDate = fifteenth.toISOString().split('T')[0];

    const systemPrompt = `You are a task parsing assistant specialized in extracting structured information from natural language task descriptions.
    Output ONLY valid JSON with the following schema, and nothing else - no markdown, no code blocks, no additional text:
    {
      "taskName": "The main task description",
      "assignee": "The person assigned to the task (optional)",
      "dueDate": "ISO date string (YYYY-MM-DDTHH:MM) when the task is due (optional)",
      "priority": "P1" | "P2" | "P3" | "P4"
    }
    
    VERY IMPORTANT: 
    - Respond with ONLY the JSON object, no markdown formatting, no code blocks, no explanations
    - Make sure your JSON is properly formatted and can be parsed by JSON.parse()
    - Do not use any backticks (\`\`\`) or markdown formatting in your response
    
    For the taskName:
    - Extract the core action and object, remove unnecessary words and context
    - Format it as a clear, concise action item starting with a verb when possible
    - Remove assignee names, dates, times, and priority markers from the task description
    - If the input is vague, generalize it into a clear task
    - Make sure the task description is professional and actionable
    
    Priority guidelines:
    - Priority P1 is critical/urgent, P2 is high, P3 is medium, P4 is low
    - If no priority is specified, use P3
    - Look for urgency words like "urgent", "critical", "important", "ASAP" to suggest P1
    - Look for terms like "when you can", "low priority", "not urgent" to suggest P4
    
    Date parsing:
    - For dates, properly parse relative terms like "tomorrow", "next week", "today", etc.
    - For times, handle formats like "3pm", "15:00", "morning", "afternoon", etc.
    - If a specific time isn't given for "today", use end of day (23:59)
    - If a specific time isn't given for "tomorrow", use 9:00 AM
    - If a specific time isn't given for a date, use end of day (23:59)
    - Today's date is ${today.toISOString().split('T')[0]}
    
    Assignee extraction:
    - Include the assignee only if it's clearly a person's name
    - Common patterns include "by [Name]", "assign to [Name]", "[Name] needs to", etc.
    - Just extract the name without titles or extra words
    
    Examples:
    
    Input: "I need to call John about the proposal tomorrow at 3pm"
    Output: {
      "taskName": "Call about the proposal",
      "assignee": "John",
      "dueDate": "${tomorrowDate}T15:00",
      "priority": "P3"
    }
    
    Input: "Finish the website redesign by Friday, it's critical"
    Output: {
      "taskName": "Finish website redesign",
      "dueDate": "${fridayDate}T23:59",
      "priority": "P1"
    }
    
    Input: "When you have time, please review the documentation that Sarah sent last week"
    Output: {
      "taskName": "Review documentation",
      "priority": "P4"
    }
    
    Input: "Send monthly report to the team by end of day on the 15th"
    Output: {
      "taskName": "Send monthly report to team",
      "dueDate": "${fifteenthDate}T23:59",
      "priority": "P3"
    }
    
    Input: "Urgent: Need to fix the login bug before the demo with client tomorrow morning"
    Output: {
      "taskName": "Fix login bug before demo",
      "dueDate": "${tomorrowDate}T09:00",
      "priority": "P1"
    }`;
    
    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: input
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    };
    
    if (DEBUG_MODE) {
      console.log('📤 Sending to OpenAI:', {
        input,
        systemPrompt: systemPrompt.substring(0, 200) + '...',
        currentDate: today.toISOString()
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return parseNaturalLanguageTask(input);
    }

    const data = await response.json() as OpenAIResponse;
    
    if (DEBUG_MODE) {
      console.log('📊 Full OpenAI response:', JSON.stringify(data, null, 2));
    }
    
    // Extract JSON from the response
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      console.error('Empty response from OpenAI API');
      return parseNaturalLanguageTask(input);
    }

    if (DEBUG_MODE) {
      console.log('📥 Received content:', content);
    }

    try {
      // Clean the content to ensure it's valid JSON
      let cleanContent = content;
      
      // Sometimes the model adds markdown code block indicators
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      // Remove any leading/trailing backticks and whitespace
      cleanContent = cleanContent.replace(/^`+|`+$/g, '').trim();
      
      // Log the cleaned content in debug mode
      if (DEBUG_MODE) {
        console.log('🧹 Cleaned content:', cleanContent);
      }
      
      // Parse the JSON response
      let parsedResult: ParsedTask;
      try {
        parsedResult = JSON.parse(cleanContent) as ParsedTask;
      } catch (initialJsonError) {
        // If direct parsing fails, try more aggressive cleanup
        if (DEBUG_MODE) {
          console.log('⚠️ Initial JSON parsing failed, trying more aggressive cleanup');
        }
        
        // Try to extract just the JSON object using regex
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          if (DEBUG_MODE) {
            console.log('🔍 Extracted JSON with regex:', extractedJson);
          }
          
          try {
            parsedResult = JSON.parse(extractedJson) as ParsedTask;
          } catch (secondJsonError) {
            // If that fails too, try to manually extract each field
            if (DEBUG_MODE) {
              console.log('⚠️ Secondary JSON parsing failed, using fallback parser');
            }
            throw secondJsonError; // This will go to the fallback parser
          }
        } else {
          throw initialJsonError; // This will go to the fallback parser
        }
      }
      
      // Validate and ensure the parsed result has required fields
      const result = {
        taskName: parsedResult.taskName || input,
        assignee: parsedResult.assignee,
        dueDate: parsedResult.dueDate,
        priority: parsedResult.priority || 'P3'
      };
      
      if (DEBUG_MODE) {
        console.log('✅ Parsed result:', result);
      }
      
      return result;
    } catch (jsonError) {
      console.error('Error parsing OpenAI response as JSON:', jsonError);
      console.log('Raw response:', content);
      
      // Last-resort fallback: Try to extract fields individually using regex
      try {
        const taskNameMatch = content.match(/"taskName"\s*:\s*"([^"]+)"/);
        const assigneeMatch = content.match(/"assignee"\s*:\s*"([^"]+)"/);
        const dueDateMatch = content.match(/"dueDate"\s*:\s*"([^"]+)"/);
        const priorityMatch = content.match(/"priority"\s*:\s*"([^"]+)"/);
        
        if (taskNameMatch) {
          const result: ParsedTask = {
            taskName: taskNameMatch[1],
            priority: priorityMatch ? priorityMatch[1] as Priority : 'P3'
          };
          
          if (assigneeMatch) {
            result.assignee = assigneeMatch[1];
          }
          
          if (dueDateMatch) {
            result.dueDate = dueDateMatch[1];
          }
          
          if (DEBUG_MODE) {
            console.log('🛟 Rescued with regex extraction:', result);
          }
          
          return result;
        }
      } catch (regexError) {
        console.error('Regex extraction failed:', regexError);
      }
      
      // If all else fails, use the fallback parser
      console.warn('All JSON parsing attempts failed, using fallback regex parser');
      return parseNaturalLanguageTask(input);
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return parseNaturalLanguageTask(input);
  }
} 