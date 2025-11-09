import React from 'react';
import { MessageSquare, Plus, MessageSquarePlus } from 'lucide-react';
import Styles from './OpgaveKommentarSection.module.css';

const OpgaveKommentarSection = ({ kommentarer, onAddComment }) => {
  const kommentarCount = kommentarer?.length || 0;
  const latestKommentar = kommentarer?.length > 0 ? kommentarer[0] : null;

  return (
    <div className={Styles.kommentarSection}>
      <div className={Styles.kommentarInfo}>
        <MessageSquare className={Styles.kommentarIcon} />
        <span className={Styles.kommentarCount}>{kommentarCount}</span>
        {latestKommentar && (
          <p className={Styles.latestKommentar}>{latestKommentar.kommentarIndhold}</p>
        )}
      </div>
      <button
        className={Styles.tilfoejKommentarKnap}
        onClick={(e) => {
          e.stopPropagation();
          onAddComment();
        }}
      >
        <MessageSquarePlus className={Styles.kommentarPlusIcon} /> 
      </button>
    </div>
  );
};

export default OpgaveKommentarSection;

