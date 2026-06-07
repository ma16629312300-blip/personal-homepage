import { useEffect, useMemo, useState } from 'react';
import BgmControl from './components/BgmControl.jsx';
import CharacterStage from './components/CharacterStage.jsx';
import DateDisplay from './components/DateDisplay.jsx';
import StageContent from './components/StageContent.jsx';
import StageMenu from './components/StageMenu.jsx';
import StageShell from './components/StageShell.jsx';
import TransitionWipe from './components/TransitionWipe.jsx';
import { allSections, sections } from './data/sections.js';

const getSectionFromHash = () => {
  const hashId = window.location.hash.replace('#', '');
  return allSections.some((s) => s.id === hashId) ? hashId : 'intro';
};

export default function App() {
  const [activeId, setActiveId] = useState(getSectionFromHash);
  const [wipeActive, setWipeActive] = useState(false);

  const activeSection = useMemo(
    () => allSections.find((s) => s.id === activeId) ?? sections[0],
    [activeId],
  );
  const menuActiveId = activeSection.parentId ?? activeSection.id;

  const handleSelect = (sectionId) => {
    if (sectionId === activeId) return;
    setWipeActive(true);
    setActiveId(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
  };

  useEffect(() => {
    const handleHashChange = () => setActiveId(getSectionFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!wipeActive) return undefined;
    const timeout = window.setTimeout(() => setWipeActive(false), 640);
    return () => window.clearTimeout(timeout);
  }, [wipeActive, activeId]);

  return (
    <StageShell section={activeSection} wipeActive={wipeActive}>
      {/* Left: Navigation menu */}
      <StageMenu
        sections={sections}
        activeId={menuActiveId}
        onSelect={handleSelect}
      />

      {/* Center: Content */}
      <StageContent section={activeSection} />

      {/* Right: Original moon phase emblem */}
      <CharacterStage section={activeSection} />

      {/* UI widgets */}
      <DateDisplay />
      <BgmControl />

      {/* Transition overlay */}
      <TransitionWipe active={wipeActive} section={activeSection} />
    </StageShell>
  );
}
