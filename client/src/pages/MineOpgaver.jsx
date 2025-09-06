import React from 'react'
import PageAnimation from '../components/PageAnimation'
import MyTasks from '../components/tables/MyTasks.jsx'
import Styles from './MineOpgaver.module.css'
import MyEarlierTasks from '../components/tables/MyEarlierTasks'

const Mine_opgaver = () => {

  const openTableEvent = (besøg) => {
    const besøgID = besøg.tættesteBesøgID;
    const besøgTilÅbning = egneBesøg.find(besøg => besøg._id === besøgID);

    axios.get(`${import.meta.env.VITE_API_URL}/opgaver/${besøgTilÅbning.opgaveID}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        setOpgaveTilknyttetBesøg(res.data)
      })
      .catch(error => console.log(error))

    setEventData(besøgTilÅbning);
    setOpenDialog(true);
  };
  
  return (
      <div>
        <h1 className={Styles.heading}>Mine opgaver</h1>
        <MyTasks openTableEvent={openTableEvent} />
        <MyEarlierTasks />
      </div>
  )
}

export default Mine_opgaver