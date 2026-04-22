"use client";

import { useRef } from "react";
import { FaBold, FaItalic, FaListUl, FaListOl, FaLink } from "react-icons/fa6";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export default function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength = 500,
  className = "",
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isHandlingNumberedList = useRef(false);

  const getCurrentValue = () => textareaRef.current?.value ?? value;

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentValue = getCurrentValue();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end);
    const beforeText = currentValue.substring(0, start);
    const afterText = currentValue.substring(end);

    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      newText = beforeText + before + selectedText + after + afterText;
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      newText = beforeText + before + after + afterText;
      newCursorPos = start + before.length;
    }

    if (maxLength && newText.length > maxLength) return;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBold = () => {
    insertText("**", "**");
  };

  const insertItalic = () => {
    insertText("*", "*");
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentValue = getCurrentValue();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end);

    const hrefPlaceholder = "https://";
    const fixedTitle = "title";

    const looksLikeUrl =
      !!selectedText &&
      (selectedText.includes("//") ||
        selectedText.startsWith("www.") ||
        selectedText.startsWith("localhost") ||
        selectedText.startsWith("127.") ||
        selectedText.startsWith("http"));

    if (looksLikeUrl) {
      const linkMarkdown = `[${fixedTitle}](${selectedText.trim()})`;
      const beforeText = currentValue.substring(0, start);
      const afterText = currentValue.substring(end);
      const newText = beforeText + linkMarkdown + afterText;
      if (maxLength && newText.length > maxLength) return;

      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const pos = beforeText.length + linkMarkdown.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
      return;
    }

    // Caso contrário, insere um template e seleciona a URL para colar/editar.
    const linkMarkdown = `[${fixedTitle}](${hrefPlaceholder})`;

    const beforeText = currentValue.substring(0, start);
    const afterText = currentValue.substring(end);
    const newText = beforeText + linkMarkdown + afterText;
    if (maxLength && newText.length > maxLength) return;

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const urlStart = beforeText.length + `[${fixedTitle}](`.length;
      const urlEnd = urlStart + hrefPlaceholder.length;
      textarea.setSelectionRange(urlStart, urlEnd);
    }, 0);
  };

  const insertList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = getCurrentValue();
    const beforeText = currentValue.substring(0, start);
    const afterText = currentValue.substring(start);

    const lines = beforeText.split("\n");
    const currentLine = lines[lines.length - 1];
    const isListItem =
      currentLine.trim().startsWith("- ") ||
      currentLine.trim().startsWith("* ");

    let newText: string;
    let newCursorPos: number;

    if (isListItem) {
      newText = beforeText + "\n- " + afterText;
      newCursorPos = start + 3;
    } else {
      const needsNewline = beforeText && !beforeText.endsWith("\n");
      newText = beforeText + (needsNewline ? "\n\n" : "\n") + "- " + afterText;
      newCursorPos = start + (needsNewline ? 4 : 3);
    }

    if (maxLength && newText.length > maxLength) return;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = getCurrentValue();
    const beforeText = currentValue.substring(0, start);
    const afterText = currentValue.substring(start);

    const lines = beforeText.split("\n");
    const currentLine = lines[lines.length - 1];
    const isNumberedListItem = /^\d+\.\s/.test(currentLine.trim());

    let newText: string;
    let newCursorPos: number;

    if (isNumberedListItem) {
      let nextNumber = 1;
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        const match = line.match(/^(\d+)\.\s/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
          break;
        } else if (line && !line.match(/^\d+\.\s/)) {
          break;
        }
      }
      newText = beforeText + `\n${nextNumber}. ` + afterText;
      newCursorPos = start + `${nextNumber}. `.length + 1;
    } else {
      const needsNewline = beforeText && !beforeText.endsWith("\n");
      newText = beforeText + (needsNewline ? "\n\n" : "\n") + "1. " + afterText;
      newCursorPos = start + (needsNewline ? 4 : 3);
    }

    if (maxLength && newText.length > maxLength) return;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      insertLink();
      return;
    }

    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Usa o valor atual do textarea em vez do prop value para garantir sincronização
      const currentValue = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = currentValue.substring(0, start);
      const afterText = currentValue.substring(end);

      // Pega todas as linhas até o cursor
      const lines = beforeText.split("\n");
      const currentLine = lines[lines.length - 1];

      // Detecta linhas que começam com número seguido de ponto (com ou sem espaço)
      // Usa trim() para ignorar espaços no início da linha
      const trimmedLine = currentLine.trim();
      const numberedMatch = trimmedLine.match(/^(\d+)\./);

      if (numberedMatch) {
        // Previne o comportamento padrão ANTES de fazer qualquer coisa
        e.preventDefault();
        e.stopPropagation();
        if (e.nativeEvent) {
          e.nativeEvent.stopImmediatePropagation();
        }

        // Marca que estamos processando uma lista numerada
        isHandlingNumberedList.current = true;

        // Remove o número e espaços da linha para verificar se está vazia
        const lineWithoutNumber = trimmedLine.replace(/^\d+\.\s*/, "");
        if (!lineWithoutNumber.trim()) {
          // Se a linha está vazia (só tem o número), remove o número e não cria novo item
          const linesBefore = lines.slice(0, -1);
          const newBeforeText = linesBefore.join("\n");
          const newText =
            newBeforeText + (linesBefore.length > 0 ? "\n" : "") + afterText;
          const newPos =
            newBeforeText.length + (linesBefore.length > 0 ? 1 : 0);

          onChange(newText);

          // Usa setTimeout para garantir que o onChange foi processado
          setTimeout(() => {
            isHandlingNumberedList.current = false;
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(newPos, newPos);
            }
          }, 0);
          return;
        }

        // Pega o número atual da linha
        const currentNumber = parseInt(numberedMatch[1]);
        const nextNumber = currentNumber + 1;

        // Insere a nova linha com o próximo número
        const newText = beforeText + `\n${nextNumber}. ` + afterText;
        const newCursorPos = start + `\n${nextNumber}. `.length;

        // Chama onChange para atualizar o estado do componente pai
        onChange(newText);

        // Usa setTimeout para garantir que o onChange foi processado
        setTimeout(() => {
          isHandlingNumberedList.current = false;
          const textarea = textareaRef.current;
          if (textarea) {
            textarea.focus();
            // Calcula a posição exata baseada no texto inserido
            const insertedText = `\n${nextNumber}. `;
            const calculatedPos = start + insertedText.length;
            textarea.setSelectionRange(calculatedPos, calculatedPos);
          }
        }, 0);
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/20">
        <button
          type="button"
          onClick={insertBold}
          className="p-2 rounded hover:bg-white/10 transition-colors text-white cursor-pointer"
          title="Negrito (Ctrl+B)"
          aria-label="Negrito"
        >
          <FaBold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertItalic}
          className="p-2 rounded hover:bg-white/10 transition-colors text-white cursor-pointer"
          title="Itálico (Ctrl+I)"
          aria-label="Itálico"
        >
          <FaItalic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded hover:bg-white/10 transition-colors text-white cursor-pointer"
          title="Link (Ctrl+K)"
          aria-label="Link"
        >
          <FaLink className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertList}
          className="p-2 rounded hover:bg-white/10 transition-colors text-white cursor-pointer"
          title="Lista"
          aria-label="Lista"
        >
          <FaListUl className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertNumberedList}
          className="p-2 rounded hover:bg-white/10 transition-colors text-white cursor-pointer"
          title="Lista Numerada"
          aria-label="Lista Numerada"
        >
          <FaListOl className="w-4 h-4" />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (!maxLength || e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        className={`w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-2xl border border-white/50 outline-none resize-none ${className}`}
      />

      {/* Character count */}
      {maxLength && (
        <div className="text-right text-gray-400 text-sm">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
