import React, { useState, useEffect, useRef } from "react";
import { FullPageProps, SectionProps } from "./types";
import "./FullPage.css";

const FullPage: React.FC<FullPageProps> & { Section: React.FC<SectionProps> } = ({
  children,
  scrollingSpeed = 1000,
  showDotsAlways = true,
  dotColor = "#aaa",
  activeDotColor = "#000",
  dotSize = 10,
}) => {
  // ===== 상태 관리 =====
  const [activeSection, setActiveSection] = useState(0);
  const sectionsCount = React.Children.count(children);

  // 활성 섹션 추적
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // 스크롤 잠금 관련
  const isScrollingRef = useRef(false);
  const lastTransitionTimeRef = useRef(0);
  const gestureLockDuration = scrollingSpeed < 1000 ? 1200 : 1000;

  // 제스처 관련
  const gestureActiveRef = useRef(false);
  const gestureHasTransitionedRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const wheelGestureTimerRef = useRef<number | null>(null);
  const threshold = 50;
  const gestureDebounceDelay = 50;

  // Dot 표시 관련
  const [showDots, setShowDots] = useState(showDotsAlways);
  const showDotsRef = useRef(showDotsAlways);
  const showDotsTimerRef = useRef<number | null>(null);

  // showDotsAlways 값 변경 감지
  useEffect(() => {
    showDotsRef.current = showDotsAlways;
    setShowDots(showDotsAlways);
  }, [showDotsAlways]);

  // ===== 유틸리티 함수 =====
  // Dot 임시 표시 함수
  const showDotsTemporarily = () => {
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
  };

  // ===== 이벤트 핸들러 =====
  // 휠 이벤트 처리
  const handleWheel = (e: WheelEvent) => {
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

    wheelAccumRef.current += e.deltaY;

    if (!gestureHasTransitionedRef.current && Math.abs(wheelAccumRef.current) >= threshold) {
      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      const nextSection = activeSectionRef.current + direction;
      if (nextSection >= 0 && nextSection < sectionsCount) {
        gestureHasTransitionedRef.current = true;
        isScrollingRef.current = true;
        setActiveSection(nextSection);
        lastTransitionTimeRef.current = now;
        wheelAccumRef.current = 0;
        setTimeout(() => {
          isScrollingRef.current = false;
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
  };

  // 터치 이벤트 처리
  let touchStartY: number | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    if (isScrollingRef.current) return;
    showDotsTemporarily();
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isScrollingRef.current || touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
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
    touchStartY = null;
  };

  // 페이지네이션 클릭 처리
  const handlePaginationClick = (index: number) => {
    if (isScrollingRef.current || index === activeSection) return;
    showDotsTemporarily();
    isScrollingRef.current = true;
    setActiveSection(index);
    lastTransitionTimeRef.current = Date.now();
    setTimeout(() => {
      isScrollingRef.current = false;
    }, scrollingSpeed);
  };

  // ===== 이벤트 리스너 설정 =====
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    window.addEventListener("wheel", handleWheel as unknown as EventListener, { passive: false });
    window.addEventListener("touchstart", handleTouchStart as unknown as EventListener, { passive: true });
    window.addEventListener("touchend", handleTouchEnd as unknown as EventListener);

    return () => {
      window.removeEventListener("wheel", handleWheel as unknown as EventListener);
      window.removeEventListener("touchstart", handleTouchStart as unknown as EventListener);
      window.removeEventListener("touchend", handleTouchEnd as unknown as EventListener);
      if (wheelGestureTimerRef.current) clearTimeout(wheelGestureTimerRef.current);
      if (showDotsTimerRef.current) clearTimeout(showDotsTimerRef.current);
    };
  }, [sectionsCount, scrollingSpeed]);

  // ===== UI 컴포넌트 =====
  // 페이지네이션 렌더링
  const renderPagination = () => (
    <div
      className={`swiper-pagination mainfull_navi ${showDots ? "visible" : "hidden"}`}
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

  // ===== 스타일 업데이트 =====
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

  // ===== 렌더링 =====
  return (
    <div className="fullpage-container">
      <div
        className="fullpage-sections-wrapper"
        style={{
          transform: `translateY(-${activeSection * 100}vh)`,
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
