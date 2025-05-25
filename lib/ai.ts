import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse } from './types';
import { generateId } from './utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `Extract key concepts, create a summary, and generate flashcards from the material.

Respond with valid JSON only:
{
  "concepts": ["concept1", "concept2", "concept3"],
  "summary": "Brief explanation in 1-2 sentences",
  "flashcards": [
    {"question": "Simple question", "answer": "Clear answer"}
  ]
}

Keep responses concise and complete.`;

function extractSummaryFromPartialJson(text: string): string {
  try {
    console.log('Attempting to extract summary from partial JSON...');
    
    // Try to find the summary field
    const summaryMatch = text.match(/"summary":\s*"([^"]*(?:\\.[^"]*)*)"/) || 
                        text.match(/"summary":\s*"([^"]+)/);
    
    if (summaryMatch && summaryMatch[1]) {
      const summary = summaryMatch[1]
        .replace(/\\"/g, '"')  // Unescape quotes
        .replace(/\\n/g, ' ')  // Replace newlines
        .trim();
      
      if (summary.length > 10) {  // Only use if substantial
        console.log('Extracted summary:', summary.substring(0, 100) + '...');
        return summary;
      }
    }
    
  } catch (error) {
    console.error('Error extracting summary from partial JSON:', error);
  }
  
  return '';
}

function extractFlashcardsFromPartialJson(text: string): Array<{question: string, answer: string}> {
  try {
    console.log('Attempting to extract flashcards from partial JSON...');
    
    const flashcards: Array<{question: string, answer: string}> = [];
    
    // Alternative pattern - look for individual question/answer pairs
    const questionPattern = /"question":\s*"([^"]+(?:[^"\\]|\\.)*)"[\s\S]*?"answer":\s*"([^"]+(?:[^"\\]|\\.)*)"/g;
    let match;
    
    while ((match = questionPattern.exec(text)) !== null && flashcards.length < 8) {
      const question = match[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
      const answer = match[2].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
      
      if (question.length > 5 && answer.length > 5) {
        flashcards.push({ question, answer });
      }
    }
    
    if (flashcards.length > 0) {
      console.log(`Extracted ${flashcards.length} flashcards`);
      return flashcards;
    }
    
  } catch (error) {
    console.error('Error extracting flashcards from partial JSON:', error);
  }
  
  return [];
}

function createFallbackResponse(concepts: string[] = [], summary: string = '', flashcards: Array<{question: string, answer: string}> = []): ClaudeResponse {
  // Use extracted content when available, fall back to generic content otherwise
  const fallbackConcepts = concepts.length > 0 ? concepts : [
    "Key Concept 1",
    "Key Concept 2", 
    "Key Concept 3"
  ];
  
  const fallbackSummary = summary || "This material contains important concepts for learning and understanding.";
  
  const fallbackFlashcards = flashcards.length > 0 ? flashcards : [
    {
      question: "What are the main topics covered in this material?",
      answer: "The material covers various important concepts and principles."
    },
    {
      question: "What should you focus on when studying this content?",
      answer: "Focus on understanding the key concepts and their applications."
    }
  ];
  
  return {
    concepts: fallbackConcepts,
    summary: fallbackSummary,
    flashcards: fallbackFlashcards.map(card => ({
      ...card,
      id: generateId()
    }))
  };
}

function extractConceptsFromPartialJson(text: string): string[] {
  try {
    console.log('Attempting to extract concepts from partial JSON...');
    
    // Try multiple patterns to extract concepts
    const patterns = [
      /"concepts":\s*\[([\s\S]*?)\]/,  // Multiline support
      /"concepts":\s*\[(.*?)\]/g,      // Single line
    ];
    
    for (const pattern of patterns) {
      const conceptsMatch = text.match(pattern);
      if (conceptsMatch) {
        console.log('Found concepts match:', conceptsMatch[1]);
        const conceptsString = conceptsMatch[1];
        
        // Extract quoted strings more robustly
        const conceptMatches = conceptsString.match(/"([^"]+)"/g);
        if (conceptMatches && conceptMatches.length > 0) {
          const concepts = conceptMatches.map(match => match.replace(/"/g, ''));
          console.log('Extracted concepts:', concepts);
          return concepts;
        }
      }
    }
    
    // If no concepts array found, try to extract any quoted strings that look like concepts
    const allQuotes = text.match(/"([^"]{3,50})"/g);
    if (allQuotes && allQuotes.length > 0) {
      const possibleConcepts = allQuotes
        .map(match => match.replace(/"/g, ''))
        .filter(str => 
          !str.includes('question') && 
          !str.includes('answer') && 
          !str.includes('summary') &&
          str.length > 3 &&
          str.charAt(0).toUpperCase() === str.charAt(0) // Starts with capital
        )
        .slice(0, 8); // Take first 8
      
      if (possibleConcepts.length > 0) {
        console.log('Extracted possible concepts:', possibleConcepts);
        return possibleConcepts;
      }
    }
    
  } catch (error) {
    console.error('Error extracting concepts from partial JSON:', error);
  }
  
  console.log('No concepts could be extracted');
  return [];
}

function repairJson(jsonText: string): string {
  let repaired = jsonText.trim();
  
  console.log('Attempting to repair JSON, length:', repaired.length);
  
  // Remove any trailing commas before } or ]
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix common quote issues
  repaired = repaired.replace(/'/g, '"'); // Replace single quotes with double quotes
  repaired = repaired.replace(/"/g, '"'); // Replace smart quotes
  repaired = repaired.replace(/"/g, '"'); // Replace smart quotes
  
  // Handle incomplete strings by finding unclosed quotes
  const quotes = repaired.match(/"/g) || [];
  if (quotes.length % 2 !== 0) {
    console.log('Found unclosed quote, attempting to fix...');
    
    // Find the last quote and see if we need to close the string
    const lastQuoteIndex = repaired.lastIndexOf('"');
    const afterLastQuote = repaired.substring(lastQuoteIndex + 1);
    
    // If there's no proper closing after the last quote, close it
    if (!afterLastQuote.match(/^\s*[,}\]]/)) {
      const nextStructureChar = afterLastQuote.search(/[,}\]]/);
      if (nextStructureChar !== -1) {
        repaired = repaired.substring(0, lastQuoteIndex + 1 + nextStructureChar) + 
                  '"' + 
                  repaired.substring(lastQuoteIndex + 1 + nextStructureChar);
      } else {
        repaired += '"';
      }
    }
  }
  
  // If JSON doesn't end properly, try to complete it
  if (!repaired.endsWith('}') && !repaired.endsWith(']')) {
    console.log('JSON appears incomplete, attempting to complete...');
    
    // Count braces and brackets
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    console.log('Brace counts - open:', openBraces, 'close:', closeBraces);
    console.log('Bracket counts - open:', openBrackets, 'close:', closeBrackets);
    
    // Add missing closing brackets first
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += ']';
    }
    
    // Add missing closing braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '}';
    }
  }
  
  console.log('Repaired JSON preview:', repaired.substring(0, 200) + '...');
  return repaired;
}

function extractJsonFromResponse(text: string): string {
  // Clean up the text first
  let cleanText = text.trim();
  
  // Replace smart quotes
  cleanText = cleanText.replace(/[""]/g, '"');
  cleanText = cleanText.replace(/['']/g, "'");
  
  // First try to find JSON block markers
  const jsonBlockMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // Look for the first { and last } to extract JSON
  const firstBrace = cleanText.indexOf('{');
  if (firstBrace === -1) return cleanText;
  
  // Find the last closing brace, but be careful about incomplete JSON
  let lastBrace = cleanText.lastIndexOf('}');
  if (lastBrace === -1 || lastBrace < firstBrace) {
    // No closing brace or it's before the opening brace - take everything from first brace
    return cleanText.substring(firstBrace);
  }
  
  return cleanText.substring(firstBrace, lastBrace + 1);
}

function validateResponse(response: any): response is ClaudeResponse {
  return (
    response &&
    typeof response === 'object' &&
    Array.isArray(response.concepts) &&
    typeof response.summary === 'string' &&
    Array.isArray(response.flashcards) &&
    response.flashcards.every((card: any) => 
      card && 
      typeof card.question === 'string' && 
      typeof card.answer === 'string'
    )
  );
}

export async function processWithClaude(content: string): Promise<ClaudeResponse> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    console.log('Sending request to Claude...');
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000, // Increased significantly
      temperature: 0.1, // Lower temperature for more consistent output
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this material briefly and respond with valid JSON:\n\n${content.substring(0, 8000)}` // Limit input length
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Claude response received, length:', responseText.length);
    console.log('Full response:', responseText);
    
    // Extract JSON from response
    const jsonText = extractJsonFromResponse(responseText);
    console.log('Extracted JSON length:', jsonText.length);
    
    // Parse with progressive fallbacks
    let parsedResponse: any;
    
    try {
      // Try direct parsing first
      parsedResponse = JSON.parse(jsonText);
      console.log('Direct JSON parsing successful');
    } catch (directError) {
      console.warn('Direct parsing failed, trying repair...', directError);
      
      try {
        // Try repair
        const repairedJson = repairJson(jsonText);
        console.log('Attempting repaired JSON:', repairedJson);
        parsedResponse = JSON.parse(repairedJson);
        console.log('Repaired JSON parsing successful');
      } catch (repairError) {
        console.warn('Repair failed, creating fallback...', repairError);
        
        // Extract what we can and create fallback
        const extractedConcepts = extractConceptsFromPartialJson(jsonText);
        console.log('Extracted concepts:', extractedConcepts);
        
        const extractedSummary = extractSummaryFromPartialJson(jsonText);
        console.log('Extracted summary:', extractedSummary);
        
        const extractedFlashcards = extractFlashcardsFromPartialJson(jsonText);
        console.log('Extracted flashcards:', extractedFlashcards);
        
        const fallbackResponse = createFallbackResponse(extractedConcepts, extractedSummary, extractedFlashcards);
        console.log('Using fallback response');
        return fallbackResponse;
      }
    }

    // Validate the parsed response
    if (!validateResponse(parsedResponse)) {
      console.warn('Response validation failed, using fallback');
      const extractedConcepts = extractConceptsFromPartialJson(jsonText);
      const extractedSummary = extractSummaryFromPartialJson(jsonText);
      const extractedFlashcards = extractFlashcardsFromPartialJson(jsonText);
      return createFallbackResponse(extractedConcepts, extractedSummary, extractedFlashcards);
    }

    console.log('Response validation successful');

    // Add IDs to flashcards
    const flashcardsWithIds = parsedResponse.flashcards.map(card => ({
      ...card,
      id: generateId()
    }));

    const result: ClaudeResponse = {
      concepts: parsedResponse.concepts,
      summary: parsedResponse.summary,
      flashcards: flashcardsWithIds
    };

    console.log('Content processing completed successfully');
    return result;

  } catch (error) {
    console.error('Claude API error:', error);
    
    // Return fallback response instead of throwing
    console.log('Returning fallback response due to error');
    return createFallbackResponse();
  }
}

export async function testClaudeConnection(): Promise<boolean> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return false;
    }

    await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Hello'
        }
      ]
    });

    return true;
  } catch (error) {
    console.error('Claude connection test failed:', error);
    return false;
  }
} 