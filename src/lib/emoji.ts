const emojiMap: [string, string][] = [
  ['pizza', '🍕'],
  ['pasta', '🍝'],
  ['spaghetti', '🍝'],
  ['sushi', '🍣'],
  ['burger', '🍔'],
  ['hamburger', '🍔'],
  ['taco', '🌮'],
  ['tacos', '🌮'],
  ['chicken', '🍗'],
  ['steak', '🥩'],
  ['beef', '🥩'],
  ['salad', '🥗'],
  ['soup', '🍜'],
  ['ramen', '🍜'],
  ['noodle', '🍜'],
  ['noodles', '🍜'],
  ['chinese', '🥡'],
  ['indian', '🍛'],
  ['curry', '🍛'],
  ['thai', '🍲'],
  ['mexican', '🌮'],
  ['italian', '🍝'],
  ['japanese', '🍱'],
  ['korean', '🥘'],
  ['bbq', '🔥'],
  ['barbecue', '🔥'],
  ['fish', '🐟'],
  ['seafood', '🦞'],
  ['lobster', '🦞'],
  ['shrimp', '🦐'],
  ['sandwich', '🥪'],
  ['hotdog', '🌭'],
  ['fries', '🍟'],
  ['wings', '🍗'],
  ['ribs', '🍖'],
  ['kebab', '🥙'],
  ['wrap', '🌯'],
  ['poke', '🍚'],
  ['rice', '🍚'],
  ['dumpling', '🥟'],
  ['dumplings', '🥟'],
  ['gyoza', '🥟'],
  ['cake', '🎂'],
  ['dessert', '🍰'],
  ['ice cream', '🍦'],
  ['icecream', '🍦'],
  ['cook', '👨‍🍳'],
  ['home', '🏠'],
  ['delivery', '🛵'],
  ['takeaway', '🥡'],
  ['takeout', '🥡'],
  ['vegetarian', '🥦'],
  ['vegan', '🥑'],
  ['pho', '🍜'],
  ['burrito', '🌯'],
  ['quesadilla', '🫓'],
  ['nachos', '🧀'],
  ['falafel', '🧆'],
  ['hummus', '🧆'],
  ['greek', '🫒'],
  ['mediterranean', '🫒'],
  ['brunch', '🥞'],
  ['breakfast', '🍳'],
  ['pancake', '🥞'],
  ['waffle', '🧇'],
  ['donut', '🍩'],
  ['coffee', '☕'],
  ['beer', '🍺'],
  ['wine', '🍷'],
  ['cocktail', '🍹'],
  ['fancy', '✨'],
  ['cheap', '💰'],
  ['fast food', '🍟'],
  ['mcdonalds', '🍔'],
  ['kfc', '🍗'],
]

export function getEmoji(text: string): string {
  const lower = text.toLowerCase()
  for (const [keyword, emoji] of emojiMap) {
    if (lower.includes(keyword)) return emoji
  }
  return '🍽️'
}

export function deduplicateText(text: string): string {
  return text.trim().toLowerCase()
}

export function isDuplicate(newText: string, existingTexts: string[]): boolean {
  const normalized = deduplicateText(newText)
  return existingTexts.some(t => deduplicateText(t) === normalized)
}
