import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ConfidenceFlag } from '../lib/types';
import InlinePopover from './InlinePopover';

interface AssistantMessageProps {
  message: Message;
  onUpdateFlagFeedback: (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => void;
  onOpenClarityPanel: () => void;
}

export default function AssistantMessage({
  message,
  onUpdateFlagFeedback,
  onOpenClarityPanel,
}: AssistantMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePopover, setActivePopover] = useState<{
    flag: ConfidenceFlag;
    x: number;
    y: number;
  } | null>(null);

  const flags = message.clarity?.flags || [];

  const handleFlagClick = (flag: ConfidenceFlag, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      setActivePopover({
        flag,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
      });
    }
  };

  const wrapTextWithFlags = (text: string, flagsList: ConfidenceFlag[]) => {
    if (!flagsList || flagsList.length === 0) return [text];

    const sortedFlags = [...flagsList].sort((a, b) => b.sentence.length - a.sentence.length);

    let segments: (string | React.ReactElement)[] = [text];

    for (const flag of sortedFlags) {
      const nextSegments: (string | React.ReactElement)[] = [];
      for (const segment of segments) {
        if (typeof segment === 'string') {
          let currentStr = segment;
          let index = currentStr.indexOf(flag.sentence);
          
          if (index !== -1) {
            while (index !== -1) {
              const before = currentStr.substring(0, index);
              const match = currentStr.substring(index, index + flag.sentence.length);
              currentStr = currentStr.substring(index + flag.sentence.length);

              if (before) nextSegments.push(before);

              // Check user feedback styling
              let decorationClass = "border-b-2 border-[#F59E0B] hover:bg-[#FFFBEB] dark:hover:bg-[#D4881E]/15";
              if (flag.userFeedback === 'verified') {
                decorationClass = "border-b-2 border-green-600 hover:bg-green-50/70 dark:hover:bg-green-500/15";
              } else if (flag.userFeedback === 'not_helpful') {
                decorationClass = "border-b border-dashed border-[#D1D1CF] dark:border-[#3A3A38] opacity-60";
              }

              nextSegments.push(
                <span
                  key={`${flag.id}-${index}-${Math.random()}`}
                  className={`${decorationClass} cursor-pointer transition-all duration-150 inline`}
                  onClick={(e) => handleFlagClick(flag, e)}
                >
                  {match}
                </span>
              );

              index = currentStr.indexOf(flag.sentence);
            }
            if (currentStr) nextSegments.push(currentStr);
          } else {
            nextSegments.push(segment);
          }
        } else {
          nextSegments.push(segment);
        }
      }
      segments = nextSegments;
    }

    return segments;
  };

  const renderChildren = (nodes: React.ReactNode): React.ReactNode => {
    if (typeof nodes === 'string') {
      return wrapTextWithFlags(nodes, flags);
    }
    if (Array.isArray(nodes)) {
      return nodes.map((child, index) => (
        <React.Fragment key={index}>{renderChildren(child)}</React.Fragment>
      ));
    }
    if (React.isValidElement(nodes)) {
      const children = nodes.props.children;
      if (children) {
        return React.cloneElement(nodes, {
          ...nodes.props,
          children: renderChildren(children),
        } as any);
      }
    }
    return nodes;
  };

  const markdownComponents = {
    p: ({ children }: any) => <p className="mb-4 last:mb-0">{renderChildren(children)}</p>,
    li: ({ children }: any) => <li className="mb-1">{renderChildren(children)}</li>,
    h1: ({ children }: any) => <h1 className="text-xl font-bold my-4">{renderChildren(children)}</h1>,
    h2: ({ children }: any) => <h2 className="text-lg font-bold my-3">{renderChildren(children)}</h2>,
    h3: ({ children }: any) => <h3 className="text-md font-bold my-2">{renderChildren(children)}</h3>,
    td: ({ children }: any) => <td className="border border-[#E5E5E3] dark:border-[#3A3A38] px-4 py-2">{renderChildren(children)}</td>,
    th: ({ children }: any) => <th className="border border-[#E5E5E3] dark:border-[#3A3A38] px-4 py-2 bg-gray-50 dark:bg-[#1F1F1E] font-semibold">{renderChildren(children)}</th>,
    span: ({ children }: any) => <span>{renderChildren(children)}</span>,
    strong: ({ children }: any) => <strong>{renderChildren(children)}</strong>,
    em: ({ children }: any) => <em>{renderChildren(children)}</em>,
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="prose max-w-none text-[#1A1A19] dark:text-[#F0EFEC] text-[15px] leading-relaxed break-words">
        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>

      {activePopover && (
        <InlinePopover
          flag={activePopover.flag}
          x={activePopover.x}
          y={activePopover.y}
          onClose={() => setActivePopover(null)}
          onSeeAllFlags={onOpenClarityPanel}
          onMarkVerified={(flagId) => onUpdateFlagFeedback(message.id, flagId, 'verified')}
        />
      )}
    </div>
  );
}
