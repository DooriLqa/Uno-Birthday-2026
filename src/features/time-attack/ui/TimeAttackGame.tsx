import React, { useEffect, useRef, useState } from "react";
import "./TimeAttackGame.css";

import dog12 from "../../../assets/TimeAttackGame/dog_12.jpg";
import dog11 from "../../../assets/TimeAttackGame/dog_11.jpg";
import dog6 from "../../../assets/TimeAttackGame/dog_6.jpg";
import dog5 from "../../../assets/TimeAttackGame/dog_5.jpg";
import dog3 from "../../../assets/TimeAttackGame/dog_3.jpg";
import dog2 from "../../../assets/TimeAttackGame/dog_2.jpg";
import dog1 from "../../../assets/TimeAttackGame/dog_1.jpg";

import bark1 from "../../../assets/TimeAttackGame/bark1.mp3";
import bark2 from "../../../assets/TimeAttackGame/bark2.mp3";
import bark3 from "../../../assets/TimeAttackGame/bark3.mp3";
import bark4 from "../../../assets/TimeAttackGame/bark4.mp3";

type Direction = -1 | 0 | 1;

type Dog = {
  id: string;
  src: string;
  x: number;
  y: number;
  direction: Direction;
  speed: number;
  nextChange: number;
};

const GAME_WIDTH = 720;
const GAME_HEIGHT = 480;

const HALF_WIDTH = GAME_WIDTH / 2;

// Нижние 200 пикселей игрового поля
const PLAY_TOP = GAME_HEIGHT - 200;

const DOG_SIZE = 72;

const LEFT_DOGS = [
  dog12,
  dog3,
  dog2,
  dog1,
  dog1,
];

const RIGHT_DOGS = [
  dog12,
  dog11,
  dog6,
  dog5,
  dog3,
  dog3,
  dog2,
  dog2,
  dog1,
];

const BARK_SOUNDS = [
  bark1,
  bark2,
  bark3,
  bark4,
];

const getRandomDirection = (): Direction => {
  const value = Math.random();

  if (value < 1 / 3) {
    return -1;
  }

  if (value < 2 / 3) {
    return 1;
  }

  return 0;
};

const getRandomSpeed = (): number => {
  return 10 + Math.random() * 25;
};

const getRandomY = (): number => {
  // Собака всегда находится только в нижних 200px.
  // Учитываем размер самой картинки.
  return (
    PLAY_TOP +
    Math.random() * (200 - DOG_SIZE)
  );
};

const getRandomChangeDelay = (): number => {
  return 700 + Math.random() * 2200;
};

const playRandomBark = () => {
  const randomIndex = Math.floor(
    Math.random() * BARK_SOUNDS.length
  );

  const audio = new Audio(
    BARK_SOUNDS[randomIndex]
  );

  audio.currentTime = 0;
  audio.play().catch((error) => {
    console.error(
      "Не удалось воспроизвести звук:",
      error
    );
  });
};

const createDogs = (
  sources: string[],
  side: "left" | "right"
): Dog[] => {
  const minX =
    side === "left"
      ? 0
      : HALF_WIDTH;

  const maxX =
    side === "left"
      ? HALF_WIDTH - DOG_SIZE
      : GAME_WIDTH - DOG_SIZE;

  return sources.map((src, index) => ({
    id: `${side}-${index}-${src}`,
    src,

    x:
      minX +
      Math.random() *
      (maxX - minX),

    y: getRandomY(),

    direction: getRandomDirection(),

    speed: getRandomSpeed(),

    nextChange:
      performance.now() +
      getRandomChangeDelay(),
  }));
};

const updateDogs = (
  dogs: Dog[],
  side: "left" | "right",
  now: number,
  deltaSeconds: number
): Dog[] => {
  const minX =
    side === "left"
      ? 0
      : HALF_WIDTH;

  const maxX =
    side === "left"
      ? HALF_WIDTH - DOG_SIZE
      : GAME_WIDTH - DOG_SIZE;

  return dogs.map((dog) => {
    let direction = dog.direction;
    let speed = dog.speed;
    let nextChange = dog.nextChange;

    // Через случайный промежуток времени
    // собака выбирает новое состояние:
    // влево / вправо / стоять.
    if (now >= nextChange) {
      direction = getRandomDirection();
      speed = getRandomSpeed();

      nextChange =
        now + getRandomChangeDelay();
    }

    let x =
      dog.x +
      direction *
      speed *
      deltaSeconds;

    // Левая граница своей области
    if (x <= minX) {
      x = minX;
      direction = getRandomDirection();

      nextChange =
        now + getRandomChangeDelay();
    }

    // Правая граница своей области
    if (x >= maxX) {
      x = maxX;
      direction = getRandomDirection();

      nextChange =
        now + getRandomChangeDelay();
    }

    return {
      ...dog,
      x,
      direction,
      speed,
      nextChange,
    };
  });
};

const TimeAttackGame: React.FC = () => {
  const [leftDogs, setLeftDogs] =
    useState<Dog[]>(() =>
      createDogs(
        LEFT_DOGS,
        "left"
      )
    );

  const [rightDogs, setRightDogs] =
    useState<Dog[]>(() =>
      createDogs(
        RIGHT_DOGS,
        "right"
      )
    );

  const animationFrameRef =
    useRef<number | null>(null);

  const lastTimeRef =
    useRef<number | null>(null);

  useEffect(() => {
    const animate = (now: number) => {
      if (
        lastTimeRef.current === null
      ) {
        lastTimeRef.current = now;
      }

      const deltaSeconds = Math.min(
        (now -
          lastTimeRef.current) /
        1000,
        0.05
      );

      lastTimeRef.current = now;

      setLeftDogs((dogs) =>
        updateDogs(
          dogs,
          "left",
          now,
          deltaSeconds
        )
      );

      setRightDogs((dogs) =>
        updateDogs(
          dogs,
          "right",
          now,
          deltaSeconds
        )
      );

      animationFrameRef.current =
        requestAnimationFrame(
          animate
        );
    };

    animationFrameRef.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      lastTimeRef.current = null;
    };
  }, []);

  return (
    <div className="time-attack-game">
      {/* Левая группа */}
      <div className="time-attack-game__group time-attack-game__group--left">
        {leftDogs.map((dog) => (
          <img
            key={dog.id}
            className="time-attack-game__dog"
            src={dog.src}
            alt=""
            draggable={false}
            onClick={playRandomBark}
            style={{
              transform: `
                translate3d(${dog.x}px, ${dog.y}px, 0)
                scaleX(${dog.direction === -1 ? -1 : 1})
              `,
            }}
          />
        ))}
      </div>

      {/* Правая группа */}
      <div className="time-attack-game__group time-attack-game__group--right">
        {rightDogs.map((dog) => (
          <img
            key={dog.id}
            className="time-attack-game__dog"
            src={dog.src}
            alt=""
            draggable={false}
            onClick={playRandomBark}
            style={{
              left: `${dog.x}px`,
              top: `${dog.y}px`,
              transform: `scaleX(${dog.direction === -1 ? -1 : 1})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TimeAttackGame;
