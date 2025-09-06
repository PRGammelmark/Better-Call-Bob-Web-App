import React, { useState, useEffect } from 'react'
import HelpCSS from './Hjaelp.module.css'
import PageAnimation from '../../components/PageAnimation'
import helpQuestions from '../../utils/helpQuestions'
import { PlayCircle } from 'lucide-react'
import HjaelpSvarModal from '../../components/modals/HjaelpSvarModal'
import HelpCategory from './HelpCategory'

const Hjaelp = () => {

    const visibleQuestions = helpQuestions.filter(question => question.visible)
    const [visSvarModal, setVisSvarModal] = useState("")

  return (
    <div>
      <h1>Sådan bruger du Octa</h1>
      <p className={HelpCSS.helpTopDescription}>Herunder finder du svar på nogle af de spørgsmål, vi oftest bliver spurgt om.</p>
      <div className={HelpCSS.helpCategories}>
        <HelpCategory category="generelt" setVisSvarModal={setVisSvarModal} />
        <HelpCategory category="opgaver" setVisSvarModal={setVisSvarModal} />
        <HelpCategory category="posteringer" setVisSvarModal={setVisSvarModal} />
        <HelpCategory category="betalinger" setVisSvarModal={setVisSvarModal} />
        <HelpCategory category="dokumenter" setVisSvarModal={setVisSvarModal} />
        <HjaelpSvarModal trigger={visSvarModal} setTrigger={setVisSvarModal} />
      </div>
    </div>
  )
}

export default Hjaelp