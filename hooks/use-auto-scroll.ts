"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useAutoScroll(isStreaming: boolean, streamedText = "") {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });
    setUserScrolledUp(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    // Consider scrolled up if more than 80px from bottom
    setUserScrolledUp(distanceToBottom > 80);
  }, []);

  // Stick to bottom while streaming if user hasn't scrolled up
  useEffect(() => {
    if (isStreaming && !userScrolledUp) {
      scrollToBottom(false);
    }
  }, [isStreaming, streamedText, userScrolledUp, scrollToBottom]);

  return {
    containerRef,
    showJumpToLatest: userScrolledUp,
    scrollToBottom,
    handleScroll,
  };
}
