export type SubgenreType = 
  | 'Near-Future Thriller'
  | 'Cyberpunk Noir'
  | 'Hard Sci-Fi'
  | 'Tech Satire'
  | 'Philosophical Speculative';

export interface SciFiTopic {
  id: string;
  title: string;
  subgenre: SubgenreType;
  realWorldBreakthrough: string;
  highConceptLogline: string;
  centralPhilosophicalDilemma: string;
  suggestedProtagonist: string;
  suggestedAntagonistOrSystem: string;
  narrativeHook: string;
  actTrajectory: {
    act1: string;
    act2: string;
    act3: string;
  };
  keyThemes: string[];
}

export interface CharacterDossier {
  id: string;
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Synthetic / AI' | 'Supporting Ally';
  occupation: string;
  coreMotivation: string;
  fatalFlaw: string;
  techSymbiosis: string; // Relationship with the AI technology
}

export interface SceneSoundtrack {
  id: string;
  sceneId?: string;
  title: string;
  mood: string;
  prompt: string;
  audioUrl: string; // base64 data URI
  duration: number; // in seconds
  createdAt: number;
}

export interface StoryboardImage {
  id: string;
  sceneId?: string;
  sceneHeading?: string;
  prompt: string;
  imageUrl: string; // base64 data URI
  createdAt: number;
}

export interface ScriptBeat {
  id: string;
  act: 'Act I' | 'Act II-A' | 'Act II-B' | 'Act III';
  beatName: string; // e.g. "Inciting Incident", "Midpoint Reversal"
  sceneHeading: string; // e.g. "EXT. OMEGA SERVER FARMS - NIGHT"
  dramaticObjective: string;
  content: string; // Screenplay formatted text
  isGenerating?: boolean;
  soundtrack?: SceneSoundtrack;
  storyboard?: StoryboardImage;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ScriptProject {
  id: string;
  title: string;
  format: 'Film Screenplay' | 'Short Film' | 'Narrative Fiction';
  topic: SciFiTopic;
  logline: string;
  theme: string;
  characters: CharacterDossier[];
  beats: ScriptBeat[];
  soundtracks?: SceneSoundtrack[];
  storyboards?: StoryboardImage[];
  lastModified: number;
}
