import React from 'react'
import Overlay from './Overlay'
import useModalStore from '../../store/useModalStore'

export default function ConfirmDetails() {
  const {setRedeemModalOpen, setConfirmModalOpen,setReportModalOpen} = useModalStore()

  const closeAllModals = () => {
    setRedeemModalOpen(false);
    setConfirmModalOpen(false)
    setReportModalOpen(false)
  }
  return (
    <>
    <Overlay/>
    <div className="modal confirm-modal overlay-active">
        <div className="top">
          <h2>Request Sent</h2>
          <img src="./green-check.svg" alt="green check icon"/>
        </div>
        <div className="content">
          <div className="centered">Your request has been sent and is being processed. You will receive a notification of your data top-up within 24hrs </div>
          <button className="button-main redeem-button" onClick={closeAllModals}>Go to Dashboard</button>
        </div>
      </div> 
      </>
  )
}
