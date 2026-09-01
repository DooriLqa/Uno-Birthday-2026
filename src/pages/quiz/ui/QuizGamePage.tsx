import { useState } from 'react'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { FalloutHackingGame } from '@/features/fallout-hacking'
import { SiteHeader } from '@/widgets/site-header/SiteHeader'
import './QuizGamePage.css'
import { getNextQuestion, quizQuestions } from '@/entities/game/quiz'
import { useQuizStore } from '@/entities/game/quiz/quizStore'

export function QuizGamePage() {
  const [currentQuestionId, setCurrentQuestionId] = useState(quizQuestions[0]?.id)
  const [answer, setAnswer] = useState('')
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { completedQuestions, completeQuestion } = useQuizStore()

  const currentQuestion = quizQuestions.find((q) => q.id === currentQuestionId)

  if (!currentQuestion) {
    return <Navigate to="/" replace />
  }

  const isQuestionCompleted = completedQuestions.includes(currentQuestion.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!answer.trim()) {
      setErrorMessage('Введите ответ')
      return
    }

    const normalizedAnswer = answer.trim().toLowerCase()
    const normalizedCorrect = currentQuestion.answer.toLowerCase()

    if (normalizedAnswer === normalizedCorrect) {
      setIsCorrect(true)
      setErrorMessage('')
      setShowPuzzle(true)
    } else {
      setErrorMessage('Неправильный ответ. Попробуйте ещё раз!')
      setAnswer('')
    }
  }

  const handlePuzzleComplete = () => {
    completeQuestion(currentQuestion.id)
    setShowPuzzle(false)
    setIsCorrect(false)
    setAnswer('')

    const nextQuestion = getNextQuestion(currentQuestion.id)
    if (nextQuestion) {
      setCurrentQuestionId(nextQuestion.id)
    } else {
      // Все вопросы пройдены
      setCurrentQuestionId(quizQuestions[0].id) // Или показываем экран завершения
    }
  }

  const renderPuzzle = () => {
    switch (currentQuestion.puzzleType) {
      case 'hacking':
        return <FalloutHackingGame onComplete={handlePuzzleComplete} />
      default:
        return <div>Головоломка в разработке</div>
    }
  }

  return (
    <main className="beach-shell quiz-page">
      <SiteHeader />

      <div className="page-top">
        <Link to="/" className="back">
          <ArrowLeft size={18} /> Все игры
        </Link>
        <span className="quiz-emoji">{currentQuestion.emoji}</span>
      </div>

      <section className="quiz-layout">
        <div className="quiz-panel">
          <div className="quiz-header">
            <h1>Игровой квиз</h1>
            <div className="quiz-progress">
              Вопрос {quizQuestions.findIndex((q) => q.id === currentQuestion.id) + 1} из{' '}
              {quizQuestions.length}
            </div>
          </div>

          {!showPuzzle ? (
            <div className="question-card">
              <div className="question-game">
                <span className="game-badge">{currentQuestion.gameTitle}</span>
                {isQuestionCompleted && <span className="completed-badge">✓ Пройден</span>}
              </div>

              <h2 className="question-text">{currentQuestion.question}</h2>

              {showHint && currentQuestion.hint && (
                <div className="hint-box">
                  <HelpCircle size={16} />
                  <span>{currentQuestion.hint}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="answer-form">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value)
                    setErrorMessage('')
                  }}
                  placeholder="Введите ваш ответ..."
                  className="answer-input"
                  disabled={isQuestionCompleted}
                />
                <button type="submit" className="submit-button" disabled={isQuestionCompleted}>
                  Проверить
                </button>
              </form>

              {errorMessage && <div className="error-message">{errorMessage}</div>}

              {isCorrect && !showPuzzle && (
                <div className="success-message">✅ Правильно! Теперь решите головоломку!</div>
              )}

              {currentQuestion.hint && !showHint && !isQuestionCompleted && (
                <button type="button" className="hint-button" onClick={() => setShowHint(true)}>
                  <HelpCircle size={16} />
                  Показать подсказку
                </button>
              )}
            </div>
          ) : (
            <div className="puzzle-container">
              <div className="puzzle-header">
                <h2>Головоломка: {currentQuestion.gameTitle}</h2>
                <p>Решите головоломку, чтобы завершить вопрос</p>
              </div>
              {renderPuzzle()}
            </div>
          )}
        </div>

        <aside className="info-panel quiz-info">
          <h2>Прогресс квиза</h2>
          <div className="quiz-stats">
            <div className="stat-item">
              <span className="stat-value">{completedQuestions.length}</span>
              <span className="stat-label">Пройдено</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{quizQuestions.length}</span>
              <span className="stat-label">Всего</span>
            </div>
          </div>
          <div className="questions-list">
            {quizQuestions.map((q, index) => (
              <div
                key={q.id}
                className={`question-item ${
                  completedQuestions.includes(q.id) ? 'completed' : ''
                } ${q.id === currentQuestion.id ? 'current' : ''}`}
              >
                <span className="question-number">{index + 1}</span>
                <span className="question-game-title">{q.gameTitle}</span>
                <span className="question-status">
                  {completedQuestions.includes(q.id) ? '✓' : ''}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}
