/* STAR project page: interactive galleries, accessible table tabs, and citation copy. */
(() => {
  'use strict';
  const files = Array.isArray(window.STAR_VIDEO_MANIFEST) ? window.STAR_VIDEO_MANIFEST : [];
  const names = {
    walker: 'Walker Walk', cheetah: 'Cheetah Run', finger: 'Finger Spin', cartpole: 'Cartpole SwingUp',
    door: 'Door', twoarm: 'TwoArmPegInHole', can: 'PickPlaceCan', square: 'NutAssemblySquare'
  };
  const kinds = { color: 'Color', video: 'Video', rotate: 'Rotation', shift: 'Translation', appearance: 'Appearance' };
  const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);
  const state = { benchmark: 'dmc', dmcTask: 'walker', dmcFamily: 'appearance', roboTask: 'door', dpTask: 'can' };
  const tabs = [...document.querySelectorAll('[data-gallery]')];
  const controls = document.getElementById('gallery-controls');
  const context = document.getElementById('gallery-context');
  const grid = document.getElementById('video-grid');
  const canAutoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer = null;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function selectBenchmark(which) {
    state.benchmark = which;
    tabs.forEach(tab => {
      const active = tab.dataset.gallery === which;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    renderGallery();
  }

  function addFilterRow(label, items, active, onSelect) {
    const row = el('div', 'filter-row');
    row.appendChild(el('span', 'filter-label', label));
    items.forEach(([id, text]) => {
      const button = el('button', id === active ? 'is-active' : '', text);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(id === active));
      button.addEventListener('click', () => { onSelect(id); renderGallery(); });
      row.appendChild(button);
    });
    controls.appendChild(row);
  }

  function renderControls() {
    controls.replaceChildren();
    if (state.benchmark === 'dmc') {
      addFilterRow('TASK', [
        ['walker','Walker Walk'], ['cheetah','Cheetah Run'], ['finger','Finger Spin'], ['cartpole','Cartpole SwingUp']
      ], state.dmcTask, v => { state.dmcTask = v; });
      addFilterRow('SHIFT FAMILY', [
        ['appearance','Appearance: Color / Video'], ['geometry','Geometry: Rotate / Shift']
      ], state.dmcFamily, v => { state.dmcFamily = v; });
    } else if (state.benchmark === 'robosuite') {
      addFilterRow('TASK', [['door','Door'],['twoarm','TwoArmPegInHole']], state.roboTask, v => { state.roboTask = v; });
    } else {
      addFilterRow('TASK', [['can','Can (PickPlaceCan)'],['square','Square (NutAssemblySquare)']], state.dpTask, v => { state.dpTask = v; });
    }
  }

  function selectedFiles() {
    const bench = state.benchmark;
    if (bench === 'dmc') {
      const k = state.dmcFamily === 'appearance' ? ['color','video'] : ['rotate','shift'];
      const order = Object.fromEntries(k.map((kind,index) => [kind,index]));
      return files.filter(f => f.benchmark === 'dmc' && f.task === state.dmcTask && k.includes(f.kind))
        .sort((a,b) => (order[a.kind] - order[b.kind]) || (a.level === 'easy' ? -1 : 1));
    }
    const task = bench === 'robosuite' ? state.roboTask : state.dpTask;
    const order = {easy: 0, medium: 1, hard: 2, video: 3};
    return files.filter(f => f.benchmark === bench && f.task === task)
      .sort((a,b) => order[a.displayLevel || a.level] - order[b.displayLevel || b.level]);
  }

  function renderContext(clips) {
    context.replaceChildren();
    const left = el('div');
    let title, description, badge;
    if (state.benchmark === 'dmc') {
      title = names[state.dmcTask];
      const geometric = state.dmcFamily === 'geometry';
      description = geometric
        ? 'Rotation and translation / Easy and Hard. Shift-aware Stage-2 augmentation (STAR(G)).'
        : 'Color and video background / Easy and Hard. Appearance-shift evaluation (STAR(O)).';
      badge = geometric ? 'GEOMETRIC EXTENSION' : 'APPEARANCE SHIFTS';
    } else if (state.benchmark === 'robosuite') {
      title = names[state.roboTask];
      description = 'Easy, Medium, Hard, and Video evaluation conditions. Choose a task to inspect all four visual shifts.';
      badge = 'MANIPULATION';
    } else {
      title = names[state.dpTask];
      description = 'Example PRA success rollouts at Easy, Medium, and Hard. These are not baseline-vs-PRA matched video comparisons.';
      badge = 'DP + PRA';
    }
    left.appendChild(el('h3', '', title));
    left.appendChild(el('p', '', description));
    context.appendChild(left);
    context.appendChild(el('span', 'context-badge', `${badge} · ${clips.length} ${state.benchmark === 'robosuite' ? 'CONDITIONS' : 'CLIPS'}`));
  }

  function clipLabel(clip) {
    if (clip.benchmark === 'robosuite') return capitalize(clip.displayLevel || clip.level);
    if (clip.benchmark === 'dp') return capitalize(clip.level);
    return `${kinds[clip.kind]} · ${capitalize(clip.level)}`;
  }

  function clipEnvironment(clip) {
    return clip.benchmark === 'dmc' ? 'DMC-GB' : clip.benchmark === 'robosuite' ? 'ROBOSUITE' : 'DIFFUSION POLICY';
  }

  function createVideoCard(clip) {
    const article = el('article', 'demo-tile');
    const condition = clipLabel(clip);
    const header = el('div', 'demo-tile-head');
    const titleArea = el('div', 'demo-tile-heading');
    titleArea.appendChild(el('span', 'demo-env', clipEnvironment(clip)));
    titleArea.appendChild(el('strong', 'demo-title', clip.taskLabel));
    titleArea.appendChild(el('span', 'demo-condition', condition));
    header.appendChild(titleArea);
    header.appendChild(el('span', 'demo-tag', clip.benchmark === 'dmc' && ['rotate','shift'].includes(clip.kind) ? 'STAR(G)' : clip.benchmark === 'dp' ? 'DP + PRA' : 'STAR'));
    article.appendChild(header);

    const stage = el('div', 'demo-stage');
    const placeholder = el('div', 'demo-placeholder');
    placeholder.appendChild(el('span', 'demo-placeholder-icon', '▶'));
    placeholder.appendChild(el('strong', '', 'Video will appear here when available'));
    stage.appendChild(placeholder);

    const video = el('video', 'demo-video');
    video.controls = true;
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', `${clipEnvironment(clip)}, ${clip.taskLabel}, ${condition}`);
    const source = el('source');
    source.src = clip.path;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.addEventListener('loadedmetadata', () => {
      stage.classList.add('has-video');
      if (canAutoplay && video.dataset.inView === 'true') video.play().catch(() => {});
    });
    video.addEventListener('error', () => {
      stage.classList.remove('has-video');
    });
    stage.appendChild(video);
    // Visible inside the player (not encoded into the MP4), including during playback.
    const overlay = el('div', 'demo-video-overlay');
    overlay.appendChild(el('span', 'demo-overlay-environment', clipEnvironment(clip)));
    overlay.appendChild(el('strong', 'demo-overlay-name', `${clip.taskLabel} / ${condition}`));
    stage.appendChild(overlay);
    article.appendChild(stage);

    if (observer) observer.observe(video);
    return article;
  }

  function renderGallery() {
    if (observer) { observer.disconnect(); observer = null; }
    grid.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
    renderControls();
    const clips = selectedFiles();
    renderContext(clips);
    grid.replaceChildren();
    grid.classList.toggle('three-videos', clips.length === 3);
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = entry.target;
          video.dataset.inView = String(entry.isIntersecting);
          if (entry.isIntersecting && canAutoplay && video.readyState >= 1) {
            video.play().catch(() => {});
          } else if (!entry.isIntersecting) video.pause();
        });
      }, {rootMargin: '80px', threshold: .20});
    }
    clips.forEach(clip => grid.appendChild(createVideoCard(clip)));
    if (clips.length === 0) grid.appendChild(el('p','missing-manifest','No videos are available for this selection.'));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectBenchmark(tab.dataset.gallery));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? tabs[(index + 1) % tabs.length]
        : event.key === 'ArrowLeft' ? tabs[(index - 1 + tabs.length) % tabs.length]
        : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length-1] : null;
      if (next) { event.preventDefault(); selectBenchmark(next.dataset.gallery); next.focus(); }
    });
  });
  if (grid && controls && context) selectBenchmark('dmc');

  const resultTabs = [...document.querySelectorAll('[data-result-tab]')];
  const panels = [...document.querySelectorAll('[data-result-panel]')];
  function selectResults(name) {
    resultTabs.forEach(tab => {
      const active = tab.dataset.resultTab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.classList.toggle('is-active', active);
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.resultPanel !== name; });
  }
  resultTabs.forEach((tab,index) => {
    tab.addEventListener('click', () => selectResults(tab.dataset.resultTab));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? resultTabs[(index+1)%resultTabs.length]
        : event.key === 'ArrowLeft' ? resultTabs[(index-1+resultTabs.length)%resultTabs.length]
        : event.key === 'Home' ? resultTabs[0] : event.key === 'End' ? resultTabs[resultTabs.length-1] : null;
      if (next) { event.preventDefault(); selectResults(next.dataset.resultTab); next.focus(); }
    });
  });

  const copyButton = document.getElementById('copy-citation');
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const bibtex = document.getElementById('bibtex');
      if (!bibtex) return;
      try {
        await navigator.clipboard.writeText(bibtex.textContent.trim());
        copyButton.textContent = 'Copied';
        setTimeout(() => { copyButton.textContent = 'Copy BibTeX'; }, 1700);
      } catch (_) { copyButton.textContent = 'Select and copy'; }
    });
  }
})();
