import {
    useRef,
    useState,
} from "react";

import "./TimeAttackClock.css";

type TimeAttackClockProps = {
    targetHour: number;
    targetMinute: number;
    onCorrectTime?: () => void;
};

type DraggingHand = "minute" | null;

const CLOCK_SIZE = 280;
const CENTER = CLOCK_SIZE / 2;

const normalizeAngle = (angle: number) => {
    let result = angle % 360;

    if (result < 0) {
        result += 360;
    }

    return result;
};

const getPointerAngle = (
    event: React.PointerEvent,
    element: HTMLDivElement,
) => {
    const rect = element.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = event.clientX - centerX;
    const y = event.clientY - centerY;

    return normalizeAngle(
        (Math.atan2(y, x) * 180) / Math.PI + 90,
    );
};

export function TimeAttackClock({
    targetHour,
    targetMinute,
    onCorrectTime,
}: TimeAttackClockProps) {
    const clockRef = useRef<HTMLDivElement>(null);

    // Обе стрелки начинают строго с 12 часов.
    // Значения НЕ нормализуются, поэтому стрелка может
    // пройти 360°, 720° и т.д. как вперёд, так и назад.
    const [hourAngle, setHourAngle] = useState(0);
    const [minuteAngle, setMinuteAngle] = useState(0);

    const [draggingHand, setDraggingHand] =
        useState<DraggingHand>(null);

    const previousPointerAngle =
        useRef<number | null>(null);

    const [checkResult, setCheckResult] =
        useState<"correct" | "wrong" | null>(null);

    /*
     * При начале перетаскивания запоминаем угол курсора.
     * Это позволяет определить, в какую сторону пользователь
     * двигает стрелку, и не даёт ей "прыгать" с 359° на 0°.
     */
    const handlePointerDown = (
        event: React.PointerEvent,
    ) => {
        if (!clockRef.current) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const angle = getPointerAngle(
            event,
            clockRef.current,
        );

        previousPointerAngle.current = angle;

        setDraggingHand("minute");
        setCheckResult(null);

        event.currentTarget.setPointerCapture(
            event.pointerId,
        );
    };

    const handlePointerMove = (
        event: React.PointerEvent,
    ) => {
        if (
            draggingHand !== "minute" ||
            !clockRef.current ||
            previousPointerAngle.current === null
        ) {
            return;
        }

        const currentAngle = getPointerAngle(
            event,
            clockRef.current,
        );

        let delta =
            currentAngle -
            previousPointerAngle.current;

        // Корректно обрабатываем переход через 12.
        if (delta > 180) {
            delta -= 360;
        }

        if (delta < -180) {
            delta += 360;
        }

        // Минутная стрелка движется на полный угол.
        setMinuteAngle(
            (previous) => previous + delta,
        );

        // За один полный оборот минутной стрелки
        // часовая проходит только одно часовое деление:
        // 360° / 12 = 30°.
        setHourAngle(
            (previous) => previous + delta / 12,
        );

        previousPointerAngle.current =
            currentAngle;
    };

    const handlePointerUp = () => {
        setDraggingHand(null);
        previousPointerAngle.current = null;
    };

    const handleCheck = () => {
        const currentHourAngle =
            normalizeAngle(hourAngle);

        const currentMinuteAngle =
            normalizeAngle(minuteAngle);

        /*
         * Для 23:40 используем 11:40 на 12-часовом
         * циферблате:
         *
         * часовая: 11 * 30 + 40 * 0.5 = 350°
         * минутная: 40 * 6 = 240°
         */
        const targetHour12 = targetHour % 12;

        const expectedHourAngle =
            targetHour12 * 30 +
            targetMinute * 0.5;

        const expectedMinuteAngle =
            targetMinute * 6;

        /*
         * Небольшой допуск нужен из-за положения курсора
         * и дробного угла часовой стрелки.
         */
        const hourCorrect =
            Math.abs(
                currentHourAngle -
                expectedHourAngle,
            ) < 3;

        const minuteCorrect =
            Math.abs(
                currentMinuteAngle -
                expectedMinuteAngle,
            ) < 3;

        if (hourCorrect && minuteCorrect) {
            setCheckResult("correct");

            // Игра засчитывается сразу.
            // Часы и "1234" остаются на экране.
            onCorrectTime?.();

            return;
        }

        setCheckResult("wrong");
    };

    return (
        <div className="time-attack-clock-container">
            <div className="time-attack-clock__hint">
                Перетащи стрелки и выставь нужное время
            </div>

            <div
                ref={clockRef}
                className={`time-attack-clock ${checkResult === "correct"
                    ? "time-attack-clock--correct"
                    : ""
                    }`}
                style={{
                    width: CLOCK_SIZE,
                    height: CLOCK_SIZE,
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div className="time-attack-clock__ticks">
                    {Array.from(
                        { length: 60 },
                        (_, index) => (
                            <span
                                key={index}
                                className={
                                    index % 5 === 0
                                        ? "time-attack-clock__tick time-attack-clock__tick--hour"
                                        : "time-attack-clock__tick"
                                }
                                style={{
                                    transform: `rotate(${index * 6}deg)`,
                                }}
                            />
                        ),
                    )}
                </div>

                {Array.from(
                    { length: 12 },
                    (_, index) => {
                        const number = index + 1;

                        const angle =
                            (number * 30 - 90) *
                            (Math.PI / 180);

                        const radius = 105;

                        const x =
                            CENTER +
                            Math.cos(angle) * radius;

                        const y =
                            CENTER +
                            Math.sin(angle) * radius;

                        return (
                            <span
                                key={number}
                                className="time-attack-clock__number"
                                style={{
                                    left: x,
                                    top: y,
                                }}
                            >
                                {number}
                            </span>
                        );
                    },
                )}

                {/* Часовая стрелка. Начинает с 12° и
                    может вращаться на полный круг
                    и дальше в обе стороны. */}
                <div
                    className="time-attack-clock__hand time-attack-clock__hour-hand"
                    style={{
                        transform: `rotate(${hourAngle}deg)`,
                    }}
                />

                {/* Минутная стрелка. Также начинает
                    строго с 12 и может делать полные
                    обороты вперёд и назад. */}
                <div
                    className={`time-attack-clock__hand time-attack-clock__minute-hand ${draggingHand === "minute"
                        ? "time-attack-clock__hand--dragging"
                        : ""
                        }`}
                    style={{
                        transform: `rotate(${minuteAngle}deg)`,
                    }}
                    onPointerDown={handlePointerDown}
                />

                <div className="time-attack-clock__center" />

                {checkResult && (
                    <div
                        className={`time-attack-clock__result ${checkResult === "correct"
                            ? "time-attack-clock__result--correct"
                            : "time-attack-clock__result--wrong"
                            }`}
                    >
                        {checkResult === "correct"
                            ? "1234"
                            : "Неверно"}
                    </div>
                )}
            </div>

            <button
                type="button"
                className="time-attack-clock__button"
                onClick={handleCheck}
            >
                Готово
            </button>
        </div>
    );
}
