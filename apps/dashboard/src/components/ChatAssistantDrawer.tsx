'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faPaperPlane,
  faFlask,
  faTruckFast,
  faShieldHalved,
  faTriangleExclamation,
  faRotateRight,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import {
  type ChatMessage,
  type ChatContextCard,
  defaultChatQuickPrompts,
} from '@supplai/contracts';
import { querySupplaiAssistant } from '../data/api';
import { Drawer, Button, IconButton } from './ui';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    threadId: 'th-lga-default',
    role: 'assistant',
    content:
      'Hello! I am your Supplai LGA Operations and Clinical Safety Assistant. You can ask me about nearby drug availability above clinic safety floors, WHO/NAFDAC transport packaging rules, tamper seal verification, cold-chain restrictions, or active transfer tracking.',
    timestamp: new Date().toISOString(),
    quickPrompts: defaultChatQuickPrompts,
  },
];

export function ChatAssistantDrawer({
  isOpen,
  onClose,
  onRequestTransfer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRequestTransfer?: ((facilityName: string, drug: string, qty: number) => void) | undefined;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (query: string) => {
    const text = query.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      threadId: 'th-lga-default',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const result = querySupplaiAssistant(text);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        threadId: 'th-lga-default',
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toISOString(),
        contextCard: result.contextCard,
        quickPrompts: defaultChatQuickPrompts,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        threadId: 'th-lga-default',
        role: 'assistant',
        content:
          'I could not process that request right now. Please check your network connection or try one of the suggested prompts.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  if (!isOpen) return null;

  return (
    <Drawer
      onClose={onClose}
      ariaLabel="Supplai Assistant Chat"
      title="Supplai LGA Assistant"
      subtitle={
        <>
          <span className="live-dot" /> Online • Dispatch & Safety Copilot
        </>
      }
      icon={faComments}
      className="chat-drawer"
      headerActions={
        <Button
          variant="ghost"
          size="sm"
          icon={faRotateRight}
          onClick={handleReset}
        >
          Reset
        </Button>
      }
    >

        {/* Message Thread */}
        <div className="chat-messages-container" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble-row ${msg.role === 'user' ? 'is-user' : 'is-assistant'}`}
            >
              <div className="chat-bubble">
                <p className="chat-text">{msg.content}</p>

                {/* Render Rich Context Card */}
                {msg.contextCard && (
                  <div className="chat-cards-list">
                    <ContextCardRenderer
                      card={msg.contextCard}
                      onRequestTransfer={onRequestTransfer}
                    />
                  </div>
                )}

                {/* Quick Prompts */}
                {msg.quickPrompts && msg.quickPrompts.length > 0 && (
                  <div className="chat-quick-prompts">
                    <p className="quick-prompts-label">Suggested questions:</p>
                    <div className="quick-prompts-row">
                      {msg.quickPrompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          type="button"
                          className="prompt-chip"
                          onClick={() => void handleSend(prompt.query)}
                        >
                          {prompt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="chat-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble-row is-assistant">
              <div className="chat-bubble is-typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt sticky bar */}
        <div className="chat-bottom-prompts">
          {defaultChatQuickPrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              className="bottom-prompt-pill"
              onClick={() => void handleSend(prompt.query)}
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend(inputText);
          }}
        >
          <input
            type="text"
            className="chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about stock availability, transport rules, or PINs..."
            disabled={isTyping}
          />
          <IconButton
            type="submit"
            icon={faPaperPlane}
            label="Send query"
            tone="cobalt"
            className="chat-send-btn"
            disabled={!inputText.trim() || isTyping}
          />
        </form>
    </Drawer>
  );
}

function ContextCardRenderer({
  card,
  onRequestTransfer,
}: {
  card: ChatContextCard;
  onRequestTransfer?: ((facilityName: string, drug: string, qty: number) => void) | undefined;
}) {
  if (card.type === 'facility_availability') {
    return (
      <div className="context-card facility-card-content">
        <div className="card-top">
          <span className="card-icon">
            <FontAwesomeIcon icon={faFlask} />
          </span>
          <div>
            <strong>{card.facilityName}</strong>
            <span className="card-sub">
              {card.distanceKm} km away • ~{card.etaMinutes} min by rider
            </span>
          </div>
        </div>
        <div className="card-stats-row">
          <div className="card-stat">
            <span className="stat-label">On hand</span>
            <span className="stat-val">
              {card.quantityOnHand} {card.commodity.toUpperCase()}
            </span>
          </div>
          <div className="card-stat">
            <span className="stat-label">Safety floor</span>
            <span className="stat-val">
              {card.quantityOnHand - card.transferableQuantity} reserved
            </span>
          </div>
          <div className="card-stat is-highlight">
            <span className="stat-label">Transferable</span>
            <span className="stat-val">
              {card.transferableQuantity} available
            </span>
          </div>
        </div>
        <div className="card-lot-info">
          <span>
            Batch: <strong>{card.batchNumber}</strong>
          </span>
          <span>
            Expiry: <strong>{card.expiresOn}</strong>
          </span>
        </div>
        {onRequestTransfer && card.canRequest && (
          <Button
            variant="primary"
            size="md"
            block
            className="card-cta-btn"
            onClick={() =>
              onRequestTransfer(
                card.facilityName,
                card.commodity.toUpperCase(),
                20,
              )
            }
          >
            {card.requestActionText}
          </Button>
        )}
      </div>
    );
  }

  if (card.type === 'safety_guideline') {
    const isColdChain = card.storageType === 'cold_chain';
    return (
      <div
        className={`context-card safety-card-content ${isColdChain ? 'is-cold-chain-warning' : ''}`}
      >
        <div className="card-top">
          <span className="card-icon">
            <FontAwesomeIcon
              icon={isColdChain ? faTriangleExclamation : faShieldHalved}
            />
          </span>
          <div>
            <strong>{card.medicineName} Safety Standards</strong>
            <span className="card-sub">
              {card.temperatureRange} · {card.storageType}
            </span>
          </div>
        </div>

        {card.warnings.length > 0 && (
          <div className="card-warning-callout">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>{card.warnings[0]}</span>
          </div>
        )}

        <ul className="card-rules-list">
          <li>
            <strong>Packaging:</strong> {card.packagingRule}
          </li>
          <li>
            <strong>NAFDAC Rule:</strong> {card.nafdacGsdpRule}
          </li>
        </ul>

        <div className="card-lot-info">
          <span>
            Tamper Seal Required:{' '}
            <strong>{card.tamperSealRequired ? 'Yes (4-digit)' : 'No'}</strong>
          </span>
        </div>
      </div>
    );
  }

  if (card.type === 'order_status') {
    return (
      <div className="context-card order-card-content">
        <div className="card-top">
          <span className="card-icon">
            <FontAwesomeIcon icon={faTruckFast} />
          </span>
          <div>
            <strong>{card.orderReference}</strong>
            <span className="card-sub">Status: {card.currentStatus}</span>
          </div>
        </div>
        <div className="card-route-info">
          <span>
            <strong>From:</strong> {card.originFacility}
          </span>
          <span>
            <strong>To:</strong> {card.destinationFacility}
          </span>
        </div>
        <div className="card-courier-row">
          <span>
            Courier: <strong>{card.riderName}</strong>
          </span>
          <span>
            ETA: <strong>{card.etaMinutes} min away</strong>
          </span>
        </div>
        <div className="card-lot-info">
          <span>
            Picked up at: <strong>{card.pickedUpAt}</strong>
          </span>
        </div>
      </div>
    );
  }

  if (card.type === 'handover_help') {
    return (
      <div className="context-card handover-card-content">
        <div className="card-top">
          <span className="card-icon">
            <FontAwesomeIcon icon={faLock} />
          </span>
          <div>
            <strong>Handover Custody Verification</strong>
            <span className="card-sub">
              PIN: {card.expectedPin} · Seal #{card.sealNumber}
            </span>
          </div>
        </div>
        <ol className="card-steps-list">
          {card.refusalChecklist.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
        <div className="card-supervisor-note">
          <strong>Attempts Remaining:</strong> {card.attemptsRemaining} of 3
        </div>
      </div>
    );
  }

  if (card.type === 'dispensing_guide') {
    return (
      <div className="context-card dispensing-card-content">
        <div className="card-top">
          <span className="card-icon">
            <FontAwesomeIcon icon={faFlask} />
          </span>
          <div>
            <strong>{card.medicineName} Dispensing Protocol</strong>
            <span className="card-sub">{card.treatmentDuration}</span>
          </div>
        </div>
        <ul className="card-rules-list">
          <li>
            <strong>Reconstitution:</strong> {card.reconstitution}
          </li>
          <li>
            <strong>Dosage:</strong> {card.dosageSchedule}
          </li>
        </ul>
        <div className="card-supervisor-note">
          <small>{card.clinicalDisclaimer}</small>
        </div>
      </div>
    );
  }

  return null;
}
