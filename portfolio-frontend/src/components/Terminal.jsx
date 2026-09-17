import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Terminal as TermIcon, Sparkles } from 'lucide-react';

const initialLogs = [
  { text: "<span style='color: #8b5cf6; font-weight: bold;'>┌──(vaishnav㉿dev-os)-[~]</span>", isAccent: true },
  { text: "<span style='color: #06b6d4;'>└─$ Welcome to Vaishnav Gaware's Interactive Developer CLI (v3.0)</span>", isAccent: true },
  { text: "> Type <span class='cmd-highlight'>'help'</span> or <span class='cmd-highlight'>'fetch'</span> to get started, or click quick shortcut chips below.", isAccent: false }
];

export function Terminal() {
  const [logs, setLogs] = useState(initialLogs);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const terminalBodyRef = useRef(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs]);

  const commandRegistry = {
    help: [
      "Available CLI Commands:",
      "  <span class='cmd-highlight'>fetch</span>     - Print full developer system summary & specs",
      "  <span class='cmd-highlight'>skills</span>    - List core technical stack & frameworks",
      "  <span class='cmd-highlight'>projects</span>  - Display featured production repositories",
      "  <span class='cmd-highlight'>contact</span>   - Show email and social profile links",
      "  <span class='cmd-highlight'>about</span>     - Brief developer background & education",
      "  <span class='cmd-highlight'>sudo</span>      - Execute admin override request",
      "  <span class='cmd-highlight'>github</span>    - Open GitHub profile in new tab",
      "  <span class='cmd-highlight'>linkedin</span>  - Open LinkedIn profile in new tab",
      "  <span class='cmd-highlight'>date</span>      - Print current UTC timestamp",
      "  <span class='cmd-highlight'>clear</span>     - Clear terminal logs"
    ],
    fetch: [
      "<span style='color: #8b5cf6; font-weight: bold;'>OS</span>: Vaishnav OS (Linux x86_64)",
      "<span style='color: #06b6d4; font-weight: bold;'>Kernel</span>: 5.15.0-88-generic",
      "<span style='color: #ec4899; font-weight: bold;'>Uptime</span>: 99.98% System Stability",
      "<span style='color: #10b981; font-weight: bold;'>Shell</span>: zsh 5.8.1 (x86_64-apple-darwin21.0)",
      "<span style='color: #eab308; font-weight: bold;'>Role</span>: Full-Stack Developer & AI Systems Engineer",
      "<span style='color: #8b5cf6; font-weight: bold;'>Degree</span>: B.E AI & Data Science",
      "<span style='color: #06b6d4; font-weight: bold;'>Primary Tech</span>: React, Next.js, Node.js, Python, TypeScript, Docker"
    ],
    skills: [
      "⚡ Technical Expertise Stack:",
      "  • <span style='color: #8b5cf6;'>Frontend</span> : React, Next.js, TypeScript, Tailwind CSS, HTML5/CSS3",
      "  • <span style='color: #06b6d4;'>Backend</span>  : Node.js, Express, Hono, Python, FastAPI, REST/GraphQL",
      "  • <span style='color: #ec4899;'>DB & Cloud</span>: PostgreSQL, MongoDB, ChromaDB, Redis, Docker, AWS",
      "  • <span style='color: #10b981;'>AI & ML</span>  : LangChain, Ollama, TensorFlow, Scikit-Learn, Pandas"
    ],
    projects: [
      "🚀 Featured Repositories:",
      "  1. <span style='color: #8b5cf6; font-weight: bold;'>Sales Analytics & Churn Prediction</span> [Data Analytics & ML Model]",
      "  2. <span style='color: #06b6d4; font-weight: bold;'>Productivity-Pro</span> [Full-Stack Collaborative Workspace]",
      "  3. <span style='color: #ec4899; font-weight: bold;'>My Study Assistant</span> [AI Study & Flashcard Platform]",
      "  4. <span style='color: #10b981; font-weight: bold;'>Deskify</span> [Client-side Wallpaper Utility]",
      "  5. <span style='color: #eab308; font-weight: bold;'>Form-Builder</span> [Drag & Drop Form Canvas]",
      "  6. <span style='color: #a855f7; font-weight: bold;'>Mentor Backend</span> [REST API Service]"
    ],
    contact: [
      "📫 Contact Channels:",
      "  • Email    : <a href='mailto:vaishnavgaware1@gmail.com' style='color: #8b5cf6;'>vaishnavgaware1@gmail.com</a>",
      "  • GitHub   : <a href='https://github.com/Vaishnav0299' target='_blank' style='color: #06b6d4;'>https://github.com/Vaishnav0299</a>",
      "  • LinkedIn : <a href='https://www.linkedin.com/in/vaishnav-gaware-107799315/' target='_blank' style='color: #ec4899;'>linkedin.com/in/vaishnav-gaware</a>"
    ],
    about: [
      "👨‍💻 Developer Summary:",
      "  Vaishnav Gaware is an AI & Data Science Undergraduate (B.E).",
      "  Specializing in full-stack web architectures, agentic AI systems, and automated data pipelines."
    ],
    sudo: [
      "<span style='color: #ef4444; font-weight: bold;'>[ACCESS DENIED]</span> sudo: Permission granted! You are now operating as root on dev-os ⚡"
    ],
    github: () => {
      window.open('https://github.com/Vaishnav0299', '_blank');
      return ['Opening GitHub profile...'];
    },
    linkedin: () => {
      window.open('https://www.linkedin.com/in/vaishnav-gaware-107799315/', '_blank');
      return ['Opening LinkedIn profile...'];
    },
    date: () => [
      `Current Server Timestamp: ${new Date().toISOString()}`
    ],
    whoami: [
      "vaishnav@dev-os (Developer Mode Active)"
    ]
  };

  const handleRunCommand = (rawCmd) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    // Add to command history
    setHistory(prev => [rawCmd, ...prev.filter(c => c !== rawCmd)]);
    setHistoryIdx(-1);

    if (cmd === 'clear') {
      setLogs([{ text: "> Terminal cleared. Type 'help' for commands.", isAccent: true }]);
      return;
    }

    const newLogLines = [
      { text: `<span style='color: #8b5cf6;'>vaishnav@dev-os:~$</span> ${rawCmd}`, isPrompt: true }
    ];

    if (commandRegistry[cmd]) {
      const res = typeof commandRegistry[cmd] === 'function'
        ? commandRegistry[cmd]()
        : commandRegistry[cmd];
      res.forEach(line => newLogLines.push({ text: line, isOutput: true }));
    } else {
      newLogLines.push({
        text: `<span style="color: #ef4444;">zsh: command not found: ${cmd}</span>. Type <span class='cmd-highlight'>'help'</span> for list of commands.`,
        isOutput: true
      });
    }

    setLogs(prev => [...prev, ...newLogLines]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const prevIdx = historyIdx - 1;
        setHistoryIdx(prevIdx);
        setInputVal(history[prevIdx] || '');
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  return (
    <section id="system-terminal" className="terminal-section">
      <div className="section-header">
        <h2 className="section-title">Interactive CLI Console</h2>
        <p className="section-subtitle">Type commands below or click quick shortcuts to interact with the environment.</p>
      </div>

      <div className="terminal-mock">
        <div className="terminal-titlebar">
          <div className="terminal-dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <span className="terminal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TermIcon style={{ width: 14, height: 14, color: 'var(--accent-primary)' }} /> vaishnav@dev-os:~
          </span>
          <div className="terminal-actions">
            <button className="term-btn" onClick={() => setLogs([{ text: "> Terminal cleared.", isAccent: true }])} title="Clear Terminal">
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="terminal-quick-chips">
          <span className="chip-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles style={{ width: 13, height: 13, color: 'var(--accent-secondary)' }} /> Quick Commands:
          </span>
          {['help', 'fetch', 'skills', 'projects', 'contact', 'clear'].map(chip => (
            <button key={chip} className="term-chip" onClick={() => handleRunCommand(chip)}>
              {chip}
            </button>
          ))}
        </div>

        <div className="terminal-body" ref={terminalBodyRef} id="interactive-terminal-logs">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`log-line ${log.isAccent ? 'text-accent' : ''}`}
              dangerouslySetInnerHTML={{ __html: log.text }}
            />
          ))}
        </div>

        <div className="terminal-input-row">
          <span className="term-prompt" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>vaishnav@dev-os:~$</span>
          <input
            type="text"
            id="terminal-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. help, fetch, skills, projects)... [Use ↑ ↓ for history]"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </section>
  );
}
