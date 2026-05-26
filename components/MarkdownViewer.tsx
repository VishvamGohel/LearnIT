import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen } from 'lucide-react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'dark', suppressErrorRendering: true });

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    mermaid.render('mermaid-svg-' + Math.random().toString(36).substring(7), chart)
      .then((result) => {
        setSvg(result.svg);
      })
      .catch(e => {
        setSvg(`<div class="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 my-6 overflow-x-auto shadow-xl"><div class="text-xs text-slate-500 mb-3 uppercase tracking-wider font-bold">Flowchart (Text Fallback)</div><code class="text-sm text-slate-300 font-mono whitespace-pre-wrap">${chart.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></div>`);
      });
  }, [chart]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center my-8 overflow-x-auto w-full" />;
};

interface MarkdownViewerProps {
  content?: string;
  title: string;
  isLoading?: boolean;
}

export default function MarkdownViewer({ content, title, isLoading }: MarkdownViewerProps) {
  return (
    <div className="flex flex-col h-full bg-slate-950/40 rounded-3xl overflow-hidden relative animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/60 flex items-center gap-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3 pl-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-slate-100 text-lg">{title}</h2>
        </div>
        {isLoading && (
          <span className="ml-auto flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Generating lesson with Gemini...
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-9 w-2/3 bg-slate-800 rounded-full animate-pulse" />
          </div>
          {/* 8-section skeletons */}
          {[
            { header: 'w-64', lines: ['w-full', 'w-5/6', 'w-4/6'] },
            { header: 'w-48', lines: ['w-full', 'w-3/4'] },
            { header: 'w-72', lines: ['w-full', 'w-full', 'w-5/6', 'w-4/5', 'w-3/4'] },
            { header: 'w-56', lines: ['w-full', 'w-4/5'] },
            { header: 'w-60', lines: ['w-full', 'w-full', 'w-5/6'] },
            { header: 'w-72', lines: ['w-full', 'w-3/5', 'w-4/5'] },
            { header: 'w-48', lines: [] },
            { header: 'w-52', lines: ['w-full', 'w-4/5', 'w-3/4', 'w-5/6'] },
          ].map((section, i) => (
            <div key={i} className="space-y-3" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`h-5 ${section.header} bg-emerald-900/40 rounded-full animate-pulse`} />
              {section.lines.map((w, j) => (
                <div key={j} className={`h-4 ${w} bg-slate-800/60 rounded-full animate-pulse`}
                  style={{ animationDelay: `${i * 80 + j * 40}ms` }} />
              ))}
              {i === 6 && (
                <div className="h-32 w-full bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
          <div className="text-slate-300 leading-relaxed max-w-prose mx-auto">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-black text-white mt-8 mb-6 tracking-tight" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mt-10 mb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-200 mt-8 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="mb-8 text-slate-300 text-[1.1rem] leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-8 mb-8 space-y-4 text-slate-300 marker:text-emerald-500" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-8 mb-8 space-y-4 text-slate-300 marker:text-emerald-500 font-medium" {...props} />,
                li: ({node, ...props}) => <li className="text-[1.1rem] leading-relaxed pl-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-emerald-300 bg-emerald-950/30 px-1 rounded-md" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500/50 bg-slate-900/50 p-4 rounded-r-xl italic text-slate-400 my-6 shadow-inner" {...props} />,
                code: ({node, inline, className, children, ...props}: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isMermaid = match && match[1] === 'mermaid';
                  
                  if (isMermaid) {
                    return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
                  }
                  
                  return inline 
                    ? <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                    : <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-6 my-6 overflow-x-auto shadow-xl"><code className="text-sm text-slate-300 font-mono whitespace-pre-wrap" {...props}>{children}</code></div>;
                },
              }}
            >
              {
                (content || "*No learning material provided for this node.*")
                  .replace(/^```(?:markdown|md)?\s*\n/i, '')
                  .replace(/\n```\s*$/i, '')
                  .replace(/^[ \t]+/gm, '')
              }
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
