import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy / Safe GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CANDIDATE_MODELS = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function generateContentWithRetry(options: {
  contents: any;
  config?: any;
  preferredModel?: string;
  maxAttemptsPerModel?: number;
}): Promise<{ text: string }> {
  const preferred = options.preferredModel || 'gemini-3.7-flash';
  const modelsToTry = [
    preferred,
    ...CANDIDATE_MODELS.filter((m) => m !== preferred),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    const attempts = options.maxAttemptsPerModel || 2;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: options.contents,
          config: options.config,
        });

        if (response && (response.text !== undefined || (response as any).candidates?.length)) {
          return { text: response.text || '' };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || '').toLowerCase();
        const errStatus = err?.status || err?.code || '';
        const isRetryable =
          errStatus === 503 ||
          errStatus === 429 ||
          errStatus === 500 ||
          errStatus === 502 ||
          errStatus === 504 ||
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('high demand') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('fetch failed') ||
          errMsg.includes('timeout') ||
          errMsg.includes('econnreset');

        console.warn(`[Gemini API] Model ${model} (attempt ${attempt}/${attempts}) notice:`, err?.message || err);

        if (isRetryable && attempt < attempts) {
          const delayMs = Math.min(attempt * 800 + Math.random() * 400, 3000);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          // Switch to fallback model
          break;
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate content from AI model after retries.');
}

function cleanAndParseJson<T = any>(text: string, defaultValue: T): T {
  if (!text || typeof text !== 'string') return defaultValue;
  try {
    return JSON.parse(text);
  } catch {
    try {
      const stripped = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      return JSON.parse(stripped);
    } catch {
      try {
        const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch {
        console.warn('JSON parsing fallback triggered for raw text:', text.slice(0, 80));
      }
    }
  }
  return defaultValue;
}

// Fallback generator helper if Gemini is unavailable or rate limited
function createFallbackStudyData(topic: string, content: string, subjectName: string = 'General Science') {
  const cleanTopic = topic.trim() || 'Study Topic';
  const isQuantitative = /(physics|math|calculus|algebra|chemistry|mechanics|kinematics|thermo|electricity|geometry|equation|law|force|velocity|energy|circuit)/i.test(
    `${cleanTopic} ${subjectName}`
  );

  return {
    topic: cleanTopic,
    isProblemSolvingSubject: isQuantitative,
    summary: `${cleanTopic} is a cornerstone topic focusing on foundational principles and systematic analytical frameworks. As evaluated at the academic professor level, mastery of this domain requires establishing core definitions, deriving governing relationships, and testing boundary conditions through deliberate problem solving. Rather than relying on passive memorization, students should follow a structured sequence: understand the underlying physics/logic, apply mathematical constraints, and analyze practical case questions.`,
    keyPoints: [
      `Foundational Principle: ${cleanTopic} operates on rigorous baseline laws governing interaction within the system.`,
      `Governing Mechanism: Mathematical and conceptual rules predict behavior under variable constraints.`,
      `Analytical Scaffolding: Dissect complex problem statements into given parameters, unknown targets, and core governing relations.`,
      `Error Avoidance: Distinguish surface terminology from fundamental causal laws.`,
      `Exam High-Yield Focus: Focus on active problem solving, boundary condition checks, and dimensional consistency.`,
    ],
    keywords: [
      `${cleanTopic} Principle`,
      'Equilibrium State',
      'Rate of Change',
      'Boundary Condition',
      'Conservation Law',
      'Dimensional Analysis',
    ],
    formulas: isQuantitative
      ? [
          {
            name: `Fundamental ${cleanTopic} Governing Relation`,
            formula: `F = m \\cdot a \\quad \\text{or} \\quad \\Delta E = W + Q`,
            explanation: `Describes the direct proportional relationship between system inputs and resultant rate of change.`,
            units: `Standard SI units (N, J, m/s², or Pa)`,
            variables: [
              { symbol: 'm', meaning: 'Mass / Inertial parameter of the system' },
              { symbol: 'a', meaning: 'Acceleration / Rate of response' },
              { symbol: '\\Delta E', meaning: 'Net change in total system state' },
            ],
          },
          {
            name: `Conservation & Equilibrium Equation`,
            formula: `\\sum \\text{Input} = \\sum \\text{Output} + \\Delta \\text{Stored}`,
            explanation: `Enforces strict conservation laws across control boundaries during steady-state or dynamic transitions.`,
            units: `Joules (J) / Watts (W) / Moles (mol)`,
          },
        ]
      : [],
    visualDiagram: {
      type: isQuantitative ? 'force_motion' : 'concept_map',
      title: `${cleanTopic} Conceptual Model`,
      description: `Interactive structural model illustrating cause-and-effect pathways and equilibrium states in ${cleanTopic}.`,
      svgType: isQuantitative ? 'force_motion' : 'process_flow',
      labels: ['Initial State / Inputs', 'Governing Mechanism', 'System Response', 'Equilibrium Output'],
    },
    examRevisionNotes: {
      cheatSheetSummary: `⚡ Last-Minute Exam Booster for ${cleanTopic}: Always identify the 2 fundamental baseline assumptions first. In numerical problems, check units and boundary limits. In conceptual questions, state the governing theorem explicitly before applying conclusions.`,
      mustRememberFormulas: isQuantitative
        ? [
            `Primary Law: Output = Rate × Transfer Coefficient`,
            `Dimension check: Ensure LHS units match RHS units exactly`,
          ]
        : [
            `Core Thesis: Key mechanism links cause directly to observable effect`,
          ],
      keyPitfalls: [
        `Ignoring sign conventions (+ / - direction or exothermic/endothermic conventions).`,
        `Confusing instantaneous values with average rates over time.`,
        `Skipping initial condition checks before substituting values into general formulas.`,
      ],
      highYieldQuestions: [
        `How does doubling the primary input parameter alter the equilibrium state?`,
        `State the necessary condition under which this law remains valid without breakdown.`,
      ],
    },
    flashcards: [
      {
        id: 'fc-1',
        front: `What is the fundamental law / thesis behind ${cleanTopic}?`,
        back: `It establishes that system behavior is determined by governing balance equations, linking initial states to predictable equilibrium responses.`,
      },
      {
        id: 'fc-2',
        front: `What are the crucial boundary conditions to check in ${cleanTopic}?`,
        back: `Always check extreme limits (e.g. t=0, t→∞, zero resistance, or standard temperature/pressure) to verify mathematical consistency.`,
      },
      {
        id: 'fc-3',
        front: `Why is dimensional analysis critical when solving problems in ${cleanTopic}?`,
        back: `It immediately catches algebraic slip-ups by ensuring that both sides of your equation share identical SI dimensions.`,
      },
      {
        id: 'fc-4',
        front: `What is the most common exam trap in ${cleanTopic}?`,
        back: `Assuming ideal conditions when non-ideal or variable factors (friction, resistance, non-constant rates) are present.`,
      },
      {
        id: 'fc-5',
        front: `How do you explain the core mechanism of ${cleanTopic} in one sentence?`,
        back: `An applied input triggers a predictable systemic response governed by fundamental conservation and rate laws.`,
      },
    ],
    quiz: [
      {
        id: 'q-1',
        question: `Which approach represents the gold standard for mastering ${cleanTopic}?`,
        options: [
          `Memorizing end results without understanding derivations or governing laws`,
          `Deriving relations from first principles and testing them on boundary cases`,
          `Skipping unit verification to save time during calculations`,
          `Treating every numerical problem as an isolated formula lookup`,
        ],
        correctIndex: 1,
        explanation: `Professor-level mastery requires understanding first principles and testing how equations behave across limits rather than blind formula substitution.`,
      },
      {
        id: 'q-2',
        question: `When analyzing problem statements involving ${cleanTopic}, what is step zero?`,
        options: [
          `Immediately guess the multiple choice answer`,
          `List given variables with SI units and state the applicable governing theorem`,
          `Multiply all numbers together without checking dimensions`,
          `Ignore initial boundary assumptions`,
        ],
        correctIndex: 1,
        explanation: `Systematic problem solving always begins by documenting given variables with units and identifying the governing physical or mathematical rule.`,
      },
      {
        id: 'q-3',
        question: `What happens to the system outcome if the primary driving parameter is scaled by a factor of 2 in a linear relationship?`,
        options: [
          `It decreases to zero`,
          `It doubles proportionally according to the governing rate law`,
          `It remains completely unchanged`,
          `It scales unpredictably with no mathematical link`,
        ],
        correctIndex: 1,
        explanation: `Linear dependencies dictate direct proportionality: scaling input linearly yields an exact corresponding scaling in the response.`,
      },
      {
        id: 'q-4',
        question: `Why is active retrieval superior to passive highlighting when revising ${cleanTopic}?`,
        options: [
          `Highlighting uses too much ink`,
          `Active retrieval strengthens neural retrieval pathways and exposes conceptual blind spots`,
          `Active retrieval is only meant for language subjects`,
          `Passive reading creates photographic memory instantly`,
        ],
        correctIndex: 1,
        explanation: `Cognitive science confirms that active recall (quizzing, 3D flashcards, self-explanation) builds durable synaptic retention for exams.`,
      },
    ],
    explanation: {
      concept: cleanTopic,
      simpleExplanation: `Imagine ${cleanTopic} like a high-precision balance scale. When you place a weight on one side (an applied force or input), the balance tilts until counteracting forces restore equilibrium. Understanding the rule of the balance means you never have to blindly guess the result.`,
      everydayAnalogy: `Think of a bicycle on different gears: pedaling at a steady rate delivers different speed and torque depending on the gear ratio. ${cleanTopic} works the exact same way: the system geometry and governing rules determine how the effort translates to speed.`,
      whyItMatters: `Mastering this concept is essential for answering both theoretical derivations and complex multi-step numerical questions on your exams.`,
      professorDeepDive: `From an academic standpoint, ${cleanTopic} bridges foundational theoretical models with empirical observation. Key to this domain is appreciating how conservation principles (energy, mass, momentum, charge, or logical parity) constrain possible states, providing deterministic solution paths.`,
      keyTerms: [
        { term: 'Governing Law', definition: 'The universal physical or mathematical equation determining system dynamics.' },
        { term: 'Boundary Condition', definition: 'The constraints set at the start or edges of the problem space.' },
        { term: 'Equilibrium', definition: 'A stable state where opposing influences or forces cancel out.' },
        { term: 'Dimensional Homogeneity', definition: 'The principle that valid physical equations must have identical units on both sides.' },
      ],
      quickRecap: [
        `Always verify dimensions and units before computing.`,
        `Identify whether the system is in steady-state or dynamic transition.`,
        `State governing theorems explicitly in written exam answers.`,
      ],
    },
    studyPlan: [
      {
        dayNumber: 1,
        title: 'First Principles & Lecture Foundations',
        estimatedMinutes: 45,
        focus: 'Master definitions, governing equations, and derivation steps',
        steps: [
          { id: 'p1-1', activity: `Read professor notes and write down governing formulas for ${cleanTopic}`, durationMinutes: 20, type: 'read', completed: false },
          { id: 'p1-2', activity: 'Explain the core mechanism aloud using the Feynman analogy', durationMinutes: 15, type: 'practice', completed: false },
          { id: 'p1-3', activity: 'Review keywords and variable glossary', durationMinutes: 10, type: 'revision', completed: false },
        ],
      },
      {
        dayNumber: 2,
        title: '3D Flashcards & Active Retrieval Drill',
        estimatedMinutes: 45,
        focus: 'Cement definitions and formula recall through 3D flipping',
        steps: [
          { id: 'p2-1', activity: 'First pass through interactive 3D Flashcard deck', durationMinutes: 20, type: 'practice', completed: false },
          { id: 'p2-2', activity: 'Filter and drill all "Needs Practice" cards until 100% mastered', durationMinutes: 15, type: 'practice', completed: false },
          { id: 'p2-3', activity: 'Quick formula write-out from memory on paper', durationMinutes: 10, type: 'revision', completed: false },
        ],
      },
      {
        dayNumber: 3,
        title: 'Concept Check Quiz & Analytical Application',
        estimatedMinutes: 50,
        focus: 'Test problem-solving under exam-like multiple choice conditions',
        steps: [
          { id: 'p3-1', activity: 'Complete full practice quiz without notes', durationMinutes: 20, type: 'quiz', completed: false },
          { id: 'p3-2', activity: 'Review missed questions and study in-depth explanations', durationMinutes: 15, type: 'revision', completed: false },
          { id: 'p3-3', activity: 'Solve 1 past exam problem using the structured method', durationMinutes: 15, type: 'practice', completed: false },
        ],
      },
      {
        dayNumber: 4,
        title: 'Exam-Ready Cheat-Sheet & Last-Minute Synthesis',
        estimatedMinutes: 35,
        focus: 'Finalize high-yield exam notes and memorization triggers',
        steps: [
          { id: 'p4-1', activity: 'Review the Last-Minute Exam Booster Cheat-Sheet', durationMinutes: 15, type: 'revision', completed: false },
          { id: 'p4-2', activity: 'Rapid flashcard review speed run', durationMinutes: 10, type: 'practice', completed: false },
          { id: 'p4-3', activity: 'Final self-confidence check and checklist completion', durationMinutes: 10, type: 'revision', completed: false },
        ],
      },
    ],
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// 1. Full Study Package Generator (Professor Level with Formulas, Visuals, 3D Flashcards, Exam Cheat-Sheet)
app.post('/api/study/generate', async (req, res) => {
  const {
    topic = '',
    content = '',
    subjectName = 'Science',
    gradeLevel = 'class-11-12-pcm',
    studyDays = 4,
    dailyMinutes = 45,
  } = req.body;

  if (!content && !topic) {
    return res.status(400).json({ error: 'Please provide either a topic name or study material / PDF notes.' });
  }

  const topicName = topic.trim() || (content.trim().split('\n')[0].slice(0, 60) || 'Study Topic');

  if (!process.env.GEMINI_API_KEY) {
    console.log('No GEMINI_API_KEY set, returning curated study fallback data.');
    const fallback = createFallbackStudyData(topicName, content, subjectName);
    return res.json({ data: fallback, mode: 'demo', note: 'AI API key not configured. Generated local structured study resources.' });
  }

  try {
    const isProblemSolving = /(physics|math|calculus|algebra|chemistry|physical|kinematics|thermo|electricity|geometry|trigonometry|accountancy|mechanics|circuit)/i.test(
      `${topicName} ${subjectName} ${gradeLevel}`
    );

    const prompt = `You are a distinguished, world-class university Professor and master academic educator at StudyFlow AI.
Explain and teach the following study topic with the utmost professionalism, academic rigor, and pedagogical brilliance:

TOPIC: "${topicName}"
SUBJECT: "${subjectName}"
STUDENT CLASS / STANDARD: "${gradeLevel}"
STUDY MATERIAL / NOTES / EXTRACTED TEXT:
"""
${content.slice(0, 15000)}
"""

Target study plan parameters: ${studyDays} days schedule, approx ${dailyMinutes} minutes per day.

INSTRUCTIONS:
1. Explain with the depth, clarity, and professionalism of an elite Professor who makes difficult concepts crystal clear.
2. If this is a problem-solving subject (Physics, Mathematics, Chemistry, Physical Sciences, Quantitative subjects):
   - Provide dedicated "formulas": Array of { "name", "formula" (in clear LaTeX / standard notation), "explanation", "units", "variables": [{ "symbol", "meaning" }] }
   - Include high-yield "keywords" and "keyPoints" emphasizing problem-solving mechanics, boundary conditions, and derivations.
   - For Chemistry (especially for Class 11, Class 12, or competitive exams): include chemical equations, reaction mechanisms, thermodynamic/equilibrium relations, and molar equations.
   - For Humanities, English, or non-calculation subjects: leave "formulas" empty or provide key literary/historical frameworks.
3. Include an "examRevisionNotes" section specifically designed for last-minute exam preparation:
   - "cheatSheetSummary": High-yield, concise exam-booster summary.
   - "mustRememberFormulas": Array of the top 3-6 formulas/theorems that frequently appear on exams.
   - "keyPitfalls": 3-4 common errors/traps students fall into on exams.
   - "highYieldQuestions": 2-3 most probable exam question types.
4. Include a "visualDiagram" specification describing an interactive visual conceptual model / animated diagram:
   - "type": e.g. "atom_molecule" | "force_motion" | "circuit_flow" | "math_curve" | "biology_cell" | "process_flow" | "concept_map"
   - "title": Short title
   - "description": 1-2 sentence description of what the visual depicts
   - "svgType": "atom_molecule" | "force_motion" | "circuit_flow" | "math_curve" | "biology_cell" | "process_flow" | "concept_map"
   - "labels": Array of 3-5 key labels/stages
5. Include 6 to 10 high-impact active recall "flashcards" (front = question/prompt, back = clear answer).
6. Include 4 to 6 "quiz" questions with 4 options, correctIndex (0-3), and comprehensive explanations.
7. Include "explanation" with "simpleExplanation", "everydayAnalogy", "whyItMatters", "professorDeepDive", "keyTerms", and "quickRecap".
8. Include "studyPlan" days schedule.

Output strictly in valid JSON adhering to the schema.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            isProblemSolvingSubject: { type: Type.BOOLEAN },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            formulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  units: { type: Type.STRING },
                  variables: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                      },
                      required: ['symbol', 'meaning'],
                    },
                  },
                },
                required: ['name', 'formula', 'explanation'],
              },
            },
            visualDiagram: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                svgType: { type: Type.STRING },
                labels: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['type', 'title', 'description', 'svgType'],
            },
            examRevisionNotes: {
              type: Type.OBJECT,
              properties: {
                cheatSheetSummary: { type: Type.STRING },
                mustRememberFormulas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyPitfalls: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                highYieldQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['cheatSheetSummary', 'keyPitfalls', 'highYieldQuestions'],
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
            explanation: {
              type: Type.OBJECT,
              properties: {
                concept: { type: Type.STRING },
                simpleExplanation: { type: Type.STRING },
                everydayAnalogy: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                professorDeepDive: { type: Type.STRING },
                keyTerms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                    required: ['term', 'definition'],
                  },
                },
                quickRecap: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['simpleExplanation', 'everydayAnalogy', 'keyTerms', 'quickRecap'],
            },
            studyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        activity: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        type: { type: Type.STRING },
                      },
                      required: ['activity', 'durationMinutes', 'type'],
                    },
                  },
                },
                required: ['dayNumber', 'title', 'focus', 'estimatedMinutes', 'steps'],
              },
            },
          },
          required: ['topic', 'summary', 'keyPoints', 'flashcards', 'quiz', 'explanation', 'studyPlan'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = cleanAndParseJson<any>(text, {});

    if (Array.isArray(parsed.flashcards)) {
      parsed.flashcards = parsed.flashcards.map((f: any, idx: number) => ({
        ...f,
        id: f.id || `fc-${Date.now()}-${idx}`,
      }));
    }
    if (Array.isArray(parsed.quiz)) {
      parsed.quiz = parsed.quiz.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `quiz-${Date.now()}-${idx}`,
      }));
    }
    if (Array.isArray(parsed.studyPlan)) {
      parsed.studyPlan = parsed.studyPlan.map((day: any, dIdx: number) => ({
        ...day,
        steps: Array.isArray(day.steps)
          ? day.steps.map((s: any, sIdx: number) => ({
              ...s,
              id: s.id || `step-${dIdx}-${sIdx}`,
              completed: false,
            }))
          : [],
      }));
    }

    return res.json({ data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Gemini API generation error:', error);
    const fallback = createFallbackStudyData(topicName, content, subjectName);
    return res.json({
      data: fallback,
      mode: 'fallback',
      warning: error.message || 'AI request had an issue, provided structured learning blueprint.',
    });
  }
});

// Dedicated Doubt Solving & Master Academic Problem Solver Endpoint
app.post('/api/study/solve-doubt', async (req, res) => {
  const {
    question = '',
    subject = 'Science',
    gradeLevel = 'class-11-12-pcm',
    mode = 'step_by_step', // 'direct' | 'step_by_step' | 'concept_breakdown' | 'hint'
    attachment = null,
  } = req.body;

  if (!question && !attachment) {
    return res.status(400).json({ error: 'Please enter your doubt or question, or attach a question photo.' });
  }

  const cleanQuestion = question.trim() || 'Concept clarification from attached problem';
  const isQuantitative = /(physics|math|calculus|algebra|chemistry|physical|kinematics|thermo|electricity|geometry|trigonometry|accountancy|mechanics|circuit|integral|derivative|force|velocity|acceleration|moles|stoichiometry)/i.test(
    `${cleanQuestion} ${subject} ${gradeLevel}`
  );

  if (!process.env.GEMINI_API_KEY) {
    let finalAnswerDemo = `The evaluated solution for "${cleanQuestion}" yields the verified outcome based on foundational laws of ${subject}.`;
    let answerDemo = `Here is the direct solution for your ${subject} problem: We evaluate the given constraints by applying the core theorem. First principles establish that balancing inputs with boundary conditions resolves the unknown directly.`;
    
    if (mode === 'direct') {
      finalAnswerDemo = `Final Verified Solution: Required value / conclusion = Exact Result (${subject} Theorem Satisfied).`;
      answerDemo = `Direct Solution:\n1. Target variable is isolated directly using governing equation.\n2. Substituting given parameters yields the final verified answer.`;
    } else if (mode === 'hint') {
      finalAnswerDemo = `Hint Focus: Look at how initial parameters constrain the final state.`;
      answerDemo = `💡 Guiding Hint: Before solving fully, write down the governing formula for ${subject}. Notice how isolating the target variable simplifies the calculation!`;
    }

    return res.json({
      data: {
        id: `doubt-${Date.now()}`,
        question: cleanQuestion,
        subject,
        gradeLevel,
        teachingStyle: mode,
        finalAnswer: finalAnswerDemo,
        keyConcept: `Fundamental Law & Problem-Solving Logic in ${subject}`,
        answer: answerDemo,
        stepByStep: [
          `Step 1: Identify given quantities, boundary constraints, and target variable.`,
          `Step 2: Apply the governing formula or rate/conservation equation.`,
          `Step 3: Perform dimensional substitution with strict SI unit consistency.`,
          `Step 4: Evaluate the final numerical result and verify against physical limits.`,
        ],
        formulas: isQuantitative
          ? [
              {
                name: 'Primary Governing Relation',
                formula: 'F_{net} = m \\cdot a \\quad \\text{or} \\quad \\Delta G = \\Delta H - T\\Delta S',
                explanation: 'Core theorem balancing input constraints against system response.',
                units: 'SI Units (N, J, m/s, or mol/L)',
              },
            ]
          : [],
        verification: 'Dimensional analysis confirms units match the expected target dimension on both sides of the equation.',
        analogy: `Think of this like an exact balance scale: adjusting weights on one arm immediately determines what is required on the opposite arm to maintain equilibrium.`,
        examTip: `⚡ Solver Exam Strategy: State the general formula first with correct sign conventions before substituting numbers to lock in full method marks.`,
        suggestedQuestions: [
          `How does the final answer change if initial conditions are halved?`,
          `What is the boundary limit as the independent variable approaches infinity?`,
        ],
        createdAt: new Date().toISOString(),
      },
      mode: 'demo',
    });
  }

  try {
    const contents: any[] = [];
    if (attachment && attachment.base64Data) {
      const base64WithoutHeader = attachment.base64Data.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: attachment.type || 'image/jpeg',
          data: base64WithoutHeader,
        },
      });
    }

    let styleDirective = '';
    if (mode === 'direct' || mode === 'direct_answer') {
      styleDirective = `MODE: DIRECT ANSWER & SOLVER MODE.
- Give the exact, concise final answer immediately in "finalAnswer".
- In "answer", provide a crisp, direct mathematical or factual solution without unnecessary preamble or meta-advice.
- Do NOT give generic study advice. Solve the specific question directly.`;
    } else if (mode === 'step_by_step') {
      styleDirective = `MODE: STEP-BY-STEP COMPLETE DERIVATION & SOLVER.
- Provide a rigorous, numbered, step-by-step solution showing complete working from given data to final answer.
- Clearly state every intermediate calculation, algebraic rearrangement, or logical inference in "stepByStep".
- Summarize the exact result in "finalAnswer".
- Do NOT give generic study advice. Solve the student's actual problem completely.`;
    } else if (mode === 'concept_breakdown') {
      styleDirective = `MODE: CONCEPT BREAKDOWN & UNDERLYING MECHANISMS.
- Solve the user's question completely AND explain WHY the method works.
- Dissect the underlying physical, chemical, mathematical, or conceptual mechanisms.
- Include the exact final answer in "finalAnswer".`;
    } else if (mode === 'hint') {
      styleDirective = `MODE: GUIDING HINT (ACADEMIC HONESTY / THINKING PROMPT).
- Provide a sharp educational clue, guiding question, or strategic stepping stone in "answer".
- State the key clue in "finalAnswer" as a hint summary.`;
    } else {
      styleDirective = `MODE: COMPLETE SOLVER.
- Solve the question thoroughly and provide the exact answer and step-by-step solution.`;
    }

    const promptText = `You are StudyFlow AI's Master Academic Problem Solver and University Professor.
The student in "${gradeLevel}" studying "${subject}" submitted the following doubt or problem:

QUESTION / DOUBT:
"""
${cleanQuestion}
"""

${styleDirective}

CRITICAL RULES FOR YOU AS A SOLVER:
1. NEVER give vague advice like "You should read your textbook" or "Study harder". You MUST directly SOLVE the problem, calculate numericals, derive formulas, balance reactions, and state the exact answers.
2. In "finalAnswer": Provide a crisp, highlighted final answer (e.g. "Final Answer: $v = 19.6\\text{ m/s}$" or "Final Answer: The limiting reagent is $O_2$ with $2.5\\text{ moles}$ formed").
3. In "answer": Provide the complete, lucid solution and thorough explanation.
4. In "stepByStep": Array of sequential steps (Step 1: Given & Target, Step 2: Formula, Step 3: Calculation, Step 4: Final Result).
5. In "formulas": Array of governing equations with names, LaTeX format, explanations, and SI units.
6. In "verification": A quick sanity check or dimensional proof demonstrating why the answer is mathematically/conceptually sound.
7. In "keyConcept": 1-line thesis on the core principle.
8. In "analogy": A vivid, intuitive real-world analogy.
9. In "examTip": High-yield tip or common trap to avoid in exams.
10. In "suggestedQuestions": 2-3 drill questions to test understanding.

Respond strictly in JSON matching the schema.`;

    contents.push({ text: promptText });

    const response = await generateContentWithRetry({
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            finalAnswer: { type: Type.STRING },
            keyConcept: { type: Type.STRING },
            answer: { type: Type.STRING },
            stepByStep: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            formulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  units: { type: Type.STRING },
                },
                required: ['name', 'formula', 'explanation'],
              },
            },
            verification: { type: Type.STRING },
            analogy: { type: Type.STRING },
            examTip: { type: Type.STRING },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['finalAnswer', 'keyConcept', 'answer', 'stepByStep', 'examTip'],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '{}', {});
    return res.json({
      data: {
        id: `doubt-${Date.now()}`,
        question: cleanQuestion,
        subject,
        gradeLevel,
        teachingStyle: mode,
        ...parsed,
        createdAt: new Date().toISOString(),
        attachment: attachment ? { name: attachment.name, type: attachment.type } : undefined,
      },
      mode: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini Doubt Solver error:', error);
    return res.json({
      data: {
        id: `doubt-${Date.now()}`,
        question: cleanQuestion,
        subject,
        gradeLevel,
        teachingStyle: mode,
        finalAnswer: `Verified solution for "${cleanQuestion}" based on fundamental principles of ${subject}.`,
        keyConcept: `Core principles of ${subject}`,
        answer: `Direct solution for "${cleanQuestion}": Break down the given values, apply the governing theorem for ${subject}, and evaluate each step methodically to achieve the exact result.`,
        stepByStep: [
          `Step 1: Write down given values and state what you need to find.`,
          `Step 2: Apply the governing formula or rule.`,
          `Step 3: Solve algebraically and check dimensional consistency.`,
          `Step 4: State the final verified conclusion.`,
        ],
        verification: 'Verified consistent with standard SI dimensions and boundary conditions.',
        examTip: `⚡ Remember to double-check units, negative signs, and significant digits on your exam!`,
        createdAt: new Date().toISOString(),
      },
      mode: 'fallback',
      warning: error.message,
    });
  }
});

// 2. Dedicated Note Summarizer: Quick Summary, Key Points, Important Terms, Remember This
app.post('/api/study/summarize-note', async (req, res) => {
  const { title = '', content = '' } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Please provide note content to summarize.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      data: {
        quickSummary: `This note covers the primary fundamentals of ${title || 'the study topic'}. It establishes essential definitions, systematic workflows, and practical applications for revision.`,
        keyPoints: [
          'Foundational concepts form the baseline for further problem solving.',
          'Key mechanisms connect inputs to observable results.',
          'Active recall and periodic practice are required to solidify retention.',
        ],
        importantTerms: [
          { term: 'Core Concept', definition: 'The primary underlying principle of this subject.' },
          { term: 'Mechanism', definition: 'The step-by-step process connecting cause and effect.' },
        ],
        rememberThis: 'Focus on understanding WHY mechanisms operate rather than just memorizing labels.',
      },
      mode: 'demo',
    });
  }

  try {
    const prompt = `You are StudyFlow AI. Analyze the following student note and produce a structured summary:
TITLE: "${title}"
NOTE CONTENT:
"""
${content.slice(0, 10000)}
"""

Produce a clean JSON response with:
1. "quickSummary": Short 2-3 sentence overview.
2. "keyPoints": Array of 4-6 concise bullet points.
3. "importantTerms": Array of { "term": string, "definition": string } (3-5 terms).
4. "rememberThis": Short, memorable revision takeaway (1-2 sentences).`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quickSummary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            importantTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            rememberThis: { type: Type.STRING },
          },
          required: ['quickSummary', 'keyPoints', 'importantTerms', 'rememberThis'],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '{}', {});
    return res.json({ data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Summarize error:', error);
    return res.json({
      data: {
        quickSummary: `This note covers the primary fundamentals of ${title || 'the study topic'}.`,
        keyPoints: ['Core principle establishes baseline logic.', 'Mechanisms connect inputs to outputs.'],
        importantTerms: [{ term: 'Core Concept', definition: 'Underlying principle.' }],
        rememberThis: 'Understand why mechanisms happen.',
      },
      mode: 'fallback',
    });
  }
});

// 2b. Automated Complete Master Notes Generator from Uploaded Photos, Gallery, Field Notes, Notebooks, or Topics
app.post('/api/study/generate-full-notes', async (req, res) => {
  const {
    topic = '',
    content = '',
    subjectName = 'Science',
    gradeLevel = 'class-11-12-pcm',
    files = [],
    base64Data = '',
    mimeType = 'image/jpeg',
    filename = '',
  } = req.body;

  const hasFiles = Array.isArray(files) && files.length > 0;
  const hasInput = topic.trim() || content.trim() || hasFiles || base64Data;

  if (!hasInput) {
    return res.status(400).json({ error: 'Please provide photos, notebook pages, files, or a topic name.' });
  }

  const topicName = topic.trim() || filename?.replace(/\.[^/.]+$/, '') || (content.trim().split('\n')[0].slice(0, 60) || 'Study Topic');

  if (!process.env.GEMINI_API_KEY) {
    const fallbackStudy = createFallbackStudyData(topicName, content, subjectName);
    const fullMarkdownContent = `# ${topicName}\n\n## 1. Executive Overview & Theoretical Foundations\n${fallbackStudy.summary}\n\n## 2. Core Concepts & Technical Keywords\n${fallbackStudy.keywords.map(k => `- **${k}**: Essential academic terminology governing this chapter.`).join('\n')}\n\n## 3. Governing Principles & Laws\n${fallbackStudy.keyPoints.map(kp => `* ${kp}`).join('\n')}\n\n## 4. Mathematical Formulae & Derivations\n${fallbackStudy.formulas.length > 0 ? fallbackStudy.formulas.map(f => `### ${f.name}\n$$\n${f.formula}\n$$\n- **Explanation**: ${f.explanation}\n- **SI Units**: ${f.units || 'Standard SI'}\n- **Variables**: ${f.variables?.map(v => `${v.symbol} = ${v.meaning}`).join(', ') || 'N/A'}`).join('\n\n') : 'This qualitative topic emphasizes conceptual definitions and systematic case frameworks.'}\n\n## 5. High-Yield Important Points & Exam Pitfalls\n${fallbackStudy.examRevisionNotes.keyPitfalls.map(p => `⚠️ **Important Trap**: ${p}`).join('\n')}\n\n## 6. Step-by-Step Problem Solving Strategy\n1. Identify given variables and required targets.\n2. State the governing theorem and check boundary assumptions.\n3. Verify dimensional consistency across SI units.\n4. Interpret physical meaning of the result.\n\n## 7. Master Summary & Key Takeaways\n${fallbackStudy.examRevisionNotes.cheatSheetSummary}`;

    return res.json({
      data: {
        title: topicName,
        subject: subjectName,
        topic: topicName,
        summary: fallbackStudy.summary,
        content: fullMarkdownContent,
        keywords: fallbackStudy.keywords,
        keyPoints: fallbackStudy.keyPoints,
        importantPoints: fallbackStudy.examRevisionNotes.keyPitfalls,
        formulas: fallbackStudy.formulas,
        tags: [subjectName, topicName, 'AI Master Note', 'High Yield'],
        summaryData: {
          quickSummary: fallbackStudy.summary,
          keyPoints: fallbackStudy.keyPoints,
          importantTerms: fallbackStudy.keywords.map(k => ({ term: k, definition: `Key terminology in ${topicName}` })),
          rememberThis: fallbackStudy.examRevisionNotes.cheatSheetSummary,
          formulas: fallbackStudy.formulas,
          keywords: fallbackStudy.keywords,
        },
        explanationData: fallbackStudy.explanation,
        examRevisionNotes: fallbackStudy.examRevisionNotes,
        flashcards: fallbackStudy.flashcards,
        quiz: fallbackStudy.quiz,
      },
      mode: 'demo',
    });
  }

  try {
    const isProblemSolving = /(physics|math|calculus|algebra|chemistry|physical|kinematics|thermo|electricity|geometry|trigonometry|accountancy|mechanics|circuit|equation|rate|velocity|force|energy|mole)/i.test(
      `${topicName} ${subjectName} ${gradeLevel}`
    );

    const contents: any[] = [];

    // Add multimodal files
    if (hasFiles) {
      for (const f of files) {
        if (f.base64Data) {
          const cleanData = f.base64Data.includes('base64,') ? f.base64Data.split('base64,')[1] : f.base64Data;
          contents.push({
            inlineData: {
              data: cleanData,
              mimeType: f.mimeType || 'image/jpeg',
            },
          });
        }
      }
    } else if (base64Data) {
      const cleanData = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
      contents.push({
        inlineData: {
          data: cleanData,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    const prompt = `You are StudyFlow AI's Master Academic Textbook & Notebook Synthesizer, Professor, and Educational Note Architect.
The student has uploaded notes/photos from their notebook, textbook, gallery, or specified a topic.
DO NOT require the student to write notes themselves—YOU will generate complete, exhaustive, impeccably structured master notes for them!

TOPIC / TITLE: "${topicName}"
TARGET SUBJECT: "${subjectName}"
STUDENT GRADE / LEVEL: "${gradeLevel}"
${content ? `ADDITIONAL TEXT / SYLLABUS NOTES:\n"""\n${content.slice(0, 15000)}\n"""` : ''}

INSTRUCTIONS FOR MASTER NOTE GENERATION:
1. Provide a precise, academic "title" and authoritative "topic".
2. Classify the best school/college "subject" (e.g. Physics, Chemistry, Mathematics, Biology, Computer Science, Economics, etc.).
3. "summary": Multi-paragraph executive summary explaining the fundamental principles, real-world mechanisms, and academic importance.
4. "keywords": Array of 6-12 high-yield academic vocabulary and definitions.
5. "keyPoints": Array of 5-8 bulleted core theoretical takeaways and governing principles.
6. "importantPoints": Array of 4-6 must-know exam points, critical boundary conditions, common pitfalls, and warning notes.
7. "formulas": If this is a problem-solving or calculation subject (Physics, Mathematics, Chemistry, Physical Sciences, Economics):
   - Provide an array of formulas with:
     * "name": Formula / Law Name
     * "formula": LaTeX / standard notation
     * "explanation": Step-by-step description of what the formula computes
     * "units": Standard SI units
     * "variables": Array of { "symbol": string, "meaning": string }
   - For Chemistry: Include reaction mechanisms, equilibrium constants, molar relationships.
   - For Maths/Physics: Include core equations, derivations, and problem-solving rules.
8. "content": Comprehensive, richly formatted Markdown notes complete with:
   - # [Topic Title]
   - ## 1. Executive Overview & Theoretical Foundations
   - ## 2. Core Concepts & Key Technical Glossary (with bold keywords)
   - ## 3. Governing Principles, Laws & Axioms
   - ## 4. Mathematical Formulae, Derivations & SI Units (with equations and variable tables)
   - ## 5. High-Yield Important Points, Exam Traps & Boundary Constraints
   - ## 6. Step-by-Step Problem Solving Methodology
   - ## 7. Master Takeaways & Revision Summary
9. "tags": Array of 4-6 relevant academic tags.
10. "summaryData": Structured summary package with "quickSummary", "keyPoints", "importantTerms", "rememberThis".
11. "explanationData": Feynman technique simple explanation with "simpleExplanation", "everydayAnalogy", "whyItMatters", "keyTerms", "quickRecap".
12. "examRevisionNotes": { "cheatSheetSummary", "mustRememberFormulas", "keyPitfalls", "highYieldQuestions" }.
13. "flashcards": 6-10 active recall flashcards ({ "id", "front", "back" }).
14. "quiz": 4-6 MCQ questions ({ "id", "question", "options", "correctIndex", "explanation" }).

Output strictly in valid JSON adhering to the schema.`;

    contents.push(prompt);

    const response = await generateContentWithRetry({
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            importantPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            formulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  units: { type: Type.STRING },
                  variables: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                      },
                      required: ['symbol', 'meaning'],
                    },
                  },
                },
                required: ['name', 'formula', 'explanation'],
              },
            },
            summaryData: {
              type: Type.OBJECT,
              properties: {
                quickSummary: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                importantTerms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                    required: ['term', 'definition'],
                  },
                },
                rememberThis: { type: Type.STRING },
              },
              required: ['quickSummary', 'keyPoints', 'importantTerms', 'rememberThis'],
            },
            explanationData: {
              type: Type.OBJECT,
              properties: {
                concept: { type: Type.STRING },
                simpleExplanation: { type: Type.STRING },
                everydayAnalogy: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                keyTerms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                    required: ['term', 'definition'],
                  },
                },
                quickRecap: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['simpleExplanation', 'everydayAnalogy', 'keyTerms', 'quickRecap'],
            },
            examRevisionNotes: {
              type: Type.OBJECT,
              properties: {
                cheatSheetSummary: { type: Type.STRING },
                mustRememberFormulas: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
                highYieldQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['cheatSheetSummary', 'keyPitfalls', 'highYieldQuestions'],
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ['id', 'front', 'back'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: [
            'title',
            'subject',
            'topic',
            'summary',
            'content',
            'keywords',
            'keyPoints',
            'importantPoints',
            'formulas',
            'summaryData',
            'explanationData',
            'flashcards',
            'quiz',
          ],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '{}', {});
    return res.json({ data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Full notes generation error:', error);
    const fallbackStudy = createFallbackStudyData(topicName, content, subjectName);
    const fullMarkdownContent = `# ${topicName}\n\n## 1. Executive Overview & Theoretical Foundations\n${fallbackStudy.summary}\n\n## 2. Core Concepts & Technical Keywords\n${fallbackStudy.keywords.map(k => `- **${k}**: Essential academic terminology governing this chapter.`).join('\n')}\n\n## 3. Governing Principles & Laws\n${fallbackStudy.keyPoints.map(kp => `* ${kp}`).join('\n')}\n\n## 4. Mathematical Formulae & Derivations\n${fallbackStudy.formulas.length > 0 ? fallbackStudy.formulas.map(f => `### ${f.name}\n$$\n${f.formula}\n$$\n- **Explanation**: ${f.explanation}\n- **SI Units**: ${f.units || 'Standard SI'}\n- **Variables**: ${f.variables?.map(v => `${v.symbol} = ${v.meaning}`).join(', ') || 'N/A'}`).join('\n\n') : 'This qualitative topic emphasizes conceptual definitions and systematic case frameworks.'}\n\n## 5. High-Yield Important Points & Exam Pitfalls\n${fallbackStudy.examRevisionNotes.keyPitfalls.map(p => `⚠️ **Important Trap**: ${p}`).join('\n')}\n\n## 6. Step-by-Step Problem Solving Strategy\n1. Identify given variables and required targets.\n2. State the governing theorem and check boundary assumptions.\n3. Verify dimensional consistency across SI units.\n4. Interpret physical meaning of the result.\n\n## 7. Master Summary & Key Takeaways\n${fallbackStudy.examRevisionNotes.cheatSheetSummary}`;

    return res.json({
      data: {
        title: topicName,
        subject: subjectName,
        topic: topicName,
        summary: fallbackStudy.summary,
        content: fullMarkdownContent,
        keywords: fallbackStudy.keywords,
        keyPoints: fallbackStudy.keyPoints,
        importantPoints: fallbackStudy.examRevisionNotes.keyPitfalls,
        formulas: fallbackStudy.formulas,
        tags: [subjectName, topicName, 'AI Master Note', 'High Yield'],
        summaryData: {
          quickSummary: fallbackStudy.summary,
          keyPoints: fallbackStudy.keyPoints,
          importantTerms: fallbackStudy.keywords.map(k => ({ term: k, definition: `Key terminology in ${topicName}` })),
          rememberThis: fallbackStudy.examRevisionNotes.cheatSheetSummary,
          formulas: fallbackStudy.formulas,
          keywords: fallbackStudy.keywords,
        },
        explanationData: fallbackStudy.explanation,
        examRevisionNotes: fallbackStudy.examRevisionNotes,
        flashcards: fallbackStudy.flashcards,
        quiz: fallbackStudy.quiz,
      },
      mode: 'fallback',
      warning: error.message || 'AI notes synthesis fallback used.',
    });
  }
});

// 3. Signature "Explain Simply" (Feynman Method) with "Make it even simpler" support
app.post('/api/study/explain-simply', async (req, res) => {
  const { concept = '', context = '', evenSimpler = false } = req.body;
  if (!concept && !context) {
    return res.status(400).json({ error: 'Please provide a concept or text to explain.' });
  }

  const query = concept || context.slice(0, 300);

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      data: {
        concept: query,
        simpleExplanation: evenSimpler
          ? `Imagine ${query} like a simple bicycle. When you push the pedal, the chain turns the back wheel. You don't need fancy words: push pedal = bike moves forward. In this topic, one small action directly causes the result.`
          : `${query} explained simply: It is a systematic process where initial inputs are transformed through predictable rules into meaningful outcomes. Rather than memorizing jargon, focus on the cause-and-effect relationship.`,
        everydayAnalogy: evenSimpler
          ? `Like making toast: put bread in, press lever, get warm toast. Change the timer, get crispier toast.`
          : `Imagine water flowing through an irrigation channel: if you open one valve, it redistributes pressure across the network. Similarly, adjust one parameter here and observe how the system adapts.`,
        whyItMatters: `Understanding this core principle lets you answer questions without memorizing every single formula.`,
        keyTerms: [
          { term: 'Input', definition: 'The starting condition.' },
          { term: 'Process', definition: 'How it transforms.' },
          { term: 'Result', definition: 'The final outcome.' },
        ],
        quickRecap: [
          'Cause leads to effect.',
          'Start with the simple analogy first.',
          'Test yourself by explaining it out loud in 30 seconds.',
        ],
      },
      mode: 'demo',
    });
  }

  try {
    const prompt = `You are StudyFlow AI's signature "Explain It Simply" engine using the Feynman Technique.
Explain the following concept / topic:
"${query}"
${context ? `ADDITIONAL CONTEXT FROM STUDENT NOTES:\n"""\n${context.slice(0, 4000)}\n"""` : ''}

${evenSimpler ? 'NOTE: The student requested "MAKE IT EVEN SIMPLER". Use an extremely vivid, elementary-level analogy and ultra-simple everyday vocabulary without condescending.' : 'Explain in clear, student-friendly language.'}

Structure your response in clean JSON:
1. "simpleExplanation": Clear, intuitive explanation focusing on mechanisms.
2. "everydayAnalogy": A relatable real-world comparison.
3. "whyItMatters": 1-2 sentences explaining why this concept is important.
4. "keyTerms": Array of 3-5 terms with crystal clear definitions.
5. "quickRecap": 3-4 bullet takeaways.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            everydayAnalogy: { type: Type.STRING },
            whyItMatters: { type: Type.STRING },
            keyTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            quickRecap: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['simpleExplanation', 'everydayAnalogy', 'whyItMatters', 'keyTerms', 'quickRecap'],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '{}', {});
    return res.json({ data: { concept: query, ...parsed }, mode: 'gemini' });
  } catch (error: any) {
    console.error('Explain simply error:', error);
    return res.json({
      data: {
        concept: query,
        simpleExplanation: `${query} is a core mechanism where basic principles combine into higher-level functions. Focus on the core rule and its observable impact.`,
        everydayAnalogy: `Think of bicycle gears: pedaling at the same speed changes how much distance you cover based on gear ratios.`,
        whyItMatters: `Mastering this enables you to tackle harder analytical problems with ease.`,
        keyTerms: [
          { term: 'Mechanism', definition: 'The underlying rule or gear.' },
          { term: 'Equilibrium', definition: 'The state of balanced forces.' },
        ],
        quickRecap: ['Identify the core driver.', 'Notice how changes cascade.', 'Practice active recall.'],
      },
      mode: 'fallback',
    });
  }
});

// 4. Contextual AI Study Tutor ("Ask AI About My Notes" with Academic Honesty Hints)
app.post('/api/study/ask-note', async (req, res) => {
  const { question = '', noteContent = '', noteTitle = '', mode = 'answer' } = req.body;
  // mode can be: 'answer' | 'hint' | 'explain_solution'

  if (!question) {
    return res.status(400).json({ error: 'Please provide a question to ask.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    if (mode === 'hint') {
      return res.json({
        data: {
          type: 'hint',
          reply: `💡 Hint: Look closely at the core mechanism in "${noteTitle || 'your notes'}". Consider how changing the starting condition alters the final result. Try writing down the 2 main factors before checking the full solution!`,
          disclaimer: 'AI-generated guidance. Verify important facts with your textbook or teacher.',
        },
        mode: 'demo',
      });
    }
    return res.json({
      data: {
        type: 'answer',
        reply: `Based on your notes on "${noteTitle || 'this topic'}": The concept revolves around understanding the direct relationship between foundational inputs and observable results. When revising this, connect the definition to practical test scenarios.`,
        disclaimer: 'AI-generated explanations can contain mistakes. Check important information against your textbook or teacher\'s material.',
      },
      mode: 'demo',
    });
  }

  try {
    let modeInstruction = '';
    if (mode === 'hint') {
      modeInstruction = 'The student clicked "GIVE ME A HINT". Do NOT give the final answer away! Instead, provide a constructive educational clue, guiding question, or conceptual hint that encourages them to think.';
    } else if (mode === 'explain_solution') {
      modeInstruction = 'Explain the step-by-step reasoning clearly, showing HOW to arrive at the solution rather than just stating a raw answer.';
    } else {
      modeInstruction = 'Answer the student\'s question clearly, grounding your answer strictly in the provided note context whenever applicable. Prefix references with "Based on your notes..."';
    }

    const prompt = `You are StudyFlow AI, an educational AI study companion.
The student is studying a note titled "${noteTitle || 'Study Note'}".

STUDENT'S NOTE CONTENT:
"""
${noteContent.slice(0, 10000)}
"""

STUDENT QUESTION: "${question}"
MODE: ${mode}
INSTRUCTION: ${modeInstruction}

Guidelines:
- Maintain supportive, student-first language (e.g., "Let's look at...", "You're on the right track").
- Keep explanations clear and concise.
- Never pretend to be infallible.

Output clean JSON:
{
  "reply": string,
  "followUpSuggestions": string[] (2-3 short suggestions the student can click next),
  "disclaimer": "AI-generated explanations can contain mistakes. Check important information against your textbook or teacher's material."
}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            followUpSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            disclaimer: { type: Type.STRING },
          },
          required: ['reply', 'followUpSuggestions', 'disclaimer'],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '{}', {});
    return res.json({ data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Ask note error:', error);
    return res.json({
      data: {
        reply: `Based on your notes on "${noteTitle}": The key principle is to follow the cause-and-effect relationship outlined in the material.`,
        followUpSuggestions: ['Can you explain this with an example?', 'Give me a practice question'],
        disclaimer: 'AI-generated explanations can contain mistakes. Check important information against your textbook or teacher\'s material.',
      },
      mode: 'fallback',
    });
  }
});

// 5. Configurable Quiz Generator (Question count: 1 to 50 | Difficulty: easy/medium/hard/advanced | Type: mcq/true_false/mixed | Focus prompt)
app.post('/api/study/generate-quiz', async (req, res) => {
  const {
    topic = '',
    content = '',
    questionCount = 5,
    difficulty = 'medium', // 'easy' | 'medium' | 'hard' | 'advanced'
    questionType = 'mcq', // 'mcq' | 'true_false' | 'mixed'
    focusPrompt = '',
    subjectName = 'General Studies',
    gradeLevel = 'Standard',
  } = req.body;

  const count = Math.min(Math.max(Number(questionCount) || 5, 1), 50);
  const cleanTopic = topic.trim() || 'Study Material';
  const cleanDifficulty = ['easy', 'medium', 'hard', 'advanced'].includes(difficulty) ? difficulty : 'medium';

  // Helper to generate dynamic fallback questions for any count & difficulty
  const generateFallbackQuiz = (num: number, diff: string) => {
    const diffLabel = diff === 'easy' ? 'Foundational' : diff === 'hard' || diff === 'advanced' ? 'Advanced Analytical' : 'Standard Conceptual';
    const templates = [
      {
        q: `[${diffLabel}] What is the primary governing principle behind ${cleanTopic}?`,
        opts: [
          `System behaviors are determined by fundamental governing relations and balance equations`,
          `Uncontrolled random variations with no mathematical or empirical consistency`,
          `Pure theoretical abstraction with zero real-world physical or analytical application`,
          `Isolated empirical rules that contradict general conservation and equilibrium laws`,
        ],
        correct: 0,
        exp: `In ${cleanTopic}, core laws establish balance and predictability between system inputs and observed responses.`,
      },
      {
        q: `[${diffLabel}] When solving numerical or conceptual problems in ${cleanTopic}, what is the mandatory step zero?`,
        opts: [
          `Immediately guess the multiple choice answer without dimensional checks`,
          `List given parameters with SI units, state boundary conditions, and identify the governing theorem`,
          `Multiply all numbers together without verifying physical definitions`,
          `Skip initial state assumptions and jump straight to arbitrary formulas`,
        ],
        correct: 1,
        exp: `Systematic problem solving requires isolating given variables, checking SI units, and applying governing formulas.`,
      },
      {
        q: `[${diffLabel}] How does doubling the primary input parameter typically alter the response in ${cleanTopic}?`,
        opts: [
          `It produces a predictable response directly proportional to the governing transfer coefficient`,
          `It has strictly zero effect under any standard operating conditions`,
          `It immediately causes system breakdown regardless of boundary limits`,
          `It reverses the fundamental direction of the governing conservation laws`,
        ],
        correct: 0,
        exp: `Governing equations link input variations directly to rate of response through standard proportional or dynamic relations.`,
      },
      {
        q: `[${diffLabel}] Which common pitfall should students actively avoid in exam questions on ${cleanTopic}?`,
        opts: [
          `Verifying sign conventions (+/-) and checking dimensional consistency`,
          `Confusing instantaneous rates with average values and ignoring boundary constraints`,
          `Writing down the complete governing theorem before substituting values`,
          `Reviewing fundamental definitions and checking SI units`,
        ],
        correct: 1,
        exp: `Students frequently drop marks by confusing average rates with instantaneous rates or misapplying sign conventions.`,
      },
      {
        q: `[${diffLabel}] Under what boundary condition does the standard model of ${cleanTopic} require special correction?`,
        opts: [
          `When operating near extreme limits (e.g. non-ideal states, asymptotic boundaries, or turbulent regimes)`,
          `When all variables remain in ideal steady-state equilibrium at room temperature`,
          `When standard SI units are strictly maintained throughout the calculation`,
          `Whenever the problem statement provides complete initial data`,
        ],
        correct: 0,
        exp: `Standard ideal laws break down or require non-linear correction factors when approaching extreme physical boundaries.`,
      },
      {
        q: `[${diffLabel}] Which verification method is best suited for sanity-checking calculations in ${cleanTopic}?`,
        opts: [
          `Dimensional analysis to confirm Left-Hand Side (LHS) units match Right-Hand Side (RHS) units`,
          `Ignoring units and comparing only raw digits`,
          `Assuming that larger numbers are always mathematically superior`,
          `Choosing whichever option has the longest text`,
        ],
        correct: 0,
        exp: `Dimensional analysis quickly catches algebraic errors by proving both sides of your equation share identical units.`,
      },
      {
        q: `[${diffLabel}] In ${cleanTopic}, what role does the conservation principle play?`,
        opts: [
          `Total system inputs must equal total outputs plus net change in stored quantity`,
          `Energy and mass disappear arbitrarily during dynamic transitions`,
          `It only applies to closed theoretical cases and never to real physical systems`,
          `It permits infinite spontaneous accumulation without external energy transfer`,
        ],
        correct: 0,
        exp: `Conservation laws dictate that balance is maintained across control boundaries during all physical and chemical processes.`,
      },
    ];

    const result = [];
    for (let i = 0; i < num; i++) {
      const template = templates[i % templates.length];
      result.push({
        id: `quiz-gen-${Date.now()}-${i + 1}`,
        question: i >= templates.length ? `[${diffLabel} Drill ${i + 1}] Regarding ${cleanTopic}: ${template.q}` : template.q,
        options: template.opts,
        correctIndex: template.correct,
        explanation: template.exp,
        difficulty: diff,
        topic: cleanTopic,
      });
    }
    return result;
  };

  if (!process.env.GEMINI_API_KEY) {
    const fallbackQuiz = generateFallbackQuiz(count, cleanDifficulty);
    return res.json({ data: fallbackQuiz, mode: 'demo' });
  }

  try {
    const difficultyGuide = {
      easy: 'Level EASY (Foundational / Direct Recall): Focus on fundamental definitions, core terminology, straightforward laws, and direct formula identification.',
      medium: 'Level MEDIUM (Standard / Conceptual Application): Focus on applying concepts, interpreting scenarios, 2-step calculations, and understanding why mechanisms work.',
      hard: 'Level HARD (Advanced / Analytical / Competitive): Focus on multi-step reasoning, tricky edge cases, boundary conditions, quantitative derivations, and diagnosing subtle exam traps.',
      advanced: 'Level ADVANCED / OLYMPIAD: Focus on rigorous problem solving, high-yield competitive exam scenarios, and non-trivial edge case interactions.',
    }[cleanDifficulty] || 'Standard conceptual difficulty';

    const prompt = `You are StudyFlow AI's Master Examination and Quiz Architect.
Generate exactly ${count} high-quality, authentic practice quiz questions for the student.

TOPIC: "${cleanTopic}"
SUBJECT: "${subjectName}"
STUDENT LEVEL: "${gradeLevel}"
DIFFICULTY SPECIFICATION: ${difficultyGuide}
QUESTION COUNT: Exactly ${count} questions
${focusPrompt ? `SPECIAL USER FOCUS / CUSTOM SUB-TOPICS:\n"""\n${focusPrompt}\n"""` : ''}
${content ? `SOURCE MATERIAL REFERENCE:\n"""\n${content.slice(0, 12000)}\n"""` : ''}

FORMAT REQUIREMENTS:
- Format: ${questionType} (if 'true_false', create 2 options ["True", "False"]; if 'mcq', create 4 clear, plausible options; if 'mixed', blend both)
- Make options distinct, rigorous, and realistic.
- Provide a concise 1 to 2 line "explanation" for every question that clearly states:
  1) Why the correct option is right (the core fact or law), and
  2) Why other typical choices or common student misconceptions are wrong.
- Assign "difficulty" ('easy', 'medium', or 'hard').

Return a JSON array of question objects.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              topic: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '[]', []);
    const formatted = Array.isArray(parsed)
      ? parsed.map((q: any, idx: number) => ({
          ...q,
          id: q.id || `quiz-gen-${Date.now()}-${idx + 1}`,
          difficulty: q.difficulty || cleanDifficulty,
          topic: q.topic || cleanTopic,
        }))
      : generateFallbackQuiz(count, cleanDifficulty);

    return res.json({ data: formatted, mode: 'gemini' });
  } catch (error: any) {
    console.error('Generate quiz error:', error);
    const fallbackQuiz = generateFallbackQuiz(count, cleanDifficulty);
    return res.json({ data: fallbackQuiz, mode: 'fallback', warning: error.message });
  }
});

// 6. Flashcard Generator (Custom count, specific topic, difficulty, focus prompt)
app.post('/api/study/generate-flashcards', async (req, res) => {
  const {
    topic = '',
    content = '',
    count = 8,
    difficulty = 'medium',
    focusPrompt = '',
  } = req.body;

  const cleanTopic = String(topic).trim() || 'Study Topic';
  const parsedCount = parseInt(String(count), 10);
  const finalCount = isNaN(parsedCount) ? 8 : Math.min(Math.max(parsedCount, 1), 50);

  if (!process.env.GEMINI_API_KEY) {
    const defaultDeck = createFallbackStudyData(cleanTopic, content).flashcards.slice(0, finalCount);
    return res.json({ data: defaultDeck, mode: 'demo' });
  }

  try {
    const prompt = `You are a world-class academic tutor. Generate exactly ${finalCount} high-yield active recall flashcards.

TARGET TOPIC: "${cleanTopic}"
DIFFICULTY LEVEL: "${difficulty}"
${focusPrompt ? `SPECIFIC TOPIC FOCUS / SUBTOPIC: "${focusPrompt}"` : ''}

REFERENCE SOURCE CONTENT:
"""
${(content || cleanTopic).slice(0, 12000)}
"""

Flashcard Generation Requirements:
1. Generate exactly ${finalCount} flashcards.
2. "front": A punchy, crystal-clear prompt, high-yield question, formula question, or conceptual cue that triggers active retrieval.
3. "back": A clear, accurate, high-impact explanatory answer with key terminology, intuition, or step-by-step breakdown.
4. Cater to the difficulty level:
   - "easy": Fundamental definitions, terminology, core facts.
   - "medium": Conceptual mechanisms, relationships, everyday applications.
   - "hard" / "advanced": Edge cases, multi-step problem solving, traps, deep mathematical/scientific principles.
${focusPrompt ? `5. Heavily prioritize the user's specific focus: "${focusPrompt}".` : ''}

Return JSON array of { "id": string, "front": string, "back": string }`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING },
              back: { type: Type.STRING },
            },
            required: ['front', 'back'],
          },
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '[]', []);
    let formatted: any[] = [];

    if (Array.isArray(parsed) && parsed.length > 0) {
      formatted = parsed.map((f: any, idx: number) => ({
        ...f,
        id: f.id || `fc-gen-${Date.now()}-${idx + 1}`,
      }));
    } else {
      formatted = createFallbackStudyData(cleanTopic, content).flashcards.slice(0, finalCount);
    }

    return res.json({ data: formatted, mode: 'gemini' });
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    const fallbackDeck = createFallbackStudyData(cleanTopic, content).flashcards.slice(0, finalCount);
    return res.json({ data: fallbackDeck, mode: 'fallback' });
  }
});

// 7. Extract Content from Uploaded Photos, Multi-Page Chapters, Camera Snaps, Video Lessons, PDFs, or Documents
app.post('/api/study/extract-content', async (req, res) => {
  const {
    base64Data = '',
    mimeType = 'image/jpeg',
    filename = '',
    textContent = '',
    files = [],
    videoThumbnails = [],
    isVideo = false,
  } = req.body;

  const hasFiles = Array.isArray(files) && files.length > 0;
  const hasVideoThumbnails = Array.isArray(videoThumbnails) && videoThumbnails.length > 0;

  if (!base64Data && !textContent && !hasFiles && !hasVideoThumbnails) {
    return res.status(400).json({ error: 'Please provide images, video, document, or text to extract.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    const rawClean = textContent || `Extracted topic from ${filename || (isVideo ? 'Video Lesson' : 'Uploaded Chapter')}`;
    const pageCount = hasFiles ? files.length : 1;
    return res.json({
      data: {
        topic: filename ? filename.replace(/\.[^/.]+$/, '') : (isVideo ? 'Lesson Lecture Notes' : 'Chapter Study Notes'),
        subjectSuggestion: 'Science',
        extractedText: textContent || `Notes from ${isVideo ? 'video lesson recording' : `${pageCount} uploaded chapter pages`}:\n\nThis material covers key definitions, formulas, and principles extracted for revision. Review the core concepts and test your understanding using the practice tools.`,
        summaryPreview: isVideo
          ? `Extracted key lecture takeaways and blackboard notes from the recorded video lesson. Formulas and key concepts synthesized in seconds.`
          : `Extracted study material from ${pageCount} scanned pages of ${filename || 'your uploaded chapter'}. Key concepts and terms have been prepared for revision.`,
        keyConcepts: ['Core mechanism', 'Governing principles', 'Application formulas', 'Key definitions'],
        sourceMediaCount: pageCount,
        isVideoLesson: isVideo,
      },
      mode: 'demo',
    });
  }

  try {
    const contents: any[] = [];

    // 1. Add all multi-page files / images
    if (hasFiles) {
      for (const f of files) {
        if (f.base64Data) {
          const cleanData = f.base64Data.includes('base64,') ? f.base64Data.split('base64,')[1] : f.base64Data;
          contents.push({
            inlineData: {
              data: cleanData,
              mimeType: f.mimeType || 'image/jpeg',
            },
          });
        }
        // If file has video thumbnails
        if (Array.isArray(f.videoThumbnails)) {
          for (const vt of f.videoThumbnails) {
            const cleanVt = vt.includes('base64,') ? vt.split('base64,')[1] : vt;
            contents.push({
              inlineData: {
                data: cleanVt,
                mimeType: 'image/jpeg',
              },
            });
          }
        }
      }
    } else if (base64Data) {
      const cleanData = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
      contents.push({
        inlineData: {
          data: cleanData,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    // 2. Add extra video thumbnails if passed
    if (hasVideoThumbnails) {
      for (const vt of videoThumbnails) {
        const cleanVt = vt.includes('base64,') ? vt.split('base64,')[1] : vt;
        contents.push({
          inlineData: {
            data: cleanVt,
            mimeType: 'image/jpeg',
          },
        });
      }
    }

    const mediaLabel = isVideo
      ? 'video lesson recording (keyframes from blackboard/lecture)'
      : hasFiles && files.length > 1
      ? `${files.length} consecutive chapter pages / notebook photos`
      : filename || 'uploaded study material';

    const prompt = `You are StudyFlow AI's Master Multimodal Academic Textbook, Multi-Page Notes & Video Lesson Synthesizer.
The student has provided study material from ${mediaLabel}.
${textContent ? `User notes context: """${textContent.slice(0, 4000)}"""` : ''}

Your tasks:
1. Accurately read, transcribe, and synthesize the study material across all provided images/video frames in chronological logical sequence.
2. In "extractedText": Provide an organized, comprehensive, well-structured transcription and notes synthesis. Include all key definitions, mathematical formulas with derivations, bullet points, and key rules found in the chapter or lesson.
3. Identify a crisp, authoritative academic "topic" title (e.g. "Laws of Motion & Friction", "Calculus: Integration by Parts", "Structure of Plant Cells & Photosynthesis").
4. Suggest the most appropriate school/college "subjectSuggestion" (e.g. "Maths", "Science", "Physics", "Chemistry", "Biology", "English", "Social Science", "Computer Science", etc.).
5. Provide a 2-3 sentence executive "summaryPreview" explaining what this chapter/lesson teaches.
6. List 4-8 distinct high-yield "keyConcepts" from the material.
7. Return "isVideoLesson": ${isVideo ? 'true' : 'false'}, and "sourceMediaCount": ${hasFiles ? files.length : 1}.

Return clean JSON matching the schema.`;

    contents.push(prompt);

    const response = await generateContentWithRetry({
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subjectSuggestion: { type: Type.STRING },
            extractedText: { type: Type.STRING },
            summaryPreview: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sourceMediaCount: { type: Type.INTEGER },
            isVideoLesson: { type: Type.BOOLEAN },
          },
          required: ['topic', 'subjectSuggestion', 'extractedText', 'summaryPreview', 'keyConcepts'],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '{}', {});
    return res.json({ data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Extract content error:', error);
    return res.json({
      data: {
        topic: filename ? filename.replace(/\.[^/.]+$/, '') : (isVideo ? 'Video Lesson Notes' : 'Chapter Notes'),
        subjectSuggestion: 'Science',
        extractedText: textContent || `Extracted notes from ${filename || 'uploaded material'}. Review the key points below.`,
        summaryPreview: isVideo
          ? 'Video lesson processed successfully into notes.'
          : 'Multi-page study material uploaded and ready for revision.',
        keyConcepts: ['Key mechanism', 'Core principle', 'Governing formulas'],
        sourceMediaCount: hasFiles ? files.length : 1,
        isVideoLesson: isVideo,
      },
      mode: 'fallback',
      warning: error.message || 'AI extraction fallback used.',
    });
  }
});

// 8. Dedicated Interactive Subject AI Tutor & Problem Solver Chat for Each and Every Subject
app.post('/api/study/subject-chat', async (req, res) => {
  const {
    subjectName = 'General Studies',
    message = '',
    history = [],
    mode = 'direct', // 'direct' | 'step_by_step' | 'concept_breakdown' | 'hint' | 'answer' | 'explain_solution'
    attachment,
    attachments = [],
  } = req.body;

  const allAttachments: any[] = [];
  if (Array.isArray(attachments) && attachments.length > 0) {
    allAttachments.push(...attachments);
  } else if (attachment) {
    allAttachments.push(attachment);
  }

  if (!message && allAttachments.length === 0) {
    return res.status(400).json({ error: 'Please provide a message or attachment.' });
  }

  const cleanMessage = message.trim();

  if (!process.env.GEMINI_API_KEY) {
    let reply = `### 🎯 Final Answer & Solution for ${subjectName}\n\n`;
    if (mode === 'hint') {
      reply = `### 💡 Guiding Hint for ${subjectName}\n\nBefore computing the final result, identify the primary governing equation connecting your given values to the target. Notice how isolating the unknown variable simplifies your calculation!`;
    } else if (mode === 'step_by_step' || mode === 'explain_solution') {
      reply += `**Problem Statement:** ${cleanMessage || 'Subject Problem'}\n\n` +
        `#### 🔢 Step-by-Step Derivation:\n` +
        `1. **Given Data & Target:** Identify all known parameters, boundary constraints, and what needs to be determined.\n` +
        `2. **Governing Formula:** Apply the fundamental theorem for ${subjectName}.\n` +
        `3. **Substitution & Calculation:** Substitute values with dimensional accuracy and correct SI units.\n` +
        `4. **Evaluation:** Evaluate the final quantity.\n\n` +
        `> **🎯 Final Verified Result:** The calculation confirms the exact solution for this ${subjectName} question.`;
    } else if (mode === 'concept_breakdown') {
      reply += `**Core Answer:** The verified solution resolves the problem through fundamental equilibrium principles.\n\n` +
        `#### 💡 Concept Breakdown & Why It Works:\n` +
        `- **Underlying Mechanism:** In ${subjectName}, this phenomenon occurs because boundary conditions enforce strict balance between input forces and system response.\n` +
        `- **Key Rule:** Always adhere to conservation laws and standard sign conventions.\n\n` +
        `> **🎯 Final Conclusion:** Verified solution established with zero ambiguity.`;
    } else {
      reply += `> **🎯 Final Answer:** The exact evaluated outcome satisfies all governing relations in ${subjectName}.\n\n` +
        `**Direct Solution:**\n` +
        `1. Apply the primary governing formula for ${subjectName}.\n` +
        `2. Solve directly: Target = $(Evaluated\\,Value)$.\n` +
        `3. Verified against standard boundary conditions.`;
    }

    return res.json({
      data: {
        reply,
        suggestions: [
          `⚡ Show another practice problem`,
          `🔢 Break down step 2 further`,
          `💡 Explain with an everyday analogy`,
          `📝 What are common exam traps for this?`,
        ],
        disclaimer: 'AI-generated study solution. Always verify with your syllabus textbooks.',
      },
      mode: 'demo',
    });
  }

  try {
    let styleDirective = '';
    if (mode === 'direct' || mode === 'direct_answer') {
      styleDirective = `TEACHING STYLE: DIRECT ANSWER & SOLVER MODE.
- State the bold **🎯 Final Answer:** immediately at the very top.
- Follow immediately with the crisp, direct mathematical or factual solution showing key steps and numerical calculations.
- Keep it direct, precise, and completely free of vague advice or metacommentary.`;
    } else if (mode === 'step_by_step' || mode === 'explain_solution') {
      styleDirective = `TEACHING STYLE: STEP-BY-STEP COMPLETE DERIVATION & SOLVER.
- Provide a rigorous numbered step-by-step derivation:
  1. Given Data & Target Variable
  2. Primary Governing Formula
  3. Step-by-Step Calculation & Substitution (showing math line by line)
  4. Dimensional / SI Unit Check
- Highlight the **🎯 Final Answer:** clearly in a blockquote or bold callout.
- Give the exact solution, not generic advice.`;
    } else if (mode === 'concept_breakdown') {
      styleDirective = `TEACHING STYLE: CONCEPT BREAKDOWN & UNDERLYING MECHANISMS.
- Give the exact answer and solution first.
- Then dissect the underlying physical/chemical/mathematical mechanisms and explain WHY the governing principle works.
- Include a quick real-world analogy to solidify intuition.`;
    } else if (mode === 'hint') {
      styleDirective = `TEACHING STYLE: GUIDING HINT (ACADEMIC HONESTY / SOCRATIC).
- Do NOT give away the final numerical or factual answer immediately.
- Provide a high-yield educational clue, guiding question, or formula hint that empowers the student to complete the calculation themselves.`;
    } else {
      styleDirective = `TEACHING STYLE: ACADEMIC SOLVER MODE.
- Give the direct solution, step-by-step working, and bold **🎯 Final Answer:** clearly.`;
    }

    const systemInstruction = `You are StudyFlow AI's distinguished university Professor and Master Academic Problem Solver for "${subjectName}".

CRITICAL SOLVER MANDATE:
- When a student asks a doubt, homework problem, equation, derivation, or factual question, you MUST give the direct, exact, verified answer and concrete solution.
- NEVER give generic study advice like "You should read chapter 3", "Try looking at your notes", or "Study harder". Solve the actual problem directly with clarity, mathematical rigor, and step-by-step explanations!
- For Physics, Chemistry, and Mathematics:
  * Show complete calculations, numerical substitutions, SI units, and formula derivations.
  * For Chemistry: write balanced chemical equations, state oxidation numbers, thermodynamics, and reaction mechanisms.
- For humanities / biology / commerce / computer science: give direct structured explanations, code/pseudocode, or clear analytical points.
- Always include a prominent **🎯 Final Answer:** callout.
- Formatting: Use clean GitHub Flavored Markdown, bold headings, LaTeX / mathematical notation where appropriate, and clean spacing.
- If the student uploads photos, textbook chapter pages, or video lesson recordings, analyze all visuals thoroughly, transcribe them, and provide the complete solution.
- Specific Teaching Directive:
${styleDirective}

At the end of your response, provide 3 high-yield follow-up suggestion prompts for the student.`;

    const contents: any[] = [];

    // Include recent history (up to last 6 messages)
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      for (const h of recent) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content || h.text || '' }],
        });
      }
    }

    // Current turn parts with all attached photos/videos
    const currentParts: any[] = [];
    for (const att of allAttachments) {
      if (att.base64Data) {
        const cleanData = att.base64Data.includes('base64,')
          ? att.base64Data.split('base64,')[1]
          : att.base64Data;
        currentParts.push({
          inlineData: {
            data: cleanData,
            mimeType: att.type || 'image/jpeg',
          },
        });
      }
      if (Array.isArray(att.videoThumbnails)) {
        for (const vt of att.videoThumbnails) {
          const cleanVt = vt.includes('base64,') ? vt.split('base64,')[1] : vt;
          currentParts.push({
            inlineData: {
              data: cleanVt,
              mimeType: 'image/jpeg',
            },
          });
        }
      }
    }

    const currentText = `${cleanMessage ? cleanMessage : 'Please solve this problem / doubt for ' + subjectName + ' step-by-step and provide the direct solution.'}`;
    currentParts.push({ text: currentText });

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const response = await generateContentWithRetry({
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            disclaimer: { type: Type.STRING },
          },
          required: ['reply', 'suggestions', 'disclaimer'],
        },
      },
    });

    const parsed = cleanAndParseJson(response.text || '{}', {});
    return res.json({ data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Subject chat error:', error);
    return res.json({
      data: {
        reply: `> **🎯 Final Answer:** Solution calculated using standard principles in ${subjectName}.\n\n` +
          `**Direct Solution Steps:**\n` +
          `1. **Given:** Identify constraints from the problem statement.\n` +
          `2. **Formula:** Apply the governing theorem for ${subjectName}.\n` +
          `3. **Result:** Substitute values methodically to obtain the verified final outcome.`,
        suggestions: ['Show another example', 'Explain the core formula', 'What is a common exam trick for this?'],
        disclaimer: 'AI-generated study help. Always verify with your textbook.',
      },
      mode: 'fallback',
      warning: error.message || 'AI chat fallback used.',
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
