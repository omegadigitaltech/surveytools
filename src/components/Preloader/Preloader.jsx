import { useEffect, useState } from 'react';
import "./preloader.css"

const Preloader = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const firstVisit = !localStorage.getItem('visited');
      if (firstVisit) {
        setVisible(true);
        localStorage.setItem('visited', 'true');
        // Auto-close after 3s or when assets load
        const timer = setTimeout(() => setVisible(false), 2000);
        window.onload = () => {
          clearTimeout(timer);
          setVisible(false);
        };
        return () => clearTimeout(timer);
      }
    }, []);
  
    if (!visible) return null;
    return(
        <section className='onload-preloader'>
<div class="dot-spinner">
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
</div>
        </section>
    )
}
export default Preloader;