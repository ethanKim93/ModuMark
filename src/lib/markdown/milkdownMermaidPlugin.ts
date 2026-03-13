/**
 * 커스텀 Milkdown Mermaid 플러그인
 * - @milkdown/plugin-diagram(v7.7.0)은 deprecated → 직접 구현
 * - 모든 code_block에 언어 선택 드롭다운 추가 (검색 가능 커스텀 드롭다운)
 * - language='mermaid'인 경우 SVG로 렌더링
 * - ProseMirror NodeView 기반, contentDOM 유지로 편집 상태 보존
 * - 코드 내용 기반 언어 자동 감지 (300ms 디바운스)
 */

import { $view } from '@milkdown/kit/utils';
import { codeBlockSchema } from '@milkdown/kit/preset/commonmark';
import type { Node } from '@milkdown/kit/prose/model';
import type { EditorView } from '@milkdown/kit/prose/view';
import { renderMermaid, setMermaidRendererTheme, type MermaidTheme } from './mermaidRenderer';
import { detectLanguage } from './languageDetector';

/** 전역 테마 상태 — MilkdownEditor에서 갱신 */
let currentTheme: MermaidTheme = 'dark';

export function setMermaidTheme(theme: MermaidTheme) {
  currentTheme = theme;
  setMermaidRendererTheme(theme);
}

/** 지원 언어 목록 */
const SUPPORTED_LANGUAGES = [
  'plain',
  'javascript',
  'typescript',
  'python',
  'json',
  'html',
  'css',
  'bash',
  'sql',
  'mermaid',
  'yaml',
  'markdown',
  'go',
  'rust',
  'java',
  'c',
  'cpp',
] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * 커스텀 검색 가능 드롭다운 생성
 * - vanilla JS (ProseMirror NodeView 내부이므로 React 사용 불가)
 */
function createLanguageDropdown(
  currentLang: string,
  onChange: (lang: string) => void,
): {
  dropdown: HTMLDivElement;
  updateSelected: (lang: string, isAuto?: boolean) => void;
} {
  const normalizedLang = currentLang || 'plain';

  /* 커스텀 언어 (목록에 없는 경우) 지원 */
  const extraLangs: string[] = [];
  const isCustom =
    currentLang && !(SUPPORTED_LANGUAGES as readonly string[]).includes(currentLang);
  if (isCustom) extraLangs.push(currentLang);

  const allLanguages = [...extraLangs, ...SUPPORTED_LANGUAGES] as string[];

  /* ── DOM 구성 ── */
  const dropdown = document.createElement('div');
  dropdown.className = 'code-lang-dropdown';

  const trigger = document.createElement('button');
  trigger.className = 'code-lang-trigger';
  trigger.type = 'button';
  trigger.textContent = normalizedLang;

  const popover = document.createElement('div');
  popover.className = 'code-lang-popover';

  const searchInput = document.createElement('input');
  searchInput.className = 'code-lang-search';
  searchInput.type = 'text';
  searchInput.placeholder = '검색...';
  searchInput.autocomplete = 'off';

  const list = document.createElement('ul');
  list.className = 'code-lang-list';

  popover.appendChild(searchInput);
  popover.appendChild(list);
  dropdown.appendChild(trigger);
  dropdown.appendChild(popover);

  /* ── 목록 렌더링 ── */
  let focusedIndex = -1;

  function renderList(filter: string) {
    list.innerHTML = '';
    focusedIndex = -1;
    const lowerFilter = filter.toLowerCase();
    const filtered = allLanguages.filter((l) => l.toLowerCase().includes(lowerFilter));

    filtered.forEach((lang, idx) => {
      const li = document.createElement('li');
      li.className = 'code-lang-item';
      li.textContent = lang;
      if (lang === (trigger.dataset.currentLang ?? normalizedLang)) {
        li.classList.add('selected');
      }
      li.addEventListener('mousedown', (e) => {
        /* mousedown에서 처리해야 input blur보다 먼저 실행됨 */
        e.preventDefault();
        selectLanguage(lang);
      });
      list.appendChild(li);
      void idx; // suppress unused warning
    });

    return filtered;
  }

  function selectLanguage(lang: string) {
    const actualLang = lang === 'plain' ? '' : lang;
    trigger.textContent = lang;
    trigger.dataset.currentLang = lang;
    closePopover();
    onChange(actualLang);
  }

  function openPopover() {
    popover.classList.add('open');
    searchInput.value = '';
    renderList('');
    searchInput.focus();
  }

  function closePopover() {
    popover.classList.remove('open');
    focusedIndex = -1;
  }

  /* ── 키보드 내비게이션 ── */
  function moveFocus(delta: number) {
    const items = list.querySelectorAll<HTMLLIElement>('.code-lang-item');
    if (items.length === 0) return;
    items[focusedIndex]?.classList.remove('active');
    focusedIndex = Math.max(0, Math.min(focusedIndex + delta, items.length - 1));
    items[focusedIndex].classList.add('active');
    items[focusedIndex].scrollIntoView({ block: 'nearest' });
  }

  searchInput.addEventListener('input', () => renderList(searchInput.value));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const items = list.querySelectorAll<HTMLLIElement>('.code-lang-item');
      if (focusedIndex >= 0 && items[focusedIndex]) {
        selectLanguage(items[focusedIndex].textContent ?? 'plain');
      }
    } else if (e.key === 'Escape') {
      closePopover();
    }
  });

  trigger.addEventListener('click', () => {
    if (popover.classList.contains('open')) {
      closePopover();
    } else {
      openPopover();
    }
  });

  /* 외부 클릭 시 닫기 */
  document.addEventListener('mousedown', (e) => {
    if (!dropdown.contains(e.target as globalThis.Node)) {
      closePopover();
    }
  });

  /* 초기 currentLang 저장 */
  trigger.dataset.currentLang = normalizedLang;

  /* 외부에서 선택 언어 업데이트 (update() 콜백용) */
  function updateSelected(lang: string, isAuto = false) {
    const display = lang || 'plain';
    trigger.textContent = isAuto ? `${display} (auto)` : display;
    trigger.dataset.currentLang = display;
  }

  return { dropdown, updateSelected };
}

/** code-block-header + 커스텀 드롭다운 빌드 */
function createHeader(
  currentLang: string,
  onChange: (lang: string) => void,
): {
  header: HTMLDivElement;
  updateSelected: (lang: string, isAuto?: boolean) => void;
} {
  const header = document.createElement('div');
  header.className = 'code-block-header';

  const { dropdown, updateSelected } = createLanguageDropdown(currentLang, onChange);
  header.appendChild(dropdown);

  return { header, updateSelected };
}

export const milkdownMermaidPlugin = $view(codeBlockSchema.node, () => {
  return (node: Node, view: EditorView, getPos: () => number | undefined) => {
    let currentNode = node;
    const initialAttrs = node.attrs as { language: string };
    const language = initialAttrs.language ?? '';

    /** language attr 변경 트랜잭션 발행 */
    const dispatchLanguageChange = (newLang: string) => {
      const pos = getPos();
      if (pos === undefined) return;
      view.dispatch(
        view.state.tr.setNodeMarkup(pos, undefined, {
          ...currentNode.attrs,
          language: newLang,
        }),
      );
    };

    /* ── 일반 코드 블록 ────────────────────────────────────── */
    if (language !== 'mermaid') {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const { header, updateSelected } = createHeader(language, dispatchLanguageChange);
      wrapper.appendChild(header);

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      if (language) code.className = `language-${language}`;
      pre.appendChild(code);
      wrapper.appendChild(pre);

      /** 자동 감지 디바운스 타이머 */
      let autoDetectTimer: ReturnType<typeof setTimeout> | null = null;

      return {
        dom: wrapper,
        contentDOM: code,
        update(newNode: Node) {
          if (newNode.type !== node.type) return false;
          currentNode = newNode;
          const newAttrs = newNode.attrs as { language: string };

          /* mermaid로 언어 변경 시 뷰를 재생성 */
          if (newAttrs.language === 'mermaid') return false;

          const newLang = newAttrs.language ?? '';

          /* 드롭다운 표시 동기화 */
          updateSelected(newLang);
          code.className = newLang ? `language-${newLang}` : '';

          /* 언어가 비어 있을 때만 자동 감지 */
          if (!newLang) {
            if (autoDetectTimer) clearTimeout(autoDetectTimer);
            autoDetectTimer = setTimeout(() => {
              const content = newNode.textContent;
              const detected = detectLanguage(content);
              if (detected) {
                updateSelected(detected, true);
                /* 자동 감지 결과를 실제 attr에 반영 */
                dispatchLanguageChange(detected === 'plain' ? '' : detected);
              }
            }, 300);
          }

          return true;
        },
        destroy() {
          if (autoDetectTimer) clearTimeout(autoDetectTimer);
        },
      };
    }

    /* ── Mermaid 코드 블록 ─────────────────────────────────── */
    const container = document.createElement('div');
    container.className = 'mermaid-container';
    container.setAttribute('data-mermaid', 'true');

    const { header, updateSelected } = createHeader('mermaid', dispatchLanguageChange);
    container.appendChild(header);

    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'mermaid-svg-wrapper';

    /* ProseMirror 내용 관리를 위한 숨겨진 contentDOM */
    const hiddenContent = document.createElement('code');
    hiddenContent.setAttribute('aria-hidden', 'true');
    hiddenContent.style.cssText =
      'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';

    container.appendChild(svgWrapper);
    container.appendChild(hiddenContent);

    const renderSvg = async (code: string) => {
      if (!code.trim()) {
        svgWrapper.innerHTML =
          '<div class="mermaid-loading">Mermaid 코드를 입력하세요...</div>';
        return;
      }
      svgWrapper.innerHTML =
        '<div class="mermaid-loading">다이어그램 렌더링 중...</div>';
      try {
        const svg = await renderMermaid(code, currentTheme);
        svgWrapper.innerHTML = svg;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        svgWrapper.innerHTML = `<div class="mermaid-error">${msg}</div>`;
      }
    };

    renderSvg(node.textContent);

    return {
      dom: container,
      contentDOM: hiddenContent,
      update(newNode: Node) {
        if (newNode.type !== node.type) return false;
        currentNode = newNode;
        const newAttrs = newNode.attrs as { language: string };

        /* mermaid가 아닌 언어로 변경 시 뷰 재생성 */
        if (newAttrs.language !== 'mermaid') return false;

        updateSelected('mermaid');
        renderSvg(newNode.textContent);
        return true;
      },
    };
  };
});
