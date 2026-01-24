import React, { useState, useRef, useEffect } from 'react';
import Styles from './PosteringMereKnap.module.css';
import { Wallet, SquarePen, Tag, TableOfContents, FlipHorizontal, Trash2, X, Ellipsis, ChevronLeft, ChevronRight, Coins, Smartphone, ReceiptText, CreditCard, Sigma, HandCoins, Check, BanknoteArrowDown, BanknoteArrowUp, Lock, Unlock, Settings2, SquareCheckBig, PiggyBank } from 'lucide-react';
import { useAuthContext } from '../hooks/useAuthContext'
import axios from 'axios';

const PosteringMereKnap = ({ postering, setOpenMenuForPosteringID, sletPostering, setOpenPosteringModalID, setHonorarVisning, honorarVisning, setOpenPosteringSatser, refetchPostering, setOpenRetPrissatsModalID, setOpenRetLønsatsModalID, setOpenRegistrerBetalingModalID, setOpenBetalViaMobilePayAnmodningModal, setOpenVælgMobilePayBetalingsmetodeModal, posteringBetalt, setOpenSeBetalingerModal, setOpenSeOpkrævningerModal, setOpenBetalViaFakturaModal, setOpenRegistrerOpkrævningModalID }) => {
  const [open, setOpen] = useState(false);
  const [undermenuValg, setUndermenuValg] = useState(null);
  const [closing, setClosing] = useState(false);
  
  const {user} = useAuthContext();
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuForPosteringID(null);
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200); // Skal matche din animationstid
    setOpenMenuForPosteringID(null);
  };

  const handleToggle = () => {
    if (open) {
        setOpenMenuForPosteringID(null);
        handleClose();
    } else {
        setUndermenuValg(null);
        setOpen(true);
        setOpenMenuForPosteringID(postering._id);
    }
  };

  const handleValg = (valg) => {
    if (valg === 'slet') {
      sletPostering(postering._id);
      handleClose();
    } else if (valg === 'rediger') {
      setUndermenuValg('rediger');
    } else if (valg === 'betaling') {
      setUndermenuValg('betaling');
    } else if (valg === 'vend') {
      setHonorarVisning(!honorarVisning);
      handleClose();
    } else if (valg === 'satser') {
      setOpenPosteringSatser(postering);
      handleClose();
    } else if (valg === 'betalinger') {
      setOpenSeBetalingerModal(true);
      handleClose();
    } else if (valg === 'betalViaMobilePay') {
      setOpenVælgMobilePayBetalingsmetodeModal(postering);
      handleClose();
    } else if (valg === 'seOpkrævninger') {
      setOpenSeOpkrævningerModal(true);
      handleClose();
    }
  };

  const handleTilbage = () => {
    setUndermenuValg(null);
  };

  const handleLås = () => {
      axios.patch(`${import.meta.env.VITE_API_URL}/posteringer/${postering._id}`, {
        låst: !postering?.låst
      },
      {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        refetchPostering()
      })
      .catch(err => {
        console.log(err)
      })
  };

  return (
    <div className={Styles.posteringMereKnapContainer}>
      <button className={Styles.posteringMereKnap} onClick={handleToggle}><X className={`${Styles.posteringMereKnapIcon} ${open ? Styles.posteringMereKnapIconClose : ''}`}/> <Ellipsis className={`${Styles.posteringMereKnapIcon} ${open ? "" : Styles.posteringMereKnapIconOpen}`}/></button>

      {open && (
        <div ref={menuRef} className={`${Styles.posteringMereMenu} ${closing ? Styles.closing : Styles.opening}`}>
          {!undermenuValg ? (
            <>
              {!user?.isAdmin && postering?.låst && <div className={Styles.låsMenuHeader}>
                <span><Lock className={Styles.posteringMereInnerKnapIcon}/><b style={{fontFamily: "OmnesBold"}}>Posteringen er låst</b></span>
              </div>}
              {!(posteringBetalt === 2) && <button onClick={() => handleValg('betaling')}><span><Wallet className={Styles.posteringMereInnerKnapIcon}/> Tag betaling</span><ChevronRight className={Styles.posteringMereInnerKnapIcon} style={{marginRight: 0}}/></button>}
              {postering?.betalinger?.length > 0 && <button onClick={() => handleValg('betalinger')}><span><HandCoins className={Styles.posteringMereInnerKnapIcon}/> Se betalinger</span></button>}
              {postering?.opkrævninger?.length > 0 && <button onClick={() => handleValg('seOpkrævninger')}><span><ReceiptText className={Styles.posteringMereInnerKnapIcon}/> Se opkrævninger</span></button>}
              {(user?.isAdmin || ((user?.id === postering?.brugerID || user?._id === postering?.brugerID) && !postering.låst)) && <button onClick={() => handleValg('rediger')}><span><SquarePen className={Styles.posteringMereInnerKnapIcon}/> Ret</span><ChevronRight className={Styles.posteringMereInnerKnapIcon} style={{marginRight: 0}}/></button>}
              {(user?.isAdmin || (user?.id === postering?.brugerID || user?._id === postering?.brugerID)) && <button onClick={() => handleValg('satser')}><span><Sigma className={Styles.posteringMereInnerKnapIcon}/> Beregning</span></button>}
              {(user?.isAdmin || (user?.id === postering?.brugerID || user?._id === postering?.brugerID)) && <button onClick={() => handleValg('vend')}><span><FlipHorizontal className={Styles.posteringMereInnerKnapIcon}/> Vend</span></button>}
              {user?.isAdmin && (!postering?.låst ? <button onClick={() => handleLås()}><span><Unlock className={Styles.posteringMereInnerKnapIcon}/> Lås</span></button> : <button onClick={() => handleLås()}><span><Lock className={Styles.posteringMereInnerKnapIcon}/> Lås op</span></button>)}
              {posteringBetalt === 0 && (user?.isAdmin || ((user?.id === postering?.brugerID || user?._id === postering?.brugerID) && !postering?.låst)) && <button onClick={() => handleValg('slet')}><span><Trash2 className={Styles.posteringMereInnerKnapIcon}/> Slet</span></button>}
            </>
          ) : (
            <div className={Styles.underMenu}>
              <div className={Styles.underMenuHeader}>
                <button onClick={handleTilbage} className={Styles.tilbageKnap}><span><ChevronLeft className={Styles.tilbageKnapIcon}/> <b style={{fontFamily: "OmnesBold"}}>
                  {undermenuValg === 'rediger' && 'Ret ...'}
                  {undermenuValg === 'betaling' && 'Tag betaling ...'}
                </b></span></button>
              </div>

              {/* REDIGER-UNDERMENU */}
              {undermenuValg === 'rediger' && (
                <>
                  {(user?.isAdmin || posteringBetalt === 0) && <button onClick={() => { setOpenPosteringModalID(postering._id); handleClose(); }}>
                    <span><TableOfContents className={Styles.posteringMereInnerKnapIcon}/> Indhold</span>
                  </button>}
                  {(user?.isAdmin || posteringBetalt === 0) && <button onClick={() => { setOpenRetPrissatsModalID(postering._id); handleClose(); }}>
                    <span><Settings2 className={Styles.posteringMereInnerKnapIcon}/> Prissats</span>
                  </button>}
                  {user.isAdmin && <button onClick={() => { setOpenRetLønsatsModalID(postering._id); handleClose(); }}>
                    <span><Settings2 className={Styles.posteringMereInnerKnapIcon}/> Lønsats</span>
                  </button>}
                  {!(posteringBetalt === 2) && <button onClick={() => { setOpenRegistrerBetalingModalID(postering._id); handleClose(); }}>
                    <span><Check className={Styles.posteringMereInnerKnapIcon}/> Reg. betaling</span>
                  </button>}
                  {user.isAdmin && <button onClick={() => { console.log("Hey"); setOpenRegistrerOpkrævningModalID(postering._id); handleClose(); }}>
                    <span><ReceiptText className={Styles.posteringMereInnerKnapIcon}/> Tilknyt faktura</span>
                  </button>}
                  {/* Flere ret-relaterede ting */}
                </>
              )}

              {/* BETALING-UNDERMENU */}
              {undermenuValg === 'betaling' && (
                <>
                  <button onClick={() => { handleValg('betalViaMobilePay'); handleClose(); }}>
                    <span><Smartphone className={Styles.posteringMereInnerKnapIcon}/> MobilePay</span>
                  </button>
                  {/* <button onClick={() => { console.log('Kortbetaling'); handleClose(); }}>
                    <span><CreditCard className={Styles.posteringMereInnerKnapIcon}/> Kort</span>
                  </button> */}
                  <button onClick={() => { setOpenBetalViaFakturaModal(postering); handleClose(); }}>
                    <span><ReceiptText className={Styles.posteringMereInnerKnapIcon}/> Faktura</span>
                  </button>
                  {/* <button onClick={() => { console.log('Kontant'); handleClose(); }}>
                    <span><Coins className={Styles.posteringMereInnerKnapIcon}/> Kontant</span>
                  </button> */}
                  {/* Flere betalingsmuligheder */}
                </>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PosteringMereKnap;
