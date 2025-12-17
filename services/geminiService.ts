import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StandupEntry, TeamSummary } from "../types";

// Initialize the client. 
// Note: In a real production app, ensure API keys are handled securely (e.g., via backend proxy).
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const summarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    completedTasks: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
            task: { type: Type.STRING },
            owners: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of names of users who completed this task."
            }
        },
        required: ["task", "owners"]
      },
      description: "List of completed tasks, de-duplicated and synthesized with owners.",
    },
    activeInitiatives: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
            task: { type: Type.STRING },
            owners: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of names of users working on this."
            }
        },
        required: ["task", "owners"]
      },
      description: "List of currently active tasks or projects with owners.",
    },
    blockers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          owner: { type: Type.STRING, description: "Name of the person blocked" },
          isUrgent: { type: Type.BOOLEAN, description: "True if the blocker implies immediate stoppage or needs leadership intervention." },
        },
        required: ["description", "owner", "isUrgent"],
      },
    },
    overallSentiment: {
      type: Type.STRING,
      enum: ["Positive", "Neutral", "Concerned"],
    },
  },
  required: ["completedTasks", "activeInitiatives", "blockers", "overallSentiment"],
};

export const generateTeamSummary = async (entries: StandupEntry[]): Promise<TeamSummary> => {
  if (entries.length === 0) {
    return {
      completedTasks: [],
      activeInitiatives: [],
      blockers: [],
      overallSentiment: 'Neutral'
    };
  }

  const entriesText = entries.map(e => `
    User: ${e.userName}
    Yesterday: ${e.yesterday}
    Today: ${e.today}
    Blockers: ${e.blockers}
  `).join('\n---\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following standup entries for the engineering team. 
      De-duplicate similar tasks but list all owners involved. 
      Identify linguistic patterns for urgency (e.g., 'stuck on', 'no access', 'broken').
      
      Entries:
      ${entriesText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: summarySchema,
        systemInstruction: "You are an expert Engineering Manager assistant for Team Planner. Synthesize daily standup reports into a concise executive summary.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TeamSummary;
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    // Fallback for demo purposes if API fails
    return {
      completedTasks: [{ task: "Could not generate summary.", owners: ["System"] }],
      activeInitiatives: [],
      blockers: [{ description: "API Error or Invalid Key", owner: "System", isUrgent: true }],
      overallSentiment: 'Concerned'
    };
  }
};

export const queryStandupInsights = async (history: StandupEntry[], query: string): Promise<string> => {
  const context = history.map(e => `
    [${e.timestamp}] ${e.userName}:
    - Done: ${e.yesterday}
    - Doing: ${e.today}
    - Blocked: ${e.blockers}
  `).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context (Team History):\n${context}\n\nUser Query: ${query}`,
      config: {
        systemInstruction: "You are Team Planner, an intelligent archive interface. Answer questions based ONLY on the provided standup history. Be helpful and concise.",
      },
    });

    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Sorry, I encountered an error analyzing the history.";
  }
};

export const suggestCheckIn = async (gitHubActivity: string): Promise<{ yesterday: string; today: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on this raw GitHub activity log, draft a standup entry.
            
            Activity Log:
            ${gitHubActivity}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        yesterday: { type: Type.STRING },
                        today: { type: Type.STRING }
                    }
                }
            }
        });
        const text = response.text;
        if(!text) return { yesterday: "", today: ""};
        return JSON.parse(text);
    } catch (e) {
        return { yesterday: "Fixed bug in login.", today: "Continuing work on API." };
    }
}