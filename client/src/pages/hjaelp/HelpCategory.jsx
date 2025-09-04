import React from 'react'
import helpQuestions from '../../utils/helpQuestions'
import HelpCSS from './Hjaelp.module.css'
import { PlayCircle, FileText } from 'lucide-react'

const HelpCategory = (props) => {

    const visibleQuestions = helpQuestions.filter(question => question.visible)
    const answeredQuestions = visibleQuestions.filter(question => (question.answer || question.videoURL))
    const filteredQuestions = answeredQuestions.filter(question => question.tags.includes(props.category))

  return (
    (filteredQuestions.length > 0) && <div className={HelpCSS.helpCategory}>
        <h2>{props.category.charAt(0).toUpperCase() + props.category.slice(1)}</h2>
        <div className={HelpCSS.helpQuestions}>
        {filteredQuestions.map((question, index) => {

            return (
            <div className={HelpCSS.helpQuestion} key={index} onClick={() => {props.setVisSvarModal(question)}}>
                <h3>{question.question}</h3>
                <div className={HelpCSS.helpQuestionIconDiv}>
                  {question.videoURL ? <PlayCircle className={HelpCSS.playCircle} /> : <FileText className={HelpCSS.playCircle} />}
                </div>
            </div>
            )
        })}
        </div>
    </div>
  )
}

export default HelpCategory