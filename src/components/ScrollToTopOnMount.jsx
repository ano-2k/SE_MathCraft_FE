// ScrollToTopOnMount.jsx
import { useEffect } from "react";

const ScrollToTopOnMount = () => {
  useEffect(() => {
    const scrollToTop = () => {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth", 
        });
      }, 0);
    };


    scrollToTop();

    const handlePageShow = (event) => {
      if (event.persisted) scrollToTop();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
};

export default ScrollToTopOnMount;
