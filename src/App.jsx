import { useEffect, useMemo, useState } from 'react';
import BgmControl from './components/BgmControl.jsx';
import CharacterStage from './components/CharacterStage.jsx';
import StageContent from './components/StageContent.jsx';
import StageMenu from './components/StageMenu.jsx';
import StageShell from './components/StageShell.jsx';
import TransitionWipe from './components/TransitionWipe.jsx';
import { allSections, sections } from './data/sections.js';

const getSectionFromHash = () => {
  const hashId = window.location.hash.replace('#', '');
  return allSections.some((section) => section.id === hashId) ? hashId : 'intro';
};

export default function App() {
  const [activeId, setActiveId] = useState(getSectionFromHash);
  const [wipeActive, setWipeActive] = useState(false);

  const activeSection = useMemo(
    () => allSections.find((section) => section.id === activeId) ?? sections[0],
    [activeId]
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
    const timeout = window.setTimeout(() => setWipeActive(false), 620);
    return () => window.clearTimeout(timeout);
  }, [wipeActive, activeId]);

  return (
    <StageShell section={activeSection} wipeActive={wipeActive}>
      <StageMenu sections={sections} activeId={menuActiveId} onSelect={handleSelect} />
      <StageContent section={activeSection} />
      <CharacterStage section={activeSection} />
      <TransitionWipe active={wipeActive} section={activeSection} />
      <BgmControl />
    </StageShell>
  );
}
