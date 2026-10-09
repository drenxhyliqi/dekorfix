"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

import { LayerWall } from "../layer-wall";

/** Three.js loads only when the section comes near, so the rest of the homepage stays light. */
const HouseScene = dynamic(() => import("./house-scene"), {
  ssr: false,
  loading: () => <span aria-hidden className="ls-house-loading" />,
});

/**
 * The 3D house for the "layer by layer" section, with a label for the stage
 * on screen. LayerWatcher feeds the house its progress and marks the label of
 * the layer being applied (`data-stage`). Without WebGL, the drawn wall is shown instead.
 */
export function LayerHouse({ stages }: { stages: Array<{ number: string; title: string }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const approach = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          // Checked once, when the house is about to be needed.
          const test = document.createElement("canvas");
          if (test.getContext("webgl2") ?? test.getContext("webgl")) setNear(true);
          else setWebgl(false);
          approach.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    // Render only while on screen.
    const onScreen = new IntersectionObserver((entries) => setVisible(entries.some((entry) => entry.isIntersecting)));
    approach.observe(element);
    onScreen.observe(element);
    return () => {
      approach.disconnect();
      onScreen.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="ls-house">
      {webgl ? (
        near && (
          <SceneBoundary fallback={<LayerWall paintedThrough={4} />}>
            <HouseScene active={visible} />
          </SceneBoundary>
        )
      ) : (
        <LayerWall paintedThrough={4} />
      )}
      <ol aria-hidden className="ls-house-stages">
        {stages.map((stage, index) => (
          <li key={stage.title} data-stage={index} className="ls-house-stage">
            <span className="ls-house-number">{stage.number}</span>
            {stage.title}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** If the 3D scene fails (lost context, old GPU), the drawn wall takes its place. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
