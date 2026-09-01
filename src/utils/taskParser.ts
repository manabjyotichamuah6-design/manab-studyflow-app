import { StudyPlanTask, SubjectItem } from '../types';

/**
 * Parses raw input text into structured individual StudyPlanTask items.
 * Handles:
 * - Numbered sequences: "1. Task A 2. Task B 3. Task C" or "1)... 2)..."
 * - Comma and period separated phrases: "Revise Bio, Finish Math homework. Practice Chemistry quiz"
 * - Newlines and bulleted lists: "• Task 1\n• Task 2\n- Task 3"
 * - Auto-detects subjects, estimated minutes, and priority if written in task text.
 */
export function parseBulkTasksInput(
  rawText: string,
  availableSubjects: SubjectItem[],
  defaultDate: string,
  defaultSubjectName: string = 'Science',
  defaultMinutes: number = 30,
  defaultPriority: 'low' | 'medium' | 'high' = 'medium',
  defaultCategory: 'revision' | 'homework' | 'exam' | 'quiz' | 'project' | 'general' = 'revision'
): StudyPlanTask[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();
  const rawItems: string[] = [];

  // 1. Check if the text contains numbered items like "1. ... 2. ... 3. ..." or "1) ... 2) ..."
  // Regex looks for numbers followed by dot/parenthesis/dash with space or start of line
  const hasNumberedSequence = /(?:^|\s+)(?:\d+[\.\)\-:])\s+/g.test(text);

  if (hasNumberedSequence) {
    // Split by numbering markers while preserving segments
    // Matches patterns like "1.", "2)", "3-", "4:"
    const splitByNumbers = text
      .split(/(?:^|\s+)(?=\d+[\.\)\-:]\s+)/)
      .map((s) => s.replace(/^\s*\d+[\.\)\-:]\s*/, '').trim())
      .filter((s) => s.length > 0);

    if (splitByNumbers.length > 0) {
      rawItems.push(...splitByNumbers);
    }
  }

  // If no numbered sequence was found, or if only 1 item resulted but contains commas / fullstops / newlines
  if (rawItems.length === 0 || (rawItems.length === 1 && /[\n,;\.]/.test(rawItems[0]))) {
    const sourceText = rawItems.length === 1 ? rawItems[0] : text;

    // First split by newlines, semicolons
    const lines = sourceText.split(/[\r\n;]+/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check if line contains comma or period separation
      // Split on:
      // - Comma followed by whitespace: ", "
      // - Period followed by whitespace and a non-digit: ". (?=[a-zA-Z•\-])" (avoids breaking decimals like 3.14)
      // - Bullets: "•", "* ", "- "
      const segments = trimmedLine
        .split(/(?:,\s+|\.\s+(?=[a-zA-Z0-9•\-\[\]])|\s+[•*]\s+)/)
        .map((seg) => seg.replace(/^[•*\-\s\d\.\)\:]+/, '').replace(/[\.\,]+$/, '').trim())
        .filter((seg) => seg.length > 0);

      if (segments.length > 0) {
        rawItems.push(...segments);
      } else if (trimmedLine.length > 0) {
        const clean = trimmedLine.replace(/^[•*\-\s\d\.\)\:]+/, '').replace(/[\.\,]+$/, '').trim();
        if (clean) rawItems.push(clean);
      }
    }
  }

  // Deduplicate and process into tasks
  const tasks: StudyPlanTask[] = [];
  const baseTimestamp = Date.now();

  const subjectsLower = availableSubjects.map((s) => ({
    name: s.name,
    lower: s.name.toLowerCase(),
  }));

  rawItems.forEach((itemText, index) => {
    let cleanTopic = itemText.trim();
    if (!cleanTopic || cleanTopic.length < 2) return;

    // Detect subject from text (e.g. "Math: Calculus" or "[Physics] Newton law" or "Chemistry - Bonding")
    let detectedSubject = defaultSubjectName;
    for (const sub of subjectsLower) {
      const regex = new RegExp(`^(?:\\[?${sub.lower}\\]?[:\\-\\s]+|${sub.lower}\\s*-\\s*)`, 'i');
      if (regex.test(cleanTopic)) {
        detectedSubject = sub.name;
        cleanTopic = cleanTopic.replace(regex, '').trim();
        break;
      }
    }

    // Detect duration from text like (30m), (45 min), (1h), (1 hour)
    let detectedMinutes = defaultMinutes;
    const durationMatch = cleanTopic.match(/\((\d+)\s*(?:m|min|mins|minutes)\)/i) ||
      cleanTopic.match(/\b(\d+)\s*(?:m|min|mins|minutes)\b/i);
    if (durationMatch) {
      detectedMinutes = parseInt(durationMatch[1], 10) || defaultMinutes;
      cleanTopic = cleanTopic.replace(durationMatch[0], '').trim();
    } else {
      const hourMatch = cleanTopic.match(/\((\d+)\s*(?:h|hr|hrs|hour|hours)\)/i) ||
        cleanTopic.match(/\b(\d+)\s*(?:h|hr|hrs|hour|hours)\b/i);
      if (hourMatch) {
        detectedMinutes = (parseInt(hourMatch[1], 10) || 1) * 60;
        cleanTopic = cleanTopic.replace(hourMatch[0], '').trim();
      }
    }

    // Detect priority from text
    let detectedPriority = defaultPriority;
    if (/\b(high|urgent|critical|exam|important|🔥)\b/i.test(cleanTopic)) {
      detectedPriority = 'high';
      cleanTopic = cleanTopic.replace(/\b(high priority|high|urgent|critical|important|🔥)\b/gi, '').trim();
    } else if (/\b(low|easy|optional|🌱)\b/i.test(cleanTopic)) {
      detectedPriority = 'low';
      cleanTopic = cleanTopic.replace(/\b(low priority|low|easy|optional|🌱)\b/gi, '').trim();
    }

    // Clean up residual punctuation at start/end
    cleanTopic = cleanTopic.replace(/^[:\-\–\—\s,.]+/, '').replace(/[:\-\–\—\s,.]+$/, '').trim();

    if (!cleanTopic) return;

    // Create individual task item
    tasks.push({
      id: `task-${baseTimestamp}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      subject: detectedSubject,
      topic: cleanTopic,
      availableMinutes: detectedMinutes,
      targetDate: defaultDate,
      priority: detectedPriority,
      category: defaultCategory,
      completed: false,
      createdAt: new Date().toISOString(),
      order: index,
    });
  });

  return tasks;
}
