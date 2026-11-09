'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface TimelineStep {
  title: string;
  detail?: string;
  icon?: IconDefinition;
}

export function OrderTimeline({
  steps,
  currentIndex,
  etaLabel,
  orientation = 'vertical',
}: {
  steps: TimelineStep[];
  currentIndex: number;
  etaLabel?: string;
  orientation?: 'vertical' | 'horizontal';
}) {
  return (
    <div className={`ui-timeline ui-timeline--${orientation}`}>
      <ol className="ui-timeline__list">
        {steps.map((step, index) => {
          const state =
            index < currentIndex
              ? 'is-complete'
              : index === currentIndex
                ? 'is-current'
                : 'is-future';
          return (
            <li key={step.title} className={`ui-timeline__step ${state}`}>
              <span className="ui-timeline__marker" aria-hidden="true">
                <FontAwesomeIcon
                  icon={index < currentIndex ? faCheck : (step.icon ?? faCheck)}
                />
              </span>
              <span className="ui-timeline__content">
                <strong className="ui-timeline__title">{step.title}</strong>
                {step.detail && (
                  <span className="ui-timeline__detail">{step.detail}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {etaLabel && orientation === 'vertical' && (
        <p className="ui-timeline__eta">{etaLabel}</p>
      )}
    </div>
  );
}