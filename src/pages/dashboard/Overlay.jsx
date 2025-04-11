import React from 'react'
import useModalStore from '../../store/useModalStore'

const Overlay = () => {
  const { openModalAnimate } = useModalStore()
  return (
    <div className={`overlay`}></div>
  )
}

export default Overlay