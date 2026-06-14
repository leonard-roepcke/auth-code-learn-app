import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCode, generateCode } from './src/code';
import { loadStats, saveCorrectAttempt, saveWrongAttempt, type Stats } from './src/storage';

type Result = 'correct' | 'wrong' | null;

const CODE_LENGTH = 6;

export default function App() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(generateCode);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [ready, setReady] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadStats()
      .then(setStats)
      .finally(() => setReady(true));
  }, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  }, []);

  const startEntering = useCallback(() => {
    if (result !== null) {
      return;
    }
    setIsCodeVisible(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [result]);

  const startNextRound = useCallback(() => {
    setCode(generateCode());
    setInput('');
    setResult(null);
    setIsCodeVisible(true);
    dismissKeyboard();
  }, [dismissKeyboard]);

  useEffect(() => {
    if (isCodeVisible && result === null) {
      dismissKeyboard();
    }
  }, [code, dismissKeyboard, isCodeVisible, result]);

  const canEnter = !isCodeVisible && result === null;

  const handleSubmit = useCallback(async () => {
    if (!stats || !canEnter || input.length !== CODE_LENGTH) {
      return;
    }

    if (input === code) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const nextStats = await saveCorrectAttempt(stats);
      setStats(nextStats);
      setResult('correct');
      dismissKeyboard();
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const nextStats = await saveWrongAttempt(stats);
      setStats(nextStats);
      setResult('wrong');
      dismissKeyboard();
    }
  }, [canEnter, code, dismissKeyboard, input, stats]);

  useEffect(() => {
    if (canEnter && input.length === CODE_LENGTH && result === null) {
      void handleSubmit();
    }
  }, [canEnter, handleSubmit, input.length, result]);

  if (!ready || !stats) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.gradient}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Auth Code Trainer</Text>
          <Text style={styles.subtitle}>Merke dir den Code und tippe ihn ein</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{stats.streak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rekord</Text>
            <Text style={styles.statValue}>{stats.bestStreak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Richtig</Text>
            <Text style={styles.statValue}>{stats.totalCorrect}</Text>
          </View>
        </View>

        {isCodeVisible ? (
          <Pressable
            onPress={startEntering}
            style={({ pressed }) => [styles.codeCard, pressed && styles.codeCardPressed]}
          >
            <Text style={styles.codeLabel}>Aktueller Code</Text>
            <Text style={styles.codeValue}>{formatCode(code)}</Text>
            <Text style={styles.hintText}>Tippe auf den Code, wenn du bereit bist</Text>
          </Pressable>
        ) : (
          <View style={styles.codeCardHidden}>
            <Text style={styles.codeLabelHidden}>Code ausgeblendet</Text>
            <Text style={styles.hintText}>Gib den Code aus dem Gedächtnis ein</Text>
          </View>
        )}

        {!isCodeVisible && (
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Code eingeben</Text>
            <Pressable onPress={() => inputRef.current?.focus()} style={styles.pinRow}>
              {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                const digit = input[index] ?? '';
                const filled = digit !== '';
                const active = canEnter && input.length === index && result === null;

                return (
                  <View
                    key={index}
                    style={[
                      styles.pinCell,
                      filled && styles.pinCellFilled,
                      active && styles.pinCellActive,
                      result === 'correct' && styles.pinCellSuccess,
                      result === 'wrong' && styles.pinCellError,
                    ]}
                  >
                    <Text style={styles.pinDigit}>{digit}</Text>
                  </View>
                );
              })}
            </Pressable>

            <TextInput
              ref={inputRef}
              value={input}
              editable={canEnter}
              showSoftInputOnFocus={canEnter}
              onChangeText={(value) => {
                if (!canEnter || result !== null) {
                  return;
                }
                setInput(value.replace(/\D/g, '').slice(0, CODE_LENGTH));
              }}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              caretHidden
            />
          </View>
        )}

        {result && (
          <View
            style={[
              styles.resultBanner,
              result === 'correct' ? styles.resultSuccess : styles.resultError,
            ]}
          >
            <Text style={styles.resultTitle}>
              {result === 'correct' ? 'Richtig!' : 'Falsch!'}
            </Text>
            <Text style={styles.resultText}>
              {result === 'correct'
                ? 'Super — dein Streak steigt weiter.'
                : `Der richtige Code war ${formatCode(code)}.`}
            </Text>
          </View>
        )}

        {result && (
          <Pressable style={styles.nextButton} onPress={startNextRound}>
            <Text style={styles.nextButtonText}>Nächster Code</Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  codeCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    gap: 8,
  },
  codeCardPressed: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
  },
  codeCardHidden: {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    gap: 8,
  },
  codeLabel: {
    color: '#7dd3fc',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeLabelHidden: {
    color: '#94a3b8',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeValue: {
    color: '#f8fafc',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
  },
  hintText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  inputSection: {
    gap: 12,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  pinCell: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  pinCellFilled: {
    borderColor: '#38bdf8',
  },
  pinCellActive: {
    borderColor: '#f8fafc',
  },
  pinCellSuccess: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  pinCellError: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  pinDigit: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  resultBanner: {
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  resultSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  resultError: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  resultTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  resultText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  nextButton: {
    marginTop: 'auto',
    backgroundColor: '#38bdf8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
  },
});
