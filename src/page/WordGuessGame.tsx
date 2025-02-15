import React, { useState, useRef, useEffect } from "react";
import { Button, Card, CardContent } from "@mui/material";
import { Typography, Container, Box, Tooltip } from "@mui/material";
import { getRandomWord } from "../util/getRandomWord";

// Define types
type LetterFeedback = {
  char: string;
  status: "correct" | "misplaced" | "wrong";
};

const WordGuessGame: React.FC = () => {
  const [targetWord, setTargetWord] = useState<string>(getRandomWord);
  const [attempts, setAttempts] = useState<LetterFeedback[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>(
    Array(targetWord.length).fill("")
  );
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleInputRef = (el: HTMLInputElement | null, index: number) => {
    if (el) inputRefs.current[index] = el;
  };
  //hack😜
  useEffect(() => {
    let shiftPressed = false;
    let inputSequence = "";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        if (shiftPressed) {
          // If Shift was already pressed once, start listening for the phrase
          inputSequence = "";
        }
        shiftPressed = true;
        setTimeout(() => (shiftPressed = false), 50000); // Reset shift detection after 500ms
      } else if (shiftPressed) {
        inputSequence += event.key.toLowerCase();
        if (inputSequence === "safvangivemeyourwisdom") {
          console.log(`🚀 SECRET WORD: ${targetWord}`);
          alert(`🤫 The word is: ${targetWord}`);
          inputSequence = ""; // Reset after activation
        }
      } else {
        inputSequence = ""; // Reset if other keys are pressed randomly
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [attempts]);

  // Handle input change and move focus
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newGuess = [...currentGuess];
    newGuess[index] = value.toLowerCase();
    setCurrentGuess(newGuess);

    if (value && index < targetWord.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  //on backpace
  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !inputRefs.current[index]?.value) {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Check user's guess
  const checkGuess = () => {
    if (currentGuess.join("").length !== targetWord.length) {
      alert(`Word must be ${targetWord.length} letters long`);
      return;
    }

    const feedback: LetterFeedback[] = currentGuess.map((char, index) => ({
      char,
      status:
        char === targetWord[index]
          ? "correct"
          : targetWord.includes(char)
          ? "misplaced"
          : "wrong",
    }));

    setAttempts([...attempts, feedback]);
    setCurrentGuess(Array(targetWord.length).fill(""));

    if (currentGuess.join("") === targetWord) {
      setGameOver(true);
      setWinner(true);
    } else if (attempts.length + 1 >= 4) {
      setGameOver(true);
      setWinner(false);
    }
  };

  // Reset game
  const resetGame = () => {
    const newWord = getRandomWord();
    setTargetWord(newWord);
    setAttempts([]);
    setCurrentGuess(Array(newWord.length).fill(""));
    setGameOver(false);
    setWinner(false);
  };

  return (
    <Container
      maxWidth="sm"
      className="flex flex-col items-center gap-6 p-6 bg-gray-100 min-h-screen"
    >
      <Typography variant="h4" className="font-bold text-center text-blue-600">
        Word Guessing Game
      </Typography>
      <Typography variant="body1" className="text-center text-gray-700">
        Guess the correct word in 4 attempts. Each guess will provide hints:
        <ul className="list-disc list-inside text-left mt-2">
          <li className="text-green-600">
            Green: Correct letter in the right spot
          </li>
          <li className="text-yellow-600">
            Yellow: Letter exists but in the wrong spot
          </li>
          <li className="text-gray-500">Gray: Letter is not in the word</li>
        </ul>
      </Typography>
      <Card className="w-full p-6 shadow-lg bg-white rounded-lg">
        <CardContent className="flex flex-col items-center gap-4">
          {attempts.map((attempt, attemptIndex) => (
            <Box key={attemptIndex} className="flex gap-2">
              {attempt.map(({ char, status }, i) => (
                <Tooltip
                  key={i}
                  title={
                    status === "correct"
                      ? "Correct position"
                      : status === "misplaced"
                      ? "Wrong position"
                      : "Not in word"
                  }
                >
                  <span
                    className={`px-3 py-2 text-lg font-bold rounded-md text-white ${
                      status === "correct"
                        ? "bg-green-500"
                        : status === "misplaced"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {char}
                  </span>
                </Tooltip>
              ))}
            </Box>
          ))}
          {!gameOver && (
            <Box className="flex gap-2">
              {currentGuess.map((char, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={char}
                  ref={(el) => handleInputRef(el, index)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 border-2 rounded-md text-center text-lg font-bold focus:ring focus:ring-blue-300 transition-all"
                />
              ))}
            </Box>
          )}
          {!gameOver && (
            <Button
              onClick={checkGuess}
              disabled={gameOver}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Submit Guess
            </Button>
          )}
          {gameOver && winner ? (
            attempts.length === 1 ? (
              <Typography variant="body1" className="text-green-500 mt-2">
                🤯 Incredible! You got it on the very first try! The word was:{" "}
                <strong>{targetWord}</strong> 🎉🔥
              </Typography>
            ) : attempts.length === 4 ? (
              <Typography variant="body1" className="text-green-500 mt-2">
                😲 That was close! You got it in the nick of time! The word was:{" "}
                <strong>{targetWord}</strong> 🎉⏳
              </Typography>
            ) : (
              <Typography variant="body1" className="text-green-500 mt-2">
                🎉 Great job! You got it! The word was:{" "}
                <strong>{targetWord}</strong>
              </Typography>
            )
          ) : gameOver ? (
            <Typography variant="body1" className="text-red-500 mt-2">
              Game Over! The word was: <strong>{targetWord}</strong> 😢
            </Typography>
          ) : null}
          <Button
            onClick={resetGame}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Restart Game
          </Button>
        </CardContent>
      </Card>
      <Typography variant="body2" className="mt-6 text-gray-600">
        Created by Safvan CMC
      </Typography>
    </Container>
  );
};

export default WordGuessGame;
