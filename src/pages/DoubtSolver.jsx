import { useState } from 'react';
import {
  Upload,
  Sparkles,
  FileText,
  LoaderCircle,
  HelpCircle,
  Copy,
  Download,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeading } from '../components/ui/SectionHeading';
import { EmptyState } from '../components/ui/EmptyState';
import { generateResponse } from '../services/demoAI';
import { recognize } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

export function DoubtSolver({ data }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(null);
  const [solution, setSolution] = useState('');
  const [solving, setSolving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const handleFileProcess = async (selected) => {
    if (!selected) return;
    setErrorNotice('');
    setSolution('');

    if (selected.size > 15 * 1024 * 1024) {
      setErrorNotice('This file exceeds 15 MB. Please choose a smaller file.');
      return;
    }

    setFile(selected);
    setLoading(true);

    try {
      if (selected.type.startsWith('image/')) {
        // Real OCR via Tesseract.js
        setOcrProgress('Running local OCR engine...');
        const result = await recognize(selected, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(`Recognizing text: ${Math.round(m.progress * 100)}%`);
            }
          },
        });

        const extracted = result?.data?.text?.trim();
        if (extracted) {
          setText(extracted);
          data?.notify?.('Text extracted from image successfully!');
        } else {
          setText('No clear text could be detected in this image. You can type or paste your question below.');
        }
      } else if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf')) {
        // PDF extraction via pdfjs-dist
        setOcrProgress('Reading PDF document...');
        const arrayBuffer = await selected.arrayBuffer();

        try {
          // Set worker if not already set
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
          }

          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          let fullText = '';
          const maxPages = Math.min(pdfDoc.numPages, 5); // Read up to first 5 pages

          for (let p = 1; p <= maxPages; p++) {
            const page = await pdfDoc.getPage(p);
            const textContent = await page.getTextContent();
            const pageStrings = textContent.items.map((item) => item.str).join(' ');
            if (pageStrings.trim()) {
              fullText += (fullText ? '\n\n' : '') + `[Page ${p}]:\n` + pageStrings;
            }
          }

          if (fullText.trim()) {
            setText(fullText);
            data?.notify?.(`Extracted text from ${maxPages} page(s) of PDF.`);
          } else {
            setText(
              `PDF loaded (${selected.name}), but contains scanned raster images without embedded text. Type or paste your question directly below.`
            );
          }
        } catch (pdfErr) {
          console.warn('PDF.js text parse fallback:', pdfErr);
          setText(
            `PDF loaded (${selected.name}). Please paste or type the specific question or formula below for step-by-step resolution.`
          );
        }
      } else {
        // Plain text / Markdown
        const reader = new FileReader();
        reader.onload = (e) => {
          setText(String(e.target.result || ''));
          data?.notify?.('Text file loaded.');
        };
        reader.onerror = () => {
          setErrorNotice('Failed to read text file. You can paste your question directly.');
        };
        reader.readAsText(selected);
      }
    } catch (err) {
      console.error('File extraction error:', err);
      setErrorNotice('Extraction encountered an issue. You can still paste or type your question below.');
    } finally {
      setLoading(false);
      setOcrProgress(null);
    }
  };

  const handleSolve = async () => {
    if (!text.trim() || solving) return;
    setSolving(true);
    setSolution('');

    try {
      const response = await generateResponse({
        text: `Solve this student doubt step-by-step with clear reasoning:\n\n${text}`,
        mode: 'Doubt Solver',
        profile: data?.profile,
        personalization: data?.personalization,
      });

      setSolution(response.text);
      data?.notify?.('Step-by-step solution generated!');
    } catch {
      setSolution(
        '1. Identify the given parameters and constraints.\n2. State the governing formula or principle.\n3. Substitute values carefully with unit checks.\n4. Verify your final answer.'
      );
    } finally {
      setSolving(false);
    }
  };

  const copySolution = () => {
    navigator.clipboard?.writeText(solution);
    setCopied(true);
    data?.notify?.('Solution copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const exportSolution = () => {
    const content = `StudyMate AI - Doubt Solution\nQuestion:\n${text}\n\nSolution:\n${solution}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'doubt_solution.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">MULTI-FORMAT OCR & AI SOLVER</span>
          <h1>Untangle a tricky doubt.</h1>
          <p>
            Upload a photo of a textbook question, problem sheet PDF, or paste text directly. Edit
            the prompt before solving.
          </p>
        </div>
        <Badge tone="teal">
          <FileText size={13} /> Local OCR + Document Reader
        </Badge>
      </div>

      <div className="doubt-grid">
        <Card className="upload-card">
          <div
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) handleFileProcess(e.dataTransfer.files[0]);
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*,.pdf,.txt,.md"
              onChange={(e) => {
                if (e.target.files[0]) handleFileProcess(e.target.files[0]);
              }}
            />
            <label htmlFor="file-input">
              <div className="upload-icon">
                <Upload size={22} />
              </div>
              <strong>{file ? file.name : 'Drop a question image, PDF, or text here'}</strong>
              <span>{file ? 'Click or drop to replace' : 'or click to browse your device'}</span>
              <small>Images (PNG/JPG with Tesseract OCR), PDFs (PDF.js), or TXT files.</small>
            </label>
          </div>

          {loading && (
            <div className="loading-state" style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#5b5bf7', fontSize: 12 }}>
              <LoaderCircle size={17} className="spin" />
              <span>{ocrProgress || 'Extracting text...'}</span>
            </div>
          )}

          {errorNotice && (
            <div className="form-error" style={{ marginTop: 12 }}>
              <AlertCircle size={15} />
              {errorNotice}
            </div>
          )}

          <label className="field" style={{ marginTop: 18 }}>
            <span>Question text (editable after extraction)</span>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a tricky question or formula here, or upload an image/PDF above..."
            />
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button
              icon={solving ? LoaderCircle : Sparkles}
              disabled={loading || solving || !text.trim()}
              onClick={handleSolve}
            >
              {solving ? 'Solving step-by-step...' : 'Solve step by step'}
            </Button>
            {text && (
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={() => {
                  setText('');
                  setFile(null);
                  setSolution('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </Card>

        <Card className="solution-card">
          <SectionHeading
            eyebrow="WORKED SOLUTION"
            title="Step-by-step reasoning"
            action={
              solution ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="copy-button" onClick={copySolution}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button className="copy-button" onClick={exportSolution}>
                    <Download size={14} /> Save
                  </button>
                </div>
              ) : null
            }
          />

          {solution ? (
            <div className="solution-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {solution}
            </div>
          ) : (
            <EmptyState
              icon={HelpCircle}
              title="Your worked solution will appear here"
              text="Upload a photo or paste a question on the left, then click 'Solve step by step'."
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export default DoubtSolver;
