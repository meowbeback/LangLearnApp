import React, { useState, useEffect } from 'react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import '../Dashboard/Dashboard.css';
import './Dictionary.css';

const Dictionary = () => {
  const [words, setWords] = useState([]);
  const [original, setOriginal] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.getDictionaryWords();
      setWords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!original.trim() || !translation.trim()) return;
    try {
      await api.addDictionaryWord(original.trim(), translation.trim());
      setOriginal('');
      setTranslation('');
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading-state">Загрузка словаря...</div>;
  }

  return (
    <div className="dictionary-page dashboard-container">
      <h1 className="dashboard-title">Личный словарь</h1>
      <form className="dictionary-add" onSubmit={handleAdd}>
        <Input label="Слово" value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="Hello" />
        <Input
          label="Перевод"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder="Привет"
        />
        <Button type="submit" variant="primary">
          Добавить
        </Button>
      </form>
      <ul className="dictionary-list">
        {words.map((w) => (
          <li key={w.id} className="dictionary-row">
            <span className="dict-word">{w.word_original}</span>
            <span className="dict-sep">→</span>
            <span className="dict-trans">{w.word_translation}</span>
          </li>
        ))}
      </ul>
      {!words.length ? <p className="dashboard-subtitle">Пока нет слов — добавьте первую пару.</p> : null}
    </div>
  );
};

export default Dictionary;
