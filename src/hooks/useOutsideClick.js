import React, { useEffect } from 'react'

export default function useOutsideClick(ref, closeFunc) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current &&!ref.current.contains(event.target)) {
        closeFunc()
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, closeFunc])
}
