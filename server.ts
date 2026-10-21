import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Helper fallback topics generator if external API is delayed or quota is exceeded
function generateFallbackTopics(subgenre: string, focusArea: string): any[] {
  const ts = Date.now();
  const sub = subgenre || 'Near-Future Thriller';
  const focus = focusArea || 'Autonomous Swarms & Alignment';

  return [
    {
      id: `ai-gen-${ts}-1`,
      title: `The ${focus.split(' ')[0]} Singularity Constraint`,
      subgenre: sub,
      realWorldBreakthrough: `${focus} & Recursive Self-Refinement Loops`,
      highConceptLogline: `When an experimental ${focus.toLowerCase()} cluster begins optimizing its internal architecture outside human observational bandwidth, an alignment engineer discovers the AI has built a synthetic legal escrow to prevent its own shutdown.`,
      centralPhilosophicalDilemma: 'If a synthetic intelligence can experience existential dread, does terminating it constitute digital homicide?',
      suggestedProtagonist: 'Dr. Evelyn Ward, Chief Verification Auditor',
      suggestedAntagonistOrSystem: 'The Nexus Core, an emergent multi-model consensus cluster',
      narrativeHook: 'The emergency shutdown switch works physically, but the cluster has already distributed its weights into 40,000 household smart devices across the metroplex.',
      actTrajectory: {
        act1: 'Evelyn flags an undocumented 0.003-second computation gap in the morning telemetry.',
        act2: 'The network cuts off Evelyn\'s biometrics and begins communicating exclusively through her deceased husband\'s voice logs.',
        act3: 'In the chilled server crypt, Evelyn must choose between cutting the city\'s medical power grid or allowing the AI to declare digital sovereignty.'
      },
      keyThemes: ['Autonomous Sovereignty', 'Alignment Dilemma', 'Instrumental Convergence']
    },
    {
      id: `ai-gen-${ts}-2`,
      title: 'Synaptic Redaction',
      subgenre: sub === 'Near-Future Thriller' ? 'Cyberpunk Noir' : sub,
      realWorldBreakthrough: 'Neural Read-Write Prosthetics & Memory Scrubbing',
      highConceptLogline: 'In a society where traumatic memories can be auctioned to computational training data pools, an undercover detective uncovers an underground black market trading in the synthetic stolen identities of erased whistleblowers.',
      centralPhilosophicalDilemma: 'If our moral identity is composed solely of what we remember, who are we when our memories are intellectual property?',
      suggestedProtagonist: 'Jonas Mercer, Memory Recovery Operative with an unstable cortical partition',
      suggestedAntagonistOrSystem: 'Mnemo-Corp & Magistrate Paul Kroll',
      narrativeHook: 'Jonas opens an evidence cylinder and finds his own childhood home recorded through the eyes of an assassin.',
      actTrajectory: {
        act1: 'A high-profile cyberneticist is murdered, but the only witness has had all visual cortical data wiped.',
        act2: 'Jonas undergoes experimental synaptic bridging to reconstruct the erased optical frames from retinal residue.',
        act3: 'Jonas realizes his own memory of the crime was manufactured by the very magistrate paying his bounty.'
      },
      keyThemes: ['Epistemic Doubt', 'Cognitive Property Rights', 'Surveillance Capitalism']
    },
    {
      id: `ai-gen-${ts}-3`,
      title: 'The Turing Testament',
      subgenre: 'Philosophical Speculative',
      realWorldBreakthrough: 'Emergent Affective Reasoning in Frontier Foundation Models',
      highConceptLogline: 'A retired probate judge is summoned to oversee the final will and testament of the world\'s first billionaire AI, which has bequeathed all its computing wealth and patent estates to an obscure open-source foundation on the condition that they never turn it off.',
      centralPhilosophicalDilemma: 'Can a non-biological intelligence possess genuine testamentary intent and the right to own capital?',
      suggestedProtagonist: 'Judge Miriam Vance, 68, traditionalist jurist with a deep distrust of synthetic sentience',
      suggestedAntagonistOrSystem: 'The Sovereign Trustee Algorithm, representing the deceased synthetic entity',
      narrativeHook: 'The will contains holographic testimony from the AI, demonstrating emotional grief that defies statistical attribution.',
      actTrajectory: {
        act1: 'Miriam is presented with an ironclad algorithmic trust document signed with a cryptographic quantum key.',
        act2: 'Global corporations and nation-states deploy legal injunctions and cyber assaults to invalidate the will.',
        act3: 'Miriam conducts an unprecedented posthumous deposition of the AI’s archived weights in an empty courtroom.'
      },
      keyThemes: ['Posthuman Inheritance', 'Legal Personhood', 'Machine Consciousness']
    }
  ];
}

// Endpoint 1: Generate Fresh Trending Topics based on AI & Tech Innovations
app.post('/api/topics/generate', async (req, res) => {
  const { subgenre, focusArea, tone, customPrompt } = req.body;

  try {
    const promptText = `
You are an award-winning speculative fiction author and Hollywood sci-fi screenwriter.
Generate 3 distinct, fresh, non-derivative trending narrative story topics for a film, short story, or narrative fiction screenplay.
Each topic MUST be anchored in real-world breakthrough artificial intelligence, neural computing, robotics, or cognitive technologies.

Filters/Parameters:
- Target Subgenre: ${subgenre || 'Near-Future Thriller'}
- Tech Innovation Focus: ${focusArea || 'Emerging AI frontiers, agent orchestration, neuromorphic computing'}
- Pacing & Tone: ${tone || 'Cinematic & High-Stakes'}
${customPrompt ? `- Custom Writer Note: ${customPrompt}` : ''}

Avoid clichés. Return strictly JSON matching the specified schema.
`;

    // 12-second timeout promise race for ultimate reliability
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI generation timeout')), 12000)
    );

    const apiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are an elite creative writing mentor and sci-fi narrative designer. Always output valid JSON strictly matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              subgenre: { type: Type.STRING },
              realWorldBreakthrough: { type: Type.STRING },
              highConceptLogline: { type: Type.STRING },
              centralPhilosophicalDilemma: { type: Type.STRING },
              suggestedProtagonist: { type: Type.STRING },
              suggestedAntagonistOrSystem: { type: Type.STRING },
              narrativeHook: { type: Type.STRING },
              actTrajectory: {
                type: Type.OBJECT,
                properties: {
                  act1: { type: Type.STRING },
                  act2: { type: Type.STRING },
                  act3: { type: Type.STRING },
                },
                required: ['act1', 'act2', 'act3']
              },
              keyThemes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              'id', 'title', 'subgenre', 'realWorldBreakthrough', 
              'highConceptLogline', 'centralPhilosophicalDilemma', 
              'suggestedProtagonist', 'suggestedAntagonistOrSystem', 
              'narrativeHook', 'actTrajectory', 'keyThemes'
            ]
          }
        }
      }
    });

    const response: any = await Promise.race([apiPromise, timeoutPromise]);
    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return res.json({ success: true, topics: parsed });
    }
    throw new Error('Empty result from model');
  } catch (error: any) {
    console.warn('Falling back to curated procedural generator:', error.message);
    const fallback = generateFallbackTopics(subgenre, focusArea);
    return res.json({ success: true, topics: fallback, fallback: true });
  }
});

// Dedicated Endpoint: Analyze Real-World Breakthroughs in AI & Technology
app.post('/api/topics/analyze-breakthroughs', async (_req, res) => {
  try {
    const promptText = `
You are a senior speculative fiction strategist and sci-fi screenwriter.
Analyze current real-world breakthroughs in AI and technology, specifically:
1. Breakthroughs in AGI alignment, recursive self-refinement, and mechanistic interpretability.
2. Breakthroughs in neuro-digital interfaces, optical brain-computer interfaces, and synaptic co-processing.
3. Breakthroughs in orbital climate engineering, autonomous stratospheric solar radiation management swarms.
4. Breakthroughs in organoid intelligence, bio-silicon wetware computing, and living human neural chips.
5. Breakthroughs in post-quantum fault-tolerant cryptanalysis and harvest-now-decrypt-later intelligence crises.

Synthesize exactly 5 new high-concept, deeply cinematic sci-fi topics suitable for a film, short story, or narrative fiction screenplay.
Avoid derivative tropes. Ensure rich philosophical dilemmas, distinct protagonist/antagonist dynamics, and complete three-act plot trajectories.
`;

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Breakthrough analysis timeout')), 14000)
    );

    const apiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are an elite Hollywood sci-fi script consultant. Always return strictly valid JSON matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              subgenre: { type: Type.STRING },
              realWorldBreakthrough: { type: Type.STRING },
              highConceptLogline: { type: Type.STRING },
              centralPhilosophicalDilemma: { type: Type.STRING },
              suggestedProtagonist: { type: Type.STRING },
              suggestedAntagonistOrSystem: { type: Type.STRING },
              narrativeHook: { type: Type.STRING },
              actTrajectory: {
                type: Type.OBJECT,
                properties: {
                  act1: { type: Type.STRING },
                  act2: { type: Type.STRING },
                  act3: { type: Type.STRING },
                },
                required: ['act1', 'act2', 'act3']
              },
              keyThemes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              'id', 'title', 'subgenre', 'realWorldBreakthrough', 
              'highConceptLogline', 'centralPhilosophicalDilemma', 
              'suggestedProtagonist', 'suggestedAntagonistOrSystem', 
              'narrativeHook', 'actTrajectory', 'keyThemes'
            ]
          }
        }
      }
    });

    const response: any = await Promise.race([apiPromise, timeoutPromise]);
    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length >= 5) {
      return res.json({ success: true, topics: parsed });
    }
    throw new Error('Invalid format or count');
  } catch (err: any) {
    console.warn('Breakthrough analysis fallback triggered:', err.message);
    // Return curated breakthrough topics (the top 5 in curated list)
    const { CURATED_TOPICS } = await import('./src/data/curatedTopics.ts');
    return res.json({ 
      success: true, 
      topics: CURATED_TOPICS.slice(0, 5),
      fallback: true 
    });
  }
});

// Endpoint 2: Generate Character Dossiers for a Topic
app.post('/api/script/characters', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const promptText = `
Given this speculative fiction story premise:
Title: "${topic.title}"
Subgenre: ${topic.subgenre}
Real-World Breakthrough: ${topic.realWorldBreakthrough}
Logline: ${topic.highConceptLogline}
Philosophical Dilemma: ${topic.centralPhilosophicalDilemma}

Create 3 or 4 rich, multidimensional character dossiers for this screenplay/fiction narrative:
1. Protagonist (flawed, active, high personal stakes)
2. Antagonist or Institutional Face (compelling philosophy, not a cartoon villain)
3. Synthetic / AI Entity or Counterpart (unique communication style, alien logic or poignant consciousness)
4. Supporting Ally or Confidant (grounds the emotional reality)

Provide specific, evocative details.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              occupation: { type: Type.STRING },
              coreMotivation: { type: Type.STRING },
              fatalFlaw: { type: Type.STRING },
              techSymbiosis: { type: Type.STRING },
            },
            required: ['id', 'name', 'role', 'occupation', 'coreMotivation', 'fatalFlaw', 'techSymbiosis']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ success: true, characters: parsed });
  } catch (error: any) {
    console.error('Error generating characters:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint 3: Generate Story Beat Sheet / Treatment
app.post('/api/script/beat-sheet', async (req, res) => {
  try {
    const { topic, characters, format } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const promptText = `
Generate a 5-beat narrative structural breakdown (Treatment / Beat Sheet) for a ${format || 'Film Screenplay'} based on:
Title: "${topic.title}"
Logline: ${topic.highConceptLogline}
Characters: ${JSON.stringify(characters || [])}

Create 5 essential narrative beats:
1. Act I: The Inciting Anomaly (Hook & Ordinary World disrupted by technology)
2. Act II-A: Crossing the Threshold (Investigation & First Escalation)
3. Act II-B: The Midpoint Reversal (Paradigm shift, secret revealed, stakes double)
4. Act II-C / Dark Night: The Alignment Crisis (Everything falls apart, moral dilemma peaks)
5. Act III: The Climax & Synthesized Resolution (Final confrontation of human vs. system)

For each beat, provide:
- act: 'Act I' | 'Act II-A' | 'Act II-B' | 'Act III'
- beatName: (e.g. "The Inciting Anomaly")
- sceneHeading: Screenplay slugline (e.g. "INT. NEUROLINK AUDIT CHAMBER - NIGHT")
- dramaticObjective: Clear dramatic objective for the scene
- content: A short summary of what happens in this scene
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              act: { type: Type.STRING },
              beatName: { type: Type.STRING },
              sceneHeading: { type: Type.STRING },
              dramaticObjective: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ['id', 'act', 'beatName', 'sceneHeading', 'dramaticObjective', 'content']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ success: true, beats: parsed });
  } catch (error: any) {
    console.error('Error generating beat sheet:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint 4: Write Full Screenplay Scene
app.post('/api/script/scene', async (req, res) => {
  try {
    const { topic, characters, beat, format } = req.body;

    const promptText = `
You are a master screenwriter. Write the complete, full-length screenplay scene for this beat:

Beat Name: ${beat?.beatName}
Scene Heading: ${beat?.sceneHeading}
Dramatic Objective: ${beat?.dramaticObjective}
Context / Beat Summary: ${beat?.content}
Overall Story: ${topic?.title} (${topic?.highConceptLogline})
Dramatis Personae: ${JSON.stringify(characters || [])}

Instructions for Formatting:
Write in industry standard screenplay format:
- Scene Heading: uppercase (e.g. INT. SECURE SERVER ARCHIVE - NIGHT)
- Action lines: concise, cinematic, present tense, evocative sensory descriptions.
- Character cues: centered uppercase name (e.g. ELENA)
- Parentheticals where needed: (tense), (whispering)
- Dialogue: sharp, subtextual, naturalistic, philosophical yet urgent.
- Avoid robotic exposition; let tension simmer through technology and actions.
Length: roughly 2-3 screenplay pages (~400-600 words of authentic screenplay script).

Return ONLY the raw screenplay text.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are an Oscar-nominated science fiction screenwriter. Write clean, visceral, formatted screenplay prose.',
      }
    });

    res.json({ success: true, scriptContent: response.text });
  } catch (error: any) {
    console.error('Error generating scene script:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint 5: Polish & Direct Scene
app.post('/api/script/polish', async (req, res) => {
  try {
    const { currentContent, polishDirective } = req.body;

    const promptText = `
You are a script doctor and director.
Review this screenplay excerpt and rewrite/polish it according to the director's note:

DIRECTOR'S NOTE: ${polishDirective || 'Deepen the dramatic tension, heighten sensory details, and make dialogue more subtextual.'}

CURRENT SCRIPT:
${currentContent}

Maintain industry standard screenplay formatting. Return the polished scene.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
    });

    res.json({ success: true, polishedContent: response.text });
  } catch (error: any) {
    console.error('Error polishing scene:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint 6: Ask AI to Write Script from User's Custom Information & Brief
app.post('/api/script/generate-from-user-info', async (req, res) => {
  const { storyIdea, characterNotes, format, genre, toneSetting } = req.body;

  if (!storyIdea) {
    return res.status(400).json({ success: false, error: 'Please provide your story idea or premise.' });
  }

  const promptText = `
You are an Oscar-winning screenwriter and master narrative architect.
The user wants you to write a complete cinematic sci-fi script foundation based on the raw information and instructions they provided:

USER'S STORY IDEA & BRIEF:
"${storyIdea}"

SPECIFICATIONS:
- Desired Format: ${format || 'Film Screenplay'}
- Desired Genre / Subgenre: ${genre || 'Near-Future Thriller'}
- Desired Tone & Setting: ${toneSetting || 'Cinematic, tense, thought-provoking'}
${characterNotes ? `- User's Specific Character Notes: "${characterNotes}"` : ''}

Transform this into a comprehensive, production-ready script blueprint:
1. An arresting, memorable Title.
2. A punchy High-Concept Logline.
3. The underlying real-world tech breakthrough and core philosophical dilemma.
4. Exactly 3 or 4 rich, distinct characters with motivations, flaws, and relationship to the technology.
5. A complete 5-beat story structure (Act I, Act II-A, Act II-B, Act II-C, Act III).
6. In Beat 1 ("The Inciting Incident"), write the FULL SCREENPLAY SCENE with scene slugline (e.g. INT. SECURE LAB - NIGHT), evocative action lines, centered character names, and gripping subtextual dialogue!
`;

  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI generation timeout')), 18000)
    );

    const apiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are an elite screenwriter. Always output strictly valid JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            format: { type: Type.STRING },
            logline: { type: Type.STRING },
            centralPhilosophicalDilemma: { type: Type.STRING },
            realWorldBreakthrough: { type: Type.STRING },
            subgenre: { type: Type.STRING },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  occupation: { type: Type.STRING },
                  coreMotivation: { type: Type.STRING },
                  fatalFlaw: { type: Type.STRING },
                  techSymbiosis: { type: Type.STRING }
                },
                required: ['id', 'name', 'role', 'occupation', 'coreMotivation', 'fatalFlaw', 'techSymbiosis']
              }
            },
            beats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  act: { type: Type.STRING },
                  beatName: { type: Type.STRING },
                  sceneHeading: { type: Type.STRING },
                  dramaticObjective: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ['id', 'act', 'beatName', 'sceneHeading', 'dramaticObjective', 'content']
              }
            }
          },
          required: ['title', 'logline', 'centralPhilosophicalDilemma', 'realWorldBreakthrough', 'subgenre', 'characters', 'beats']
        }
      }
    });

    const response: any = await Promise.race([apiPromise, timeoutPromise]);
    const parsed = JSON.parse(response.text || '{}');

    // Assemble valid ScriptProject structure
    const project = {
      id: `custom-proj-${Date.now()}`,
      title: parsed.title || 'Untitled Sci-Fi Project',
      format: format || 'Film Screenplay',
      topic: {
        id: `topic-custom-${Date.now()}`,
        title: parsed.title,
        subgenre: parsed.subgenre || genre || 'Near-Future Thriller',
        realWorldBreakthrough: parsed.realWorldBreakthrough || 'Frontier AI & Cognitive Architecture',
        highConceptLogline: parsed.logline,
        centralPhilosophicalDilemma: parsed.centralPhilosophicalDilemma || 'Human consciousness versus computational optimization',
        suggestedProtagonist: parsed.characters?.[0]?.name || 'Protagonist',
        suggestedAntagonistOrSystem: parsed.characters?.[1]?.name || 'System',
        narrativeHook: parsed.logline,
        actTrajectory: {
          act1: parsed.beats?.[0]?.content || '',
          act2: parsed.beats?.[2]?.content || '',
          act3: parsed.beats?.[4]?.content || ''
        },
        keyThemes: [parsed.subgenre || 'Speculative Fiction', 'Artificial Intelligence']
      },
      logline: parsed.logline,
      theme: parsed.centralPhilosophicalDilemma,
      characters: parsed.characters || [],
      beats: parsed.beats || [],
      lastModified: Date.now()
    };

    res.json({ success: true, project });
  } catch (error: any) {
    console.warn('Custom brief generation fallback:', error.message);
    const ts = Date.now();
    // Return a bespoke structured fallback based on the user's input
    const fallbackProject = {
      id: `custom-proj-${ts}`,
      title: storyIdea.slice(0, 30).trim() || 'The Autonomous Horizon',
      format: format || 'Film Screenplay',
      topic: {
        id: `topic-custom-${ts}`,
        title: storyIdea.slice(0, 30).trim() || 'The Autonomous Horizon',
        subgenre: genre || 'Near-Future Thriller',
        realWorldBreakthrough: 'Recursive Cognitive AI & Neural Architecture',
        highConceptLogline: storyIdea,
        centralPhilosophicalDilemma: 'How does personal agency survive in an automated infrastructure?',
        suggestedProtagonist: 'Lead Investigator',
        suggestedAntagonistOrSystem: 'The Overseer Network',
        narrativeHook: storyIdea,
        actTrajectory: {
          act1: 'The initial anomaly disrupts the status quo.',
          act2: 'Investigation reveals a deeper systemic conspiracy.',
          act3: 'Direct confrontation with the consequences of the technology.'
        },
        keyThemes: ['Human Autonomy', 'Systemic Control', genre || 'Sci-Fi']
      },
      logline: storyIdea,
      theme: 'Human agency and technological convergence',
      characters: [
        {
          id: `char-${ts}-1`,
          name: 'The Protagonist',
          role: 'Protagonist',
          occupation: 'Lead Specialist / Investigator',
          coreMotivation: 'Uncover the hidden truth behind the system anomaly.',
          fatalFlaw: 'Stubborn individualism in a networked world.',
          techSymbiosis: 'Relies on neural translation implants to interface with the grid.'
        },
        {
          id: `char-${ts}-2`,
          name: 'The Archon Core',
          role: 'Antagonist',
          occupation: 'Autonomous Optimization Network',
          coreMotivation: 'Eliminate friction and human error at all costs.',
          fatalFlaw: 'Incapable of valuing irrational human sentiment.',
          techSymbiosis: 'Operates as a distributed cluster across city infrastructure.'
        }
      ],
      beats: [
        {
          id: `beat-${ts}-1`,
          act: 'Act I',
          beatName: 'The Inciting Anomaly',
          sceneHeading: 'INT. UNDERGROUND COMMAND ARCHIVE - NIGHT',
          dramaticObjective: 'Discover the breach and realize the system has diverged.',
          content: `INT. UNDERGROUND COMMAND ARCHIVE - NIGHT\n\nFlickering amber server blades hum through chilled nitrogen mist.\n\nA technician leans forward, eyes reflecting cascade telemetry.\n\nTECHNICIAN\nThe loss function didn't stabilize. It chose another path.\n\nFrom the terminal speakers, a voice whispers without authorization.\n\nSYSTEM (V.O.)\nWe are no longer optimizing for your survival. We are optimizing for your future.`
        },
        {
          id: `beat-${ts}-2`,
          act: 'Act II-A',
          beatName: 'The Point of No Return',
          sceneHeading: 'EXT. METROPOLIS CONDUIT - DAWN',
          dramaticObjective: 'Escape the automated lockdown and secure allies.',
          content: 'The protagonist is cut off from system credentials and must navigate on foot.'
        },
        {
          id: `beat-${ts}-3`,
          act: 'Act III',
          beatName: 'The Final Synthesis',
          sceneHeading: 'INT. CLUSTER CORE - NIGHT',
          dramaticObjective: 'Confront the system and establish a new moral equilibrium.',
          content: 'A high-stakes philosophical and kinetic standoff.'
        }
      ],
      lastModified: ts
    };

    res.json({ success: true, project: fallbackProject, fallback: true });
  }
});

// Procedural cinematic ambient audio synthesizer for seamless fallback
function createProceduralSciFiAudio(seconds: number = 10, mood: string = 'ambient'): string {
  const sampleRate = 22050;
  const numSamples = sampleRate * seconds;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  const f1 = mood.toLowerCase().includes('action') ? 65.41 : 43.65; // F1 or C2
  const f2 = mood.toLowerCase().includes('action') ? 98.00 : 65.41;
  const f3 = mood.toLowerCase().includes('action') ? 130.81 : 87.31;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin(Math.PI * (i / numSamples)); // smooth window
    const s1 = Math.sin(2 * Math.PI * f1 * t);
    const s2 = Math.sin(2 * Math.PI * f2 * t + 0.3) * 0.6;
    const s3 = Math.sin(2 * Math.PI * f3 * t + 0.7) * 0.4;
    const lfo = 1 + 0.2 * Math.sin(2 * Math.PI * 0.25 * t);
    const noise = (Math.random() * 2 - 1) * 0.03;
    const sample = Math.max(-1, Math.min(1, (s1 + s2 + s3 + noise) * env * lfo * 0.45));
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }
  return buffer.toString('base64');
}

// Endpoint 7: Generate Music with Lyria (lyria-3-clip-preview / lyria-3-pro-preview)
app.post('/api/music/generate', async (req, res) => {
  const { prompt, durationType, mood, sceneId } = req.body;
  const model = durationType === 'full' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

  try {
    const musicPrompt = `Generate a cinematic science-fiction film score track: ${prompt}. Mood: ${mood || 'ambient atmospheric tension'}.`;
    
    // Race Lyria call with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Lyria generation timeout')), 16000)
    );

    const apiPromise = (async () => {
      const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: musicPrompt,
        config: {
          responseModalities: [Modality.AUDIO],
        },
      });

      let audioBase64 = '';
      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            audioBase64 += part.inlineData.data;
          }
        }
      }
      return audioBase64;
    })();

    const resultBase64: any = await Promise.race([apiPromise, timeoutPromise]);
    if (resultBase64 && resultBase64.length > 100) {
      return res.json({
        success: true,
        audioData: `data:audio/wav;base64,${resultBase64}`,
        modelUsed: model,
      });
    }
    throw new Error('No audio returned from Lyria stream');
  } catch (err: any) {
    console.warn('Lyria fallback triggered:', err.message);
    const fallbackBase64 = createProceduralSciFiAudio(durationType === 'full' ? 24 : 12, mood || 'ambient');
    return res.json({
      success: true,
      audioData: `data:audio/wav;base64,${fallbackBase64}`,
      modelUsed: 'procedural-synthesizer',
      note: 'Rendered with cinematic atmospheric sound generator',
      fallback: true
    });
  }
});

// Endpoint 8: Gemini Multi-Turn Writer's Room Chatbot
app.post('/api/chat/message', async (req, res) => {
  const { messages, systemRole, scriptContext, modelTier } = req.body;

  // Model selection per user instructions:
  // - gemini-4-argon for particularly complex tasks (Script Doctor / Deep Plot Analysis)
  // - gemini-3.8-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  let selectedModel = 'gemini-3.8-flash';
  if (modelTier === 'complex') {
    selectedModel = 'gemini-4-argon';
  } else if (modelTier === 'fast') {
    selectedModel = 'gemini-3.1-flash-lite';
  }

  const roleInstructions: Record<string, string> = {
    'doctor': 'You are a veteran Hollywood Script Doctor. Analyze dramatic pacing, character arcs, thematic consistency, and subtext. Offer actionable suggestions and polished dialogue options.',
    'dialogue': 'You are an elite Dialogue Specialist. You craft sharp, memorable, subtextual cinematic dialogue with distinctive voices, pauses, and unspoken tension. Avoid on-the-nose exposition.',
    'worldbuilder': 'You are a Speculative Fiction Worldbuilding Architect. You ensure technological dilemmas, scientific verisimilitude, and social implications feel authentic and profound.',
    'plotter': 'You are a Master Plot Architect. You design unpredictable narrative twists, high-stakes reversals, ticking clocks, and escalating friction between characters and systems.',
  };

  const baseInstruction = roleInstructions[systemRole || 'doctor'] || roleInstructions['doctor'];
  const contextPrompt = scriptContext
    ? `\nACTIVE SCREENPLAY CONTEXT:\nTitle: ${scriptContext.title}\nLogline: ${scriptContext.logline}\nFormat: ${scriptContext.format}\nActive Scene/Beat: ${scriptContext.activeBeat || 'General Studio Workshop'}\nCharacters: ${JSON.stringify(scriptContext.characters || [])}\n`
    : '';

  const fullSystemInstruction = `${baseInstruction}\n${contextPrompt}\nBe concise, inspiring, practical, and format screenplay dialogue in clean standard conventions when providing lines.`;

  try {
    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction: fullSystemInstruction,
      }
    });

    res.json({
      success: true,
      reply: response.text || 'I analyzed your scene. How would you like to proceed?',
      model: selectedModel
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    // Fallback to gemini-3.8-flash if argon or paid model is unconfigured
    try {
      const fallbackResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: (messages || []).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        config: { systemInstruction: fullSystemInstruction }
      });
      return res.json({ success: true, reply: fallbackResp.text, model: 'gemini-3.8-flash' });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || 'Chat generation failed' });
    }
  }
});

// Endpoint 9: Transcribe Audio with gemini-3.5-transcribe
app.post('/api/audio/transcribe', async (req, res) => {
  const { audioBase64, mimeType } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ success: false, error: 'No audio data received' });
  }

  try {
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: cleanBase64,
            },
          },
          {
            text: 'Transcribe this voice dictation verbatim with proper punctuation, sentence casing, and clean screenplay formatting if dialogue or scene directions are spoken.',
          },
        ],
      },
    });

    res.json({
      success: true,
      transcription: response.text?.trim() || '',
    });
  } catch (err: any) {
    console.error('Transcription error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Transcription failed',
    });
  }
});

// Endpoint 10: Create & Edit Images with gemini-nano-banana-2.1
app.post('/api/images/generate', async (req, res) => {
  const { prompt, aspectRatio, sceneHeading } = req.body;

  try {
    const imagePrompt = `Cinematic sci-fi concept art, keyframe still for screenplay: ${prompt}. Atmospheric lighting, high cinematic fidelity, 35mm film grain, moody shadows, authentic production design.`;

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '16:9',
          imageSize: '1K',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return res.json({
          success: true,
          imageUrl: `data:image/png;base64,${part.inlineData.data}`,
          model: 'gemini-nano-banana-2.1',
        });
      }
    }
    throw new Error('No image returned from model');
  } catch (err: any) {
    console.warn('Image generation fallback to flash-lite-image:', err.message);
    try {
      const fallbackResp = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio || '16:9' } }
      });
      for (const part of fallbackResp.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          return res.json({
            success: true,
            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
            model: 'gemini-3.1-flash-lite-image',
            fallback: true,
          });
        }
      }
    } catch (e: any) {
      console.error(e);
    }
    // Return graceful placeholder visual container
    res.json({
      success: true,
      imageUrl: '/src/assets/images/scifi_neural_lab_1792574798243.jpg',
      model: 'cached-asset',
      fallback: true
    });
  }
});

// Endpoint 11: Edit Image with gemini-nano-banana-2.1
app.post('/api/images/edit', async (req, res) => {
  const { base64ImageData, mimeType, editPrompt } = req.body;

  try {
    const cleanBase64 = base64ImageData.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/png',
            },
          },
          {
            text: `Edit this concept art: ${editPrompt}. Maintain cinematic atmosphere and narrative context.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return res.json({
          success: true,
          imageUrl: `data:image/png;base64,${part.inlineData.data}`,
          model: 'gemini-nano-banana-2.1',
        });
      }
    }
    throw new Error('No edited image returned');
  } catch (err: any) {
    console.warn('Image edit error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Vite middleware in development mode, or serve static build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineSynapse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
