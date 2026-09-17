import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Sparkles,
  Plus,
  Send,
  X,
  Copy,
  RotateCcw,
  Download,
  Trash2,
  LoaderCircle,
  Check,
  Pencil,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { storage } from '../services/storage';
import { generateResponse } from '../services/aiTutorService';

const defaultWelcomeMessage = {
  role: 'ai',
  text: "Hello! I'm your local StudyMate AI tutor. Choose a tutor mode above or ask any question to get started. I can explain concepts step-by-step, guide you Socratically, or generate quick revision notes.",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: 'demo',
};

export function ChatPage({ data }) {
  const { profile, personalization, notify } = data;
  const [conversations, setConversations] = useState(() =>
    storage.get('chat-conversations', [
      {
        id: 'welcome',
        title: "Today's study session",
        messages: [defaultWelcomeMessage],
        updatedAt: Date.now(),
      },
    ])
  );
  const [activeId, setActiveId] = useState(() => storage.get('active-conversation', 'welcome'));
  const [mode, setMode] = useState(() => storage.get('tutor-mode', 'Tutor'));
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [lastSource, setLastSource] = useState('demo');
  const [serviceNotice, setServiceNotice] = useState('');
  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || conversations[0] || {
    id: 'fallback',
    title: 'Study Session',
    messages: [defaultWelcomeMessage],
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages?.length, typing]);

  const updateConversations = (next) => {
    setConversations(next);
    storage.set('chat-conversations', next);
  };

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed || typing) return;

    const userMessage = {
      role: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...active.messages, userMessage];
    const nextConversations = conversations.map((item) =>
      item.id === active.id
        ? {
            ...item,
            messages: nextMessages,
            title:
              item.title === 'New conversation' || item.title === "Today's study session"
                ? trimmed.slice(0, 32)
                : item.title,
            updatedAt: Date.now(),
          }
        : item
    );

    updateConversations(nextConversations);
    setInput('');
    setTyping(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const responseObj = await generateResponse({
        text: trimmed,
        mode,
        profile,
        personalization,
        signal: controller.signal,
      });

      setLastSource(responseObj.source);
      setServiceNotice(
        responseObj.notice || (responseObj.source === 'demo' ? 'Using built-in StudyMate Tutor mode' : '')
      );

      const aiMessage = {
        role: 'ai',
        text: responseObj.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: responseObj.source,
      };

      updateConversations(
        nextConversations.map((item) =>
          item.id === active.id ? { ...item, messages: [...nextMessages, aiMessage] } : item
        )
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorAiMessage = {
          role: 'ai',
          text: 'An error occurred while generating a response. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'demo',
        };
        updateConversations(
          nextConversations.map((item) =>
            item.id === active.id ? { ...item, messages: [...nextMessages, errorAiMessage] } : item
          )
        );
      }
    } finally {
      setTyping(false);
      abortRef.current = null;
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'New conversation',
      messages: [defaultWelcomeMessage],
      updatedAt: Date.now(),
    };
    const next = [newChat, ...conversations];
    updateConversations(next);
    setActiveId(newChat.id);
    storage.set('active-conversation', newChat.id);
  };

  const deleteActiveChat = () => {
    const remaining = conversations.filter((c) => c.id !== active.id);
    const fallback = remaining[0] || {
      id: `chat-${Date.now()}`,
      title: 'New conversation',
      messages: [defaultWelcomeMessage],
      updatedAt: Date.now(),
    };
    const next = remaining.length ? remaining : [fallback];
    updateConversations(next);
    setActiveId(fallback.id);
    storage.set('active-conversation', fallback.id);
    notify('Conversation deleted.');
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    notify('Response copied to clipboard.');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportChat = () => {
    const exportText = active.messages
      .map((m) => `[${m.time}] ${m.role === 'ai' ? 'StudyMate AI' : profile?.name || 'User'}:\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${active.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.txt`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Chat transcript exported.');
  };

  const lastAiMessage = [...active.messages].reverse().find((m) => m.role === 'ai');
  const lastUserMessage = [...active.messages].reverse().find((m) => m.role === 'user');

  const renameActiveChat = () => {
    const nextTitle = window.prompt('Name this conversation', active.title);
    if (!nextTitle?.trim()) return;
    updateConversations(
      conversations.map((item) =>
        item.id === active.id ? { ...item, title: nextTitle.trim(), updatedAt: Date.now() } : item
      )
    );
  };

  return (
    <div className="chat-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">LOCAL AI TUTOR</span>
          <h1>Learn in conversation.</h1>
          <p>
            Deterministic, contextual offline responses tailored to your{' '}
            <strong>{profile.exam}</strong> roadmap. Optional Ollama integration available.
          </p>
        </div>
        <Badge tone={lastSource === 'ollama' ? 'indigo' : 'teal'}>
          <span className="status-dot" />
          {lastSource === 'ollama' ? 'Ollama (Local LLM)' : 'Local Demo AI'}
        </Badge>
      </div>

      <div className="chat-layout">
        <Card className="conversation-list">
          <div className="conversation-header">
            <strong>Conversations</strong>
            <Button
              variant="icon"
              icon={Plus}
              aria-label="New conversation"
              onClick={createNewChat}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
            {conversations.map((conv) => (
              <button
                className={`conversation ${conv.id === active.id ? 'active' : ''}`}
                key={conv.id}
                onClick={() => {
                  setActiveId(conv.id);
                  storage.set('active-conversation', conv.id);
                }}
              >
                <span className="conversation-icon">
                  <MessageCircle size={15} />
                </span>
                <span>
                  <strong>{conv.title}</strong>
                  <small>{conv.messages.length} messages</small>
                </span>
              </button>
            ))}
          </div>

          <div className="conversation-footer">
            <Sparkles size={16} />
            <small>100% private. Stored in your local browser storage.</small>
          </div>
        </Card>

        <Card className="chat-window">
          {serviceNotice && (
            <div className="service-notice" role="status">
              <Sparkles size={14} />
              {serviceNotice}
            </div>
          )}
          <div className="chat-toolbar">
            <div>
              <strong>{active.title}</strong>
              <small>
                <span className="status-dot" /> Mode: <strong>{mode}</strong>
              </small>
            </div>
            <div className="mode-select">
              <span>Tutor Mode:</span>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  storage.set('tutor-mode', e.target.value);
                  notify(`Switched to ${e.target.value} mode.`);
                }}
              >
                {['Tutor', 'Socratic', 'Explain Simply', 'Doubt Solver', 'Revision'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="message-scroll">
            {active.messages.map((message, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message-row ${message.role}`}
                key={`${message.time}-${idx}`}
              >
                <div className={`message-avatar ${message.role}`}>
                  {message.role === 'ai' ? (
                    <Sparkles size={15} />
                  ) : (
                    (profile?.name || 'ME').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="message-body">
                  <div className="message-meta">
                    <strong>{message.role === 'ai' ? 'StudyMate AI' : profile.name}</strong>
                    <small>{message.time}</small>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                  {message.role === 'ai' && (
                    <button
                      className="copy-button"
                      onClick={() => copyMessage(message.text, idx)}
                    >
                      {copiedIndex === idx ? <Check size={13} /> : <Copy size={13} />}
                      {copiedIndex === idx ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {typing && (
              <div className="typing">
                <LoaderCircle size={16} className="spin" />
                <span>Generating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="suggested-prompts">
            {[
              `Explain my weakest subject: ${personalization.weakSubjects[0] || 'Calculus'}`,
              'Give me a 10-minute revision sprint',
              'Quiz me with one question',
              'Break down a high-yield concept',
            ].map((prompt) => (
              <button key={prompt} onClick={() => handleSend(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="chat-composer">
            <textarea
              aria-label="Message your tutor"
              value={input}
              rows={2}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask a question or topic in ${mode} mode...`}
            />
            <Button
              icon={typing ? X : Send}
              disabled={!typing && !input.trim()}
              onClick={() => {
                if (typing) {
                  abortRef.current?.abort();
                  setTyping(false);
                } else {
                  handleSend();
                }
              }}
            >
              {typing ? 'Cancel' : 'Send'}
            </Button>
          </div>

          <div className="chat-footer-actions">
            <button
              onClick={renameActiveChat}
            >
              <Pencil size={14} /> Rename
            </button>
            <button
              onClick={() => {
                if (lastAiMessage) copyMessage(lastAiMessage.text, 9999);
              }}
            >
              <Copy size={14} /> Copy last
            </button>
            <button
              onClick={() => {
                if (lastUserMessage) handleSend(lastUserMessage.text);
              }}
            >
              <RotateCcw size={14} /> Regenerate
            </button>
            <button onClick={exportChat}>
              <Download size={14} /> Export
            </button>
            <button onClick={deleteActiveChat}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ChatPage;
