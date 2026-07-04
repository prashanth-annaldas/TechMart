import { useEffect, useState, useCallback } from "react";
import styles from "./ScrollButtons.module.css";
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";

function ScrollButtons() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            setShowScrollTop(scrollTop > 400);
            setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 200);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const scrollToBottom = useCallback(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }, []);

    // Don't render if page isn't tall enough to scroll
    if (!showScrollTop && !showScrollBottom) return null;

    return (
        <div className={styles.scrollButtons}>
            <button
                className={`${styles.scrollBtn} ${showScrollTop ? styles.scrollBtnVisible : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
                title="Scroll to top"
            >
                <HiChevronUp size={20} />
            </button>
            <button
                className={`${styles.scrollBtn} ${showScrollBottom ? styles.scrollBtnVisible : ''}`}
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                title="Scroll to bottom"
            >
                <HiChevronDown size={20} />
            </button>
        </div>
    );
}

export default ScrollButtons;
