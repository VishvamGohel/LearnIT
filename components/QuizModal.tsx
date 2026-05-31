'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';
import { CheckCircle2, XCircle, ChevronRight, AlertCircle, Brain, X, Trophy, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizQuestion[];
  onPass: () => void;
  onFail: (failedQuestions: QuizQuestion[]) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

type Phase = 'quiz' | 'results';

export default function QuizModal({ isOpen, onClose, quiz, onPass, onFail }: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [lockedAnswers, setLockedAnswers] = useState<Record<number, boolean>>({});
  const [phase, setPhase] = useState<Phase>('quiz');
  const [failedQuestions, setFailedQuestions] = useState<QuizQuestion[]>([]);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setLockedAnswers({});
      setPhase('quiz');
      setFailedQuestions([]);
      setDirection(1);
    }
  }, [isOpen]);

  const currentQuestion = quiz[currentIndex];
  const selectedForCurrent = selectedAnswers[currentIndex];
  const isCurrentLocked = lockedAnswers[currentIndex];
  const isCurrentCorrect = isCurrentLocked && selectedForCurrent === currentQuestion?.correctAnswerIndex;

  const handleSelect = (optIndex: number) => {
    if (isCurrentLocked) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
  };

  const handleConfirm = () => {
    if (selectedForCurrent === undefined || isCurrentLocked) return;
    setLockedAnswers(prev => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    setDirection(1);
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      const failed: QuizQuestion[] = [];
      quiz.forEach((q, idx) => {
        if (selectedAnswers[idx] !== q.correctAnswerIndex) failed.push(q);
      });
      setFailedQuestions(failed);
      setPhase('results');
    }
  };

  const handleAction = () => {
    if (failedQuestions.length === 0) {
      onPass();
    } else {
      onFail(failedQuestions);
    }
    onClose();
  };

  const answeredCount = Object.keys(lockedAnswers).length;
  const progressPct = quiz.length > 0 ? (answeredCount / quiz.length) * 100 : 0;
  const score = quiz.filter((q, idx) => selectedAnswers[idx] === q.correctAnswerIndex).length;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop — full screen heavy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-2xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg flex flex-col"
            style={{ maxHeight: 'min(640px, calc(100vh - 32px))' }}
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />

            <div className="relative bg-[#0d1117] border border-slate-800/80 rounded-3xl shadow-2xl shadow-slate-950 flex flex-col overflow-hidden h-full">

              {/* ── HEADER ── */}
              <div className="px-5 pt-4 pb-3 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Checkpoint Quiz</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {phase === 'quiz' ? `Question ${currentIndex + 1} of ${quiz.length}` : 'Results'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: phase === 'results' ? '100%' : `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* ── BODY ── */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent min-h-0">
                <AnimatePresence mode="wait" custom={direction}>
                  {phase === 'quiz' && currentQuestion ? (
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="px-5 pb-2"
                    >
                      {/* Question */}
                      <div className="mb-4">
                        <h3 className="text-[15px] font-bold text-white leading-snug">
                          {currentQuestion.question}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, optIdx) => {
                          const isSelected = selectedForCurrent === optIdx;
                          const isCorrect = currentQuestion.correctAnswerIndex === optIdx;
                          const isWrongPick = isCurrentLocked && isSelected && !isCorrect;
                          const isRightAnswer = isCurrentLocked && isCorrect;

                          let cardStyle = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70 cursor-pointer';
                          if (!isCurrentLocked && isSelected) {
                            cardStyle = 'border-emerald-500/60 bg-emerald-950/40 text-white shadow-[0_0_16px_rgba(16,185,129,0.1)] cursor-pointer';
                          }
                          if (isRightAnswer) {
                            cardStyle = 'border-emerald-500/70 bg-emerald-950/50 text-emerald-200 cursor-default';
                          }
                          if (isWrongPick) {
                            cardStyle = 'border-red-500/50 bg-red-950/30 text-red-300 cursor-default';
                          }
                          if (isCurrentLocked && !isCorrect && !isSelected) {
                            cardStyle = 'border-slate-800/40 bg-slate-900/20 text-slate-600 opacity-40 cursor-default';
                          }

                          let letterStyle = 'border-slate-700 bg-slate-800 text-slate-400';
                          if (!isCurrentLocked && isSelected) letterStyle = 'border-emerald-500/70 bg-emerald-500/20 text-emerald-300';
                          if (isRightAnswer) letterStyle = 'border-emerald-500 bg-emerald-500 text-slate-950';
                          if (isWrongPick) letterStyle = 'border-red-500 bg-red-500/20 text-red-400';

                          return (
                            <motion.button
                              key={optIdx}
                              onClick={() => handleSelect(optIdx)}
                              disabled={isCurrentLocked}
                              whileHover={!isCurrentLocked ? { scale: 1.005 } : {}}
                              whileTap={!isCurrentLocked ? { scale: 0.995 } : {}}
                              className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-150 ${cardStyle}`}
                            >
                              {/* Letter badge */}
                              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 font-bold text-xs transition-all duration-150 ${letterStyle}`}>
                                {isRightAnswer ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : isWrongPick ? (
                                  <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                  OPTION_LETTERS[optIdx]
                                )}
                              </div>
                              <span className="flex-1 text-[13.5px] leading-snug font-medium">{opt}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Explanation after lock */}
                      <AnimatePresence>
                        {isCurrentLocked && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <div className={`rounded-xl border p-3 text-xs leading-relaxed ${
                              isCurrentCorrect
                                ? 'bg-emerald-500/8 border-emerald-500/25 text-emerald-300'
                                : 'bg-amber-500/8 border-amber-500/20 text-amber-200/90'
                            }`}>
                              <div className="flex items-start gap-2">
                                {isCurrentCorrect
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                }
                                <div>
                                  <p className="font-semibold mb-0.5 text-[12px]">
                                    {isCurrentCorrect ? 'Correct!' : `Answer: ${currentQuestion.options[currentQuestion.correctAnswerIndex]}`}
                                  </p>
                                  <p className="opacity-70">{currentQuestion.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : phase === 'results' ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-2"
                    >
                      {/* Score banner */}
                      <div className={`rounded-2xl border p-4 mb-4 text-center ${
                        failedQuestions.length === 0
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-amber-500/8 border-amber-500/20'
                      }`}>
                        {failedQuestions.length === 0 ? (
                          <>
                            <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-base font-black text-emerald-400">Perfect Score!</p>
                            <p className="text-xs text-slate-400 mt-0.5">All {quiz.length} questions correct.</p>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                            <p className="text-base font-black text-amber-400">{score} / {quiz.length} Correct</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Your AI Mentor will help you with {failedQuestions.length} missed concept{failedQuestions.length > 1 ? 's' : ''}.
                            </p>
                          </>
                        )}
                      </div>

                      {/* Missed concepts */}
                      {failedQuestions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Concepts to Review</p>
                          {failedQuestions.map((q, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-slate-300 font-medium leading-snug">{q.question}</p>
                                <p className="text-[11px] text-emerald-400 mt-0.5">✓ {q.options[q.correctAnswerIndex]}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* ── FOOTER ── */}
              <div className="px-5 py-3.5 border-t border-slate-800/60 bg-slate-950/40 shrink-0 mt-2">
                {phase === 'quiz' ? (
                  <div className="flex items-center justify-between">
                    {/* Dot indicators */}
                    <div className="flex gap-1.5 items-center">
                      {quiz.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === currentIndex
                              ? 'w-4 bg-emerald-400'
                              : lockedAnswers[i]
                                ? selectedAnswers[i] === quiz[i].correctAnswerIndex
                                  ? 'w-1.5 bg-emerald-500/50'
                                  : 'w-1.5 bg-red-500/50'
                                : 'w-1.5 bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {!isCurrentLocked ? (
                      <button
                        onClick={handleConfirm}
                        disabled={selectedForCurrent === undefined}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                          selectedForCurrent !== undefined
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.03]'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        Confirm Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-slate-200 hover:bg-white text-slate-950 transition-all duration-200 hover:scale-[1.03]"
                      >
                        {currentIndex < quiz.length - 1 ? 'Next' : 'See Results'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleAction}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] ${
                      failedQuestions.length === 0
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {failedQuestions.length === 0 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Continue to Next Lesson
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Chat with AI Mentor
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
