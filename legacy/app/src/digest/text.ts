/** Lowercased word tokens. Unicode-aware so Ukrainian (Cyrillic) words are kept;
 *  apostrophes and hyphens inside a word are preserved (e.g. "об'єкт"). */
export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[\p{L}][\p{L}\p{N}'’-]*/gu)
  return matches ?? []
}

/** Common English + Ukrainian function words excluded from scoring and tags. */
export const STOPWORDS: ReadonlySet<string> = new Set([
  // English
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'by',
  'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'of', 'as',
  'that', 'this', 'these', 'those', 'it', 'its', 'he', 'she', 'they', 'them',
  'his', 'her', 'their', 'we', 'you', 'your', 'our', 'me', 'my', 'not', 'no',
  'so', 'than', 'too', 'very', 'can', 'will', 'just', 'which', 'who', 'whom',
  'what', 'how', 'why', 'where', 'there', 'here', 'all', 'any', 'both', 'each',
  'more', 'most', 'other', 'some', 'such', 'said', 'also', 'into',
  // Ukrainian
  'і', 'й', 'та', 'але', 'що', 'як', 'це', 'цей', 'ця', 'то', 'бо', 'чи', 'не',
  'ні', 'на', 'в', 'у', 'з', 'із', 'зі', 'до', 'від', 'за', 'по', 'про', 'для',
  'над', 'під', 'при', 'без', 'через', 'між', 'після', 'перед', 'коли', 'де',
  'там', 'тут', 'він', 'вона', 'воно', 'вони', 'їх', 'його', 'її', 'ми', 'ви',
  'я', 'ти', 'мене', 'тебе', 'нас', 'вас', 'їм', 'же', 'ж', 'б', 'би', 'так',
  'теж', 'також', 'вже', 'ще', 'дуже', 'весь', 'вся', 'все', 'всі', 'який',
  'яка', 'яке', 'які', 'хто', 'чого', 'цьому', 'того', 'цих', 'тих', 'буде',
  'був', 'була', 'було', 'були', 'є', 'або', 'свій', 'своя', 'своє', 'тільки',
])
