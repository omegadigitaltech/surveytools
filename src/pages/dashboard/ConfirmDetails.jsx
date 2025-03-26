import React from 'react'
import Overlay from './Overlay'
import useModalStore from '../../store/useModalStore'

export default function ConfirmDetails() {
  const {setConfirmModalOpen, setReportModalOpen} = useModalStore()

  const openReportModal = () => {
    setConfirmModalOpen(false);
    setReportModalOpen(true);
  }
  return (
    <>
    <Overlay/>
    <div className="modal confirm-modal">
        <div className="">
          <h2>Confirm Details</h2>
          <p>Double-Check your details before proceeding</p>
        </div>
        <div className="content">
          <div className="converter">
            <div className="title">Summary</div>
            <div className='summary-content'>
              <div>Points to be converted: 300 points</div>
              <div>Data Reward: 1.5GB</div>
              <div>Phone number: 08037238415</div>
            </div>
            

          </div>
          <button className="button-main redeem-button" onClick={openReportModal}>Redeem Data Reward</button>
          <button className="button-tertiary cancel-button" onClick={() => setConfirmModalOpen(false)}>Cancel</button>
        </div>
      </div> 
      </>
  )
}
