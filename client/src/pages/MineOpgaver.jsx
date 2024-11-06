import React from 'react'
import PageAnimation from '../components/PageAnimation'
import MyTasks from '../components/tables/MyTasks.jsx'

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
        setTilknyttetOpgave(res.data)
      })
      .catch(error => console.log(error))

    setEventData(besøgTilÅbning);
    setOpenDialog(true);
  };
  
  return (
    <PageAnimation>
      <div>
        <h1 className='bold'>Mine opgaver</h1>
        <MyTasks openTableEvent={openTableEvent} />
      </div>
    </PageAnimation>
  )
}

export default Mine_opgaver