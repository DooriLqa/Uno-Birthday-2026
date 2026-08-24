import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { TimeAttackGame } from "@/features/time-attack";
import background1 from "@/assets/TimeAttackGame/background1.jpg";

import { useProgressStore } from "@/features/game-progress/model/store";

export function TimeAttackPage() {
    const [answer, setAnswer] = useState("");
    const [isFinished, setIsFinished] = useState(false);

    // Количество неверных попыток
    const [wrongAttempts, setWrongAttempts] = useState(0);

    // Показывать сообщение о неверном ответе
    const [showWrongMessage, setShowWrongMessage] = useState(false);

    const completeGame = useProgressStore(
        (state) => state.completeGame,
    );

    const handleAnswerChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        // Оставляем только цифры
        const digits = event.target.value
            .replace(/\D/g, "")
            .slice(0, 4);

        // Автоматически добавляем ":" после двух цифр
        let formattedValue = digits;

        if (digits.length > 2) {
            formattedValue =
                `${digits.slice(0, 2)}:${digits.slice(2)}`;
        }

        setAnswer(formattedValue);

        // Пока пользователь редактирует поле,
        // сообщение об ошибке скрываем.
        setShowWrongMessage(false);
    };

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        // Проверяем только после нажатия Enter
        // или кнопки "Ввести время".
        if (answer === "23:45") {
            setIsFinished(true);
            setShowWrongMessage(false);

            // Засчитываем Time Attack как пройденную игру
            completeGame("time-attack");
            return;
        }

        // Пустой или неполный ввод тоже не считаем
        // неверной попыткой.
        if (answer.length !== 5) {
            return;
        }

        setWrongAttempts(
            (attempts) => attempts + 1,
        );

        setShowWrongMessage(true);
    };

    return (
        <main className="beach-shell">
            <div className="page-top">
                <Link to="/" className="back">
                    <ArrowLeft size={18} />
                    Все игры
                </Link>

                <span>🐩⏱️🐕</span>
            </div>

            <section className="game-layout">
                <div className="game-panel">
                    <h1>
                        {isFinished
                            ? "Все ушли спать!"
                            : "Время выгула заканчивается!"}
                    </h1>

                    <p>
                        Тик-так! Тик-так! Часы пробили ... пора домой!
                    </p>

                    <TimeAttackGame
                        isFinished={isFinished}
                        finishedBackground={background1}
                    />
                </div>

                <aside className="info-panel">
                    <h2>Задание</h2>

                    {!isFinished ? (
                        <>
                            <p>
                                Помоги собачкам понять, когда пора домой!
                            </p>
                            <p>
                                Введи время в формате чч:мм.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={handleAnswerChange}
                                    placeholder="00:00"
                                    maxLength={5}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    aria-label="Введите время"
                                />

                                <button type="submit">
                                    Ввести время
                                </button>
                            </form>

                            <p>
                                Неверных вводов: {wrongAttempts}
                            </p>

                            {showWrongMessage && (
                                <p>
                                    Время не конь!🐎
                                </p>
                            )}
                        </>
                    ) : (
                        <p>
                            Все собачки вернулись домой и легли спать.
                        </p>
                    )}
                    <details className="time-attack-hint">
                        <summary>Если совсем нет идей...</summary>

                        <details className="time-attack-hint__level">
                            <summary>Лёгкая подсказка</summary>

                            <p>
                                Возможно где-то есть мануал, или даже...
                            </p>

                            <details className="time-attack-hint__level">
                                <summary>Средняя подсказка</summary>

                                <p>
                                    Юнь, ну ты чего... Часики тик-так, тик... так...
                                    Нет! Не конфеты, а часики поищи!
                                </p>

                                <details className="time-attack-hint__level">
                                    <summary>Почти ответ</summary>

                                    <p>
                                        Деревья что то значят!
                                        А собаки тем более!
                                    </p>
                                </details>
                            </details>
                        </details>
                    </details>
                </aside>
            </section>
        </main>
    );
}