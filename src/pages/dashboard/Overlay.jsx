import React from 'react'
import useModalStore from '../../store/useModalStore'

const Overlay = () => {
  const {openModalAnimate} = useModalStore()
  return (
    <div className={`overlay ${openModalAnimate ? 'overlay-active' : ''}`}></div>
  )
}

export default Overlay