import React, { useRef } from 'react';
import TranslateTask from './TranslateTask';
import './TaskTypes.css';

const ListenTask = (props) => {
  const {
    audio_url,
    choiceOptions,
    speakText,
    selectedOption,
    onSelect,
    disabled,
    isChecked,
    isCorrect,
    correctAnswer,
  } = props;
  const audioRef = useRef(null);

  const playSpeech = () => {
    if (!speakText || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speakText);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const handlePlay = () => {
    const el = audioRef.current;
    if (el?.src) {
      el.crossOrigin = 'anonymous';
      el.play().catch(() => playSpeech());
    } else {
      playSpeech();
    }
  };

  return (
    <div className="listen-task">
      <div className="listen-audio-row">
        <button type="button" className="listen-play-btn" onClick={handlePlay} disabled={disabled} aria-label="Прослушать">
          🔊
        </button>
        <span className="listen-hint">Сначала нажмите «прослушать», затем выберите вариант</span>
        {audio_url ? <audio ref={audioRef} src={audio_url} preload="metadata" /> : null}
      </div>
      <TranslateTask
        options={choiceOptions}
        selectedOption={selectedOption}
        onSelect={onSelect}
        disabled={disabled}
        isChecked={isChecked}
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
      />
    </div>
  );
};

export default ListenTask;
