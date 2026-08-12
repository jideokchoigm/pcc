import { useCallback, useState } from 'react';
import GameScreen from './components/GameScreen';
import InstructionModal from './components/InstructionModal';
import ResultScreen from './components/ResultScreen';
import StarField from './components/StarField';
import StartScreen from './components/StartScreen';
import TeacherDashboard from './components/TeacherDashboard';
import { PLANETS } from './data/planets';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSettings } from './hooks/useSettings';
import { evaluateBadges } from './utils/badges';
import { sfx } from './utils/sound';
import { loadSessions, saveSession } from './utils/storage';
import type { Attempt, Badge, GameSession, Screen } from './types';

/** 화면 전환과 한 판의 기록을 관리하는 최상위 컴포넌트 */
export default function App() {
  const { settings, toggle } = useSettings();
  const reducedMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>('start');
  const [previousScreen, setPreviousScreen] = useState<Screen>('start');
  const [showHowTo, setShowHowTo] = useState(false);

  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [sessions, setSessions] = useState<GameSession[]>(() => loadSessions());
  const [badges, setBadges] = useState<Badge[]>([]);

  const startGame = useCallback(() => {
    setIndex(0);
    setAttempts([]);
    setBadges([]);
    setStartedAt(Date.now());
    setScreen('game');
  }, []);

  const handleAttempt = useCallback((attempt: Attempt) => {
    setAttempts((prev) => [...prev, attempt]);
  }, []);

  /** 다음 행성으로 넘어가거나, 마지막이면 한 판을 마무리합니다. */
  const handleNext = useCallback(() => {
    if (index < PLANETS.length - 1) {
      setIndex((i) => i + 1);
      return;
    }

    const total = attempts.reduce((sum, a) => sum + a.score, 0);
    const session: GameSession = {
      id: `${startedAt}`,
      startedAt,
      finishedAt: Date.now(),
      attempts,
      totalScore: total,
      averageScore: attempts.length ? total / attempts.length : 0,
    };

    setBadges(evaluateBadges(attempts, sessions));
    setSessions(saveSession(session));
    if (settings.sound) sfx.finish();
    setScreen('result');
  }, [attempts, index, sessions, settings.sound, startedAt]);

  const openTeacher = useCallback(() => {
    setPreviousScreen(screen);
    setScreen('teacher');
  }, [screen]);

  return (
    <div className="min-h-[100dvh]">
      <StarField count={reducedMotion ? 45 : 90} />

      {screen === 'start' && (
        <StartScreen
          soundOn={settings.sound}
          highContrast={settings.highContrast}
          onStart={startGame}
          onHowTo={() => setShowHowTo(true)}
          onTeacher={openTeacher}
          onToggleSound={() => toggle('sound')}
          onToggleContrast={() => toggle('highContrast')}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          index={index}
          attempts={attempts}
          soundOn={settings.sound}
          reducedMotion={reducedMotion}
          onAttempt={handleAttempt}
          onNext={handleNext}
          onQuit={() => setScreen('start')}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          attempts={attempts}
          badges={badges}
          onReplay={startGame}
          onHome={() => setScreen('start')}
          onTeacher={openTeacher}
        />
      )}

      {screen === 'teacher' && (
        <TeacherDashboard
          sessions={sessions}
          onBack={() => setScreen(previousScreen)}
          onCleared={() => setSessions([])}
        />
      )}

      {showHowTo && <InstructionModal onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
