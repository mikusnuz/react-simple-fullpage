import React, { useState, useEffect, useRef, useCallback } from "react";
import { FullPageProps, SectionProps } from "./types";
import "./FullPage.css";

const FullPage: React.FC<FullPageProps> & { Section: React.FC<SectionProps> } = ({
  children,
  scrollingSpeed = 1000,
  showDotsAlways = true,
  dotColor = "#aaa",
  activeDotColor = "#000",
  dotSize = 10,
  direction = "vertical",
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const sectionsCount = React.Children.count(children);
  const isHorizontal = direction === "horizontal";

  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const isScrollingRef = useRef(false);
  const lastTransitionTimeRef = useRef(0);
  const gestureLockDuration = 1100;

  const gestureActiveRef = useRef(false);
  const gestureHasTransitionedRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const wheelGestureTimerRef = useRef<number | null>(null);
  const threshold = 50;
  const gestureDebounceDelay = 50;

  const [showDots, setShowDots] = useState(showDotsAlways);
  const showDotsRef = useRef(showDotsAlways);
  const showDotsTimerRef = useRef<number | null>(null);

  useEffect(() => {
    showDotsRef.current = showDotsAlways;
    setShowDots(showDotsAlways);
  }, [showDotsAlways, scrollingSpeed]);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  const showDotsTemporarily = useCallback(() => {
    if (!showDotsRef.current) {
      setShowDots(true);

      if (showDotsTimerRef.current) {
        clearTimeout(showDotsTimerRef.current);
      }

      showDotsTimerRef.current = window.setTimeout(() => {
        if (!showDotsRef.current) {
          setShowDots(false);
        }
        showDotsTimerRef.current = null;
      }, scrollingSpeed);
    }
  }, [showDotsRef, scrollingSpeed]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();

      showDotsTemporarily();

      if (now - lastTransitionTimeRef.current < gestureLockDuration) {
        return;
      }

      if (!gestureActiveRef.current) {
        gestureActiveRef.current = true;
        wheelAccumRef.current = 0;
        gestureHasTransitionedRef.current = false;
      }

      const delta = isHorizontal ? e.deltaX || e.deltaY : e.deltaY;
      wheelAccumRef.current += delta;

      if (!gestureHasTransitionedRef.current && Math.abs(wheelAccumRef.current) >= threshold) {
        const direction = wheelAccumRef.current > 0 ? 1 : -1;
        const nextSection = activeSectionRef.current + direction;
        if (nextSection >= 0 && nextSection < sectionsCount) {
          gestureHasTransitionedRef.current = true;
          isScrollingRef.current = true;
          setActiveSection(nextSection);
          lastTransitionTimeRef.current = now;
          wheelAccumRef.current = 0;

          if (wheelGestureTimerRef.current) {
            clearTimeout(wheelGestureTimerRef.current);
          }
          wheelGestureTimerRef.current = window.setTimeout(() => {
            isScrollingRef.current = false;
            gestureActiveRef.current = false;
            gestureHasTransitionedRef.current = false;
            wheelAccumRef.current = 0;
            wheelGestureTimerRef.current = null;
          }, scrollingSpeed);
        } else {
          wheelAccumRef.current = 0;
        }
      }

      if (wheelGestureTimerRef.current) {
        clearTimeout(wheelGestureTimerRef.current);
      }
      wheelGestureTimerRef.current = window.setTimeout(() => {
        gestureActiveRef.current = false;
        gestureHasTransitionedRef.current = false;
        wheelAccumRef.current = 0;
        wheelGestureTimerRef.current = null;
      }, gestureDebounceDelay);
    },
    [isHorizontal, sectionsCount, scrollingSpeed, showDotsTemporarily]
  );

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (isHorizontal) {
        if (
          (activeSectionRef.current === 0 && e.touches[0].clientX < window.innerWidth / 2) ||
          (activeSectionRef.current === sectionsCount - 1 && e.touches[0].clientX > window.innerWidth / 2)
        ) {
          e.preventDefault();
        }
        touchStartXRef.current = e.touches[0].clientX;
      } else {
        if (
          (activeSectionRef.current === 0 && e.touches[0].clientY < window.innerHeight / 2) ||
          (activeSectionRef.current === sectionsCount - 1 && e.touches[0].clientY > window.innerHeight / 2)
        ) {
          e.preventDefault();
        }
        touchStartYRef.current = e.touches[0].clientY;
      }

      if (isScrollingRef.current) return;
      showDotsTemporarily();
    },
    [isHorizontal, sectionsCount, showDotsTemporarily]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (isScrollingRef.current) return;

      if (isHorizontal && touchStartXRef.current !== null) {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartXRef.current - touchEndX;
        const touchThreshold = 70;

        if (Math.abs(diff) >= touchThreshold) {
          const direction = diff > 0 ? 1 : -1;
          const nextSection = activeSectionRef.current + direction;
          if (nextSection >= 0 && nextSection < sectionsCount) {
            isScrollingRef.current = true;
            setActiveSection(nextSection);
            lastTransitionTimeRef.current = Date.now();
            setTimeout(() => {
              isScrollingRef.current = false;
            }, scrollingSpeed);
          }
        }
        touchStartXRef.current = null;
      } else if (!isHorizontal && touchStartYRef.current !== null) {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartYRef.current - touchEndY;
        const touchThreshold = 70;

        if (Math.abs(diff) >= touchThreshold) {
          const direction = diff > 0 ? 1 : -1;
          const nextSection = activeSectionRef.current + direction;
          if (nextSection >= 0 && nextSection < sectionsCount) {
            isScrollingRef.current = true;
            setActiveSection(nextSection);
            lastTransitionTimeRef.current = Date.now();
            setTimeout(() => {
              isScrollingRef.current = false;
            }, scrollingSpeed);
          }
        }
        touchStartYRef.current = null;
      }
    },
    [isHorizontal, sectionsCount, scrollingSpeed]
  );

  const handlePaginationClick = useCallback(
    (index: number) => {
      if (isScrollingRef.current || index === activeSection) return;
      showDotsTemporarily();
      isScrollingRef.current = true;
      setActiveSection(index);
      lastTransitionTimeRef.current = Date.now();
      setTimeout(() => {
        isScrollingRef.current = false;
      }, scrollingSpeed);
    },
    [activeSection, scrollingSpeed, showDotsTemporarily]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.addEventListener("wheel", handleWheel as unknown as EventListener, { passive: false });

    window.addEventListener("touchstart", handleTouchStart as unknown as EventListener, { passive: false });
    window.addEventListener("touchend", handleTouchEnd as unknown as EventListener);

    const preventPullToRefresh = (e: TouchEvent) => {
      if (isHorizontal && touchStartXRef.current) {
        const touchX = e.touches[0].clientX;
        if (touchX > touchStartXRef.current) {
          e.preventDefault();
        }
      } else if (!isHorizontal && touchStartYRef.current) {
        const touchY = e.touches[0].clientY;
        if (touchY > touchStartYRef.current) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("touchmove", preventPullToRefresh as unknown as EventListener, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel as unknown as EventListener);
      window.removeEventListener("touchstart", handleTouchStart as unknown as EventListener);
      window.removeEventListener("touchend", handleTouchEnd as unknown as EventListener);
      document.removeEventListener("touchmove", preventPullToRefresh as unknown as EventListener);
      if (wheelGestureTimerRef.current) clearTimeout(wheelGestureTimerRef.current);
      if (showDotsTimerRef.current) clearTimeout(showDotsTimerRef.current);
    };
  }, [sectionsCount, scrollingSpeed, isHorizontal, handleWheel, handleTouchStart, handleTouchEnd]);

  const renderPagination = () => (
    <div
      className={`swiper-pagination mainfull_navi ${showDots ? "visible" : "hidden"} ${
        isHorizontal ? "horizontal" : "vertical"
      }`}
      onMouseEnter={showDotsTemporarily}
    >
      {Array.from({ length: sectionsCount }).map((_, index) => (
        <span
          key={index}
          className={`swiper-pagination-bullet ${index === activeSection ? "swiper-pagination-bullet-active" : ""}`}
          onClick={() => handlePaginationClick(index)}
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: index === activeSection ? activeDotColor : dotColor,
            transform: index === activeSection ? `scale(1.2)` : `scale(1)`,
          }}
        />
      ))}
    </div>
  );

  useEffect(() => {
    if (activeSection === 1) {
      document.querySelector(".mainfull_navi")?.classList.add("bk");
      (document.querySelector("header.head") as HTMLElement)?.style?.setProperty("border", "none");
      (document.querySelector(".logo_header") as HTMLElement)?.style?.setProperty("color", "#000");
      document.querySelectorAll("nav > ul > li > a").forEach((item) => {
        (item as HTMLElement).style?.setProperty("color", "#000");
      });
    } else {
      document.querySelector(".mainfull_navi")?.classList.remove("bk");
      (document.querySelector("header.head") as HTMLElement)?.style?.setProperty("border-bottom", "1px solid #fff");
      (document.querySelector(".logo_header") as HTMLElement)?.style?.setProperty("color", "#fff");
      document.querySelectorAll("nav > ul > li > a").forEach((item) => {
        (item as HTMLElement).style?.setProperty("color", "#fff");
      });
    }

    if (activeSection === 2) {
      (document.querySelector("header.head") as HTMLElement)?.style?.setProperty("background", "#000");
    } else {
      (document.querySelector("header.head") as HTMLElement)?.style?.setProperty("background", "transparent");
    }
  }, [activeSection]);

  return (
    <div className="fullpage-container">
      <div
        className={`fullpage-sections-wrapper ${isHorizontal ? "horizontal" : "vertical"}`}
        style={{
          transform: isHorizontal ? `translateX(-${activeSection * 100}%)` : `translateY(-${activeSection * 100}%)`,
          transition: `transform ${scrollingSpeed}ms ease`,
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div className={`fullpage-section ${index === activeSection ? "active" : ""}`}>{child}</div>
        ))}
      </div>
      {renderPagination()}
    </div>
  );
};

const Section: React.FC<SectionProps> = ({ children }) => <>{children}</>;
FullPage.Section = Section;
export default FullPage;
