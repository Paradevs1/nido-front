import React from "react";

export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let currentNumberedList: string[] = [];
  let keyCounter = 0;

  const sanitizeHref = (rawHref: string): string => {
    const href = (rawHref || "").trim();
    if (!href) return "#";

    const lower = href.toLowerCase();
    // Bloqueia esquemas perigosos
    if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
      return "#";
    }

    const isAbsolute =
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("mailto:") ||
      lower.startsWith("tel:");
    const isRelative = href.startsWith("/") || href.startsWith("#");

    if (isAbsolute || isRelative) return href;
    return `https://${href}`;
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${keyCounter++}`} className="list-disc list-inside space-y-1 ml-4">
          {currentList.map((item, idx) => (
            <li key={idx}>
              {renderFormatting(item.trim().replace(/^[-*]\s*/, ""))}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushNumberedList = () => {
    if (currentNumberedList.length > 0) {
      elements.push(
        <ol key={`numbered-list-${keyCounter++}`} className="list-decimal list-outside space-y-1 ml-6 pl-2">
          {currentNumberedList.map((item, idx) => {
            const match = item.trim().match(/^(\d+)\.\s*/);
            const value = match ? Number(match[1]) : undefined;
            const content = item.trim().replace(/^\d+\.\s*/, "");

            return (
              <li key={idx} className="mb-1" value={value}>
                {renderFormatting(content)}
              </li>
            );
          })}
        </ol>
      );
      currentNumberedList = [];
    }
  };

  const renderTextFormatting = (line: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*([^*\n]+?)\*/g;
    
    const matches: Array<{ type: 'bold' | 'italic'; start: number; end: number; content: string }> = [];
    
    let match;
    while ((match = boldRegex.exec(line)) !== null) {
      matches.push({
        type: 'bold',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1]
      });
    }
    
    while ((match = italicRegex.exec(line)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      
      const isInsideBold = matches.some(m => 
        m.type === 'bold' && start >= m.start && end <= m.end
      );
      
      const beforeChar = start > 0 ? line[start - 1] : '';
      const afterChar = end < line.length ? line[end] : '';
      const isPartOfBold = beforeChar === '*' || afterChar === '*';
      
      if (!isInsideBold && !isPartOfBold) {
        matches.push({
          type: 'italic',
          start,
          end,
          content: match[1]
        });
      }
    }
    
    matches.sort((a, b) => a.start - b.start);
    
    const filteredMatches = matches.filter((match, index) => {
      if (match.type === 'italic') {
        return !matches.some((other, otherIndex) => 
          otherIndex < index && 
          other.type === 'bold' && 
          match.start >= other.start && 
          match.end <= other.end
        );
      }
      return true;
    });
    
    filteredMatches.forEach((match) => {
      if (match.start > lastIndex) {
        const beforeText = line.substring(lastIndex, match.start);
        if (beforeText) {
          parts.push(
            <React.Fragment key={`text-${keyCounter++}`}>
              {beforeText}
            </React.Fragment>
          );
        }
      }
      
      if (match.type === 'bold') {
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-bold text-white">
            {renderItalic(match.content)}
          </strong>
        );
      } else {
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {match.content}
          </em>
        );
      }
      
      lastIndex = match.end;
    });
    
    if (lastIndex < line.length) {
      const remainingText = line.substring(lastIndex);
      if (remainingText) {
        parts.push(
          <React.Fragment key={`text-${keyCounter++}`}>
            {remainingText}
          </React.Fragment>
        );
      }
    }
    
    return parts.length > 0 ? <>{parts}</> : line;
  };

  const renderFormatting = (line: string): React.ReactNode => {
    // Suporte básico a link markdown: [texto](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(line)) !== null) {
      const before = line.substring(lastIndex, match.index);
      if (before) {
        parts.push(
          <React.Fragment key={`formatting-${keyCounter++}`}>
            {renderTextFormatting(before)}
          </React.Fragment>
        );
      }

      const linkText = match[1] ?? "";
      const linkUrl = match[2] ?? "";
      const href = sanitizeHref(linkUrl);

      const isExternal =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:");

      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-blue-400 hover:underline"
        >
          {renderTextFormatting(linkText)}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      const remaining = line.substring(lastIndex);
      if (remaining) {
        parts.push(
          <React.Fragment key={`formatting-${keyCounter++}`}>
            {renderTextFormatting(remaining)}
          </React.Fragment>
        );
      }
    }

    return parts.length > 0 ? <>{parts}</> : line;
  };

  const renderItalic = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const italicRegex = /\*([^*\n]+?)\*/g;
    let match;
    let hasMatches = false;

    while ((match = italicRegex.exec(text)) !== null) {
      const beforeChar = match.index > 0 ? text[match.index - 1] : '';
      const afterChar = match.index + match[0].length < text.length 
        ? text[match.index + match[0].length] 
        : '';
      
      if (beforeChar === '*' || afterChar === '*') {
        continue;
      }

      hasMatches = true;
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push(
            <React.Fragment key={`text-${keyCounter++}`}>
              {beforeText}
            </React.Fragment>
          );
        }
      }

      parts.push(
        <em key={`italic-${keyCounter++}`} className="italic">
          {match[1]}
        </em>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <React.Fragment key={`text-${keyCounter++}`}>
          {text.substring(lastIndex)}
        </React.Fragment>
      );
    }

    return hasMatches && parts.length > 0 ? <>{parts}</> : text;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.match(/^[-*]\s+/)) {
      flushNumberedList();
      currentList.push(trimmedLine);
    } else if (trimmedLine.match(/^\d+\.\s*/)) {
      flushList();
      currentNumberedList.push(trimmedLine);
    } else {
      // Linha vazia dentro de uma lista - verificar se há mais itens depois
      if (!trimmedLine) {
        if (currentNumberedList.length > 0) {
          // Verificar se há mais itens numerados nas próximas linhas
          let hasMoreNumberedItems = false;
          for (let i = index + 1; i < lines.length; i++) {
            const nextLine = lines[i].trim();
            if (nextLine.match(/^\d+\.\s*/)) {
              hasMoreNumberedItems = true;
              break;
            } else if (nextLine && !nextLine.match(/^\d+\.\s*/)) {
              // Encontrou uma linha não vazia que não é item numerado
              break;
            }
          }
          // Se não há mais itens numerados, flushar a lista
          if (!hasMoreNumberedItems) {
            flushNumberedList();
          }
          // Ignorar a linha vazia (não adicionar <br>)
          return;
        }
        
        if (currentList.length > 0) {
          // Verificar se há mais itens de lista não numerada
          let hasMoreListItems = false;
          for (let i = index + 1; i < lines.length; i++) {
            const nextLine = lines[i].trim();
            if (nextLine.match(/^[-*]\s+/)) {
              hasMoreListItems = true;
              break;
            } else if (nextLine && !nextLine.match(/^[-*]\s+/)) {
              break;
            }
          }
          if (!hasMoreListItems) {
            flushList();
          }
          return;
        }
      }
      
      // Qualquer outra linha não vazia ou linha vazia sem lista ativa
      flushList();
      flushNumberedList();

      if (trimmedLine) {
        elements.push(
          <p key={`p-${keyCounter++}`} className="mb-2">
            {renderFormatting(trimmedLine)}
          </p>
        );
      } else if (index < lines.length - 1) {
        elements.push(<br key={`br-${keyCounter++}`} />);
      }
    }
  });

  flushList();
  flushNumberedList();

  return <>{elements}</>;
}

