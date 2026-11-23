import type { IconId } from '@/src/types/domain';
import { ICON_IDS } from '@/src/types/domain';

/** Keyword rules, first hit wins (DESIGN §8.1). Words match whole, with simple plural/verb suffixes. */
const RULES: readonly (readonly [readonly string[], IconId])[] = [
  [['resume', 'cv', 'portfolio'], 'file-text'],
  [['code', 'coding', 'leetcode', 'build', 'app'], 'code'],
  [['exam', 'study', 'studies', 'read', 'course', 'lab', 'research', 'learn', 'chapter', 'revise', 'revision'], 'book-open'],
  [['interview', 'call', 'network', 'networking', 'meet', 'meeting', 'mentor'], 'users'],
  [['apply', 'application', 'submit', 'send', 'outreach', 'email'], 'send'],
  [['travel', 'trip', 'flight', 'visa', 'passport'], 'plane'],
  [['pack', 'bag', 'luggage', 'suitcase'], 'luggage'],
  [['save', 'money', 'budget', 'expense', 'savings', 'fund'], 'piggy-bank'],
  [['gym', 'run', 'workout', 'train', 'training', 'exercise'], 'dumbbell'],
  // extras beyond the DESIGN examples
  [['draft', 'essay', 'write', 'writing', 'outline', 'report', 'thesis'], 'file-text'],
  [['practice', 'rehearse', 'presentation', 'speech', 'pitch', 'talk'], 'mic'],
  [['graduate', 'graduation', 'degree', 'school', 'college', 'university'], 'graduation-cap'],
  [['job', 'internship', 'career', 'work', 'offer'], 'briefcase'],
  [['book', 'booking', 'hotel', 'location', 'venue'], 'map-pin'],
  [['photo', 'photos', 'camera', 'shoot'], 'camera'],
  [['pay', 'payment', 'bill', 'wallet', 'rent'], 'wallet'],
  [['launch', 'ship', 'release', 'deploy'], 'rocket'],
  [['review', 'check', 'midpoint', 'goal', 'scope'], 'target'],
  [['final', 'win', 'finish', 'celebrate'], 'trophy'],
  [['schedule', 'plan', 'calendar', 'deadline'], 'calendar'],
  [['health', 'doctor', 'love', 'family'], 'heart'],
  [['terminal', 'cli', 'server', 'linux'], 'terminal'],
];

const SUFFIX = '(?:s|es|ing|ed|d)?';

const COMPILED = RULES.map(([words, icon]) => ({
  re: new RegExp(`\\b(?:${words.join('|')})${SUFFIX}\\b`),
  icon,
}));

/** Offline keyword → icon suggestion. Default: `flag`. */
export function suggestIcon(title: string): IconId {
  const t = title.toLowerCase();
  if (t.includes('$')) return 'piggy-bank';
  for (const { re, icon } of COMPILED) if (re.test(t)) return icon;
  return 'flag';
}

export function isIconId(v: unknown): v is IconId {
  return typeof v === 'string' && (ICON_IDS as readonly string[]).includes(v);
}
