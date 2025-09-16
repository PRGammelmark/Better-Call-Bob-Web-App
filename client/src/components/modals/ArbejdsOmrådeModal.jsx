import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../Modal.jsx'
import ArbejdsRadiusMap from '../ArbejdsRadiusMap.jsx'


const ArbejdsOmrådeModal = (props) => {

    return (
        <Modal trigger={props.trigger} setTrigger={props.setTrigger} >
            <ArbejdsRadiusMap trigger={props.trigger} setTrigger={props.setTrigger} user={props.user} bruger={props.bruger} refetchBruger={props.refetchBruger} setRefetchBruger={props.setRefetchBruger} />
        </Modal>
    )
}

export default ArbejdsOmrådeModal