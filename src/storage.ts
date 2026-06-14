import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@auth_code_learn/streak';
const BEST_STREAK_KEY = '@auth_code_learn/best_streak';
const TOTAL_CORRECT_KEY = '@auth_code_learn/total_correct';

export type Stats = {
  streak: number;
  bestStreak: number;
  totalCorrect: number;
};

export async function loadStats(): Promise<Stats> {
  const [streak, bestStreak, totalCorrect] = await Promise.all([
    AsyncStorage.getItem(STREAK_KEY),
    AsyncStorage.getItem(BEST_STREAK_KEY),
    AsyncStorage.getItem(TOTAL_CORRECT_KEY),
  ]);

  return {
    streak: streak ? Number(streak) : 0,
    bestStreak: bestStreak ? Number(bestStreak) : 0,
    totalCorrect: totalCorrect ? Number(totalCorrect) : 0,
  };
}

export async function saveCorrectAttempt(current: Stats): Promise<Stats> {
  const streak = current.streak + 1;
  const bestStreak = Math.max(current.bestStreak, streak);
  const totalCorrect = current.totalCorrect + 1;

  await Promise.all([
    AsyncStorage.setItem(STREAK_KEY, String(streak)),
    AsyncStorage.setItem(BEST_STREAK_KEY, String(bestStreak)),
    AsyncStorage.setItem(TOTAL_CORRECT_KEY, String(totalCorrect)),
  ]);

  return { streak, bestStreak, totalCorrect };
}

export async function saveWrongAttempt(current: Stats): Promise<Stats> {
  await AsyncStorage.setItem(STREAK_KEY, '0');

  return { ...current, streak: 0 };
}
