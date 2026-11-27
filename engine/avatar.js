// beatreel avatar: "Kai", an original presenter drawn in code and animated on the reel timeline.
// Flat fills, no outlines on the figure (form comes from one darker shade per shape), thin lines only on the
// hands, a soft drop shadow, big head on sloped shoulders, two-bone arms with a cuff, hands with real fingers.
// Curly dark hair with a fade, no glasses, no beard, open zip hoodie over a white tee. Recolour him with
// "avatar_colors" in the script.
// All motion is state on plain objects tweened by the timeline + one redraw in the timeline's onUpdate,
// so any frame can be rendered in any order.
(function () {
  const R = window.REEL, A = R.avatar; if (!A) return;
  const tl = window.__timelines.reel, NS = 'http://www.w3.org/2000/svg';
  const BALBALA = A.name === 'balbala';
  const MAYA = A.look === 'female' && !BALBALA;
  const FEM = MAYA || BALBALA;   // female base rig (lashes, lips, female palette base) for Maya and Sara
  const MASK = BALBALA || !!A.mask;      // "mask": true in the script covers the nose and mouth
  const SUIT = A.outfit === 'suit';
  const MIC = A.prop === 'mic';
  const C = Object.assign({ skin: '#cf9a74', skinSh: '#b57f5b', skinLo: '#a8724f', ear: '#c48d68', line: '#7a4a31',
    hair: '#1f1714', hairHi: '#3b2c25', fade: '#5a4135', brow: '#241a16',
    shirt: '#4d6b5d', shirtSh: '#3c5549', shirtHi: '#5c7c6d', cuff: '#6f8f80', tee: '#f7f4ee', teeSh: '#e2ddd3', cord: '#efe9dc',
    eye: '#ffffff', iris: '#2a1a12', mouth: '#5a1f1c', tongue: '#e2685f', lip: '#9c5a44', shadow: '#1e1b4b', mark: '#4f46e5' },
    MAYA ? { skin: '#e3ad86', skinSh: '#c99069', skinLo: '#bb805b', ear: '#daa27c', line: '#8a5638', hair: '#2b1a14', hairHi: '#4a3024', brow: '#2b1a14',
      shirt: '#b8573f', shirtSh: '#964431', shirtHi: '#c96c55', cuff: '#d4826c', mouth: '#7a2633', lip: '#c4566a', iris: '#3a2416', earring: '#e8b54a' } :
    BALBALA ? { skin: '#f6d2bc', skinSh: '#d9a98c', skinLo: '#c99478', ear: '#e8c0a4', line: '#8a5a3a', hair: '#3a2418', hairHi: '#6b4530', brow: '#3a2418',
      shirt: '#0f6b52', shirtSh: '#0a4b3a', shirtHi: '#1a8a6a', cuff: '#3fa88a', mouth: '#8e1e2a', lip: '#d13a45', iris: '#8a6a3f',
      earring: '#e6b94f', dupatta: '#7a1f35', zari: '#e6b94f', zariHi: '#fff0c2' } : {},
    A.colors || {});
  const W = 1080, H = 900;
  const pres = document.getElementById('pres'), pin = document.getElementById('presin');
  const SC = A.scale ?? 1;
  pres.style.cssText = `left:${(A.cx ?? 540) - W * SC / 2}px;top:${A.top ?? 1060}px;width:${W * SC}px;height:${H * SC}px`;
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W * SC); svg.setAttribute('height', H * SC);
  svg.style.overflow = 'visible'; pin.appendChild(svg);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
  const g = (parent, attrs) => el('g', attrs || {}, parent);
  const set = (e, a) => { for (const k in a) e.setAttribute(k, a[k]); };

  const HEAD = 'M432 300 C432 214 472 186 540 186 C608 186 648 214 648 300 L648 372 C648 440 600 478 540 478 C480 478 432 440 432 372 Z';
  const BALBALA_HEAD = 'M440 300 C440 218 478 188 540 188 C602 188 640 218 640 300 C640 342 632 382 614 416 C598 446 572 462 540 462 C508 462 482 446 466 416 C448 382 440 342 440 300 Z';
  const BODY = 'M296 900 C296 770 314 650 350 590 C378 554 440 534 492 522 L588 522 C640 534 702 554 730 590 C766 650 784 770 784 900 Z';
  const HAIR = 'M430 312 C418 250 424 190 462 160 C466 128 504 108 536 122 C560 98 606 104 622 134 C660 144 676 196 660 250 C656 276 652 296 650 312 L640 268 C634 240 618 226 598 232 C578 240 560 222 540 226 C518 232 500 222 480 232 C458 240 446 252 442 272 Z';

  const defs = el('defs', {});
  defs.innerHTML = `
   <pattern id="avdots" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${C.shadow}"/></pattern>
   <filter id="avsoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>
   <clipPath id="avheadclip"><path d="${HEAD}"/></clipPath><clipPath id="avbodyclip"><path d="${BODY}"/></clipPath>
   <clipPath id="avhairclip"><path d="${HAIR}"/></clipPath>
   <clipPath id="aveye0"><ellipse id="aveyec0"/></clipPath><clipPath id="aveye1"><ellipse id="aveyec1"/></clipPath>
   <clipPath id="avmouthclip"><path id="avmclip" d=""/></clipPath>`;

  // ---------- everything sits in one group so the whole figure can lean
  const fig = g(svg, {});
  // soft shadow: a blurred copy of the silhouette, just below
  const sh = g(fig, { transform: 'translate(0 22)', filter: 'url(#avsoft)', opacity: R.theme === 'night' ? .5 : .16 });
  el('path', { d: BODY, fill: 'url(#avdots)' }, sh);
  const shHead = g(sh, {}); el('path', { d: BALBALA ? BALBALA_HEAD : HEAD, fill: 'url(#avdots)' }, shHead); if (!BALBALA) el('path', { d: HAIR, fill: 'url(#avdots)' }, shHead);
  const shArm = [0, 1].map(() => el('path', { d: '', fill: 'none', stroke: 'url(#avdots)', 'stroke-width': 78, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sh));
  const shHand = [0, 1].map(() => el('circle', { r: 48, fill: 'url(#avdots)' }, sh));

  // ---------- Maya's long hair, behind the head and shoulders
  const backHair = g(fig, {});
  if (FEM) el('path', { d: 'M418 300 C404 196 464 132 540 132 C616 132 676 196 662 300 C672 420 700 560 716 660 C660 690 600 676 584 610 L496 610 C480 676 420 690 364 660 C380 560 408 420 418 300 Z', fill: C.hair }, backHair);
  // ---------- body: red Pashtun-style dress for Sara, open zip hoodie over a white tee otherwise
  const body = g(fig, {});
  if (!BALBALA) el('path', { d: 'M446 560 C428 486 462 450 502 446 L578 446 C618 450 652 486 634 560 C600 528 480 528 446 560 Z', fill: C.shirtSh }, body);   // hood behind the neck
  el('path', { d: BODY, fill: C.shirt }, body);
  const bsh = g(body, { 'clip-path': 'url(#avbodyclip)' });
  el('path', { d: 'M700 540 C760 600 800 760 800 900 L720 900 C730 780 726 640 700 540 Z', fill: C.shirtSh }, bsh);                 // shaded side
  el('path', { d: 'M350 600 C330 680 322 780 322 900 L300 900 L300 600 Z', fill: C.shirtHi, opacity: .6 }, bsh);
  if (!BALBALA) {
    el('path', { d: 'M492 522 L588 522 C600 640 606 780 606 900 L474 900 C474 780 480 640 492 522 Z', fill: C.tee }, body);
    el('path', { d: 'M588 522 C600 640 606 780 606 900 L586 900 C586 780 582 640 572 540 Z', fill: C.teeSh }, body);
    el('path', { d: 'M492 522 C480 640 474 780 474 900', fill: 'none', stroke: C.shirtSh, 'stroke-width': 9 }, body);                 // zip edges
    el('path', { d: 'M588 522 C600 640 606 780 606 900', fill: 'none', stroke: C.shirtSh, 'stroke-width': 9 }, body);
    el('path', { d: 'M452 548 C470 530 488 524 500 528 C494 560 484 590 470 610 C456 596 450 572 452 548 Z', fill: C.shirtHi }, body);  // hood lapels
    el('path', { d: 'M628 548 C610 530 592 524 580 528 C586 560 596 590 610 610 C624 596 630 572 628 548 Z', fill: C.shirtHi }, body);
    el('path', { d: 'M478 600 C476 650 478 690 482 730 M602 600 C604 646 602 680 598 712', fill: 'none', stroke: C.cord, 'stroke-width': 7, 'stroke-linecap': 'round' }, body);  // drawstrings
    el('path', { d: 'M482 724 L483 748 M598 706 L597 730', fill: 'none', stroke: C.shirtSh, 'stroke-width': 9, 'stroke-linecap': 'round' }, body);
  }
  el('path', { d: 'M500 440 L500 520 C516 544 564 544 580 520 L580 440 Z', fill: C.skinSh }, body);                                 // neck
  el('path', { d: 'M500 470 C520 492 560 492 580 470 L580 500 C560 512 520 512 500 500 Z', fill: C.skinLo, opacity: .7 }, body);
  if (BALBALA && SUIT) {
    // black suit jacket with white shirt and lapels
    el('path', { d: 'M492 522 L588 522 C596 560 600 600 600 640 L480 640 C480 600 484 560 492 522 Z', fill: C.tee }, body);
    el('path', { d: 'M452 548 C470 530 488 524 500 528 C494 560 484 590 470 610 C456 596 450 572 452 548 Z', fill: C.shirtHi }, body);
    el('path', { d: 'M628 548 C610 530 592 524 580 528 C586 560 596 590 610 610 C624 596 630 572 628 548 Z', fill: C.shirtHi }, body);
    el('path', { d: 'M500 528 L540 640 L580 528', fill: 'none', stroke: C.shirtSh, 'stroke-width': 8, 'stroke-linejoin': 'round' }, body);
    el('path', { d: 'M540 560 L540 640', fill: 'none', stroke: C.shirtSh, 'stroke-width': 4 }, body);
  } else if (BALBALA) {   // rich emerald Pashtun kameez with gold zari embroidery
    // wide embroidered neckline with scalloped lower edge
    el('path', { d: 'M466 544 C496 596 584 596 614 544 C610 572 596 596 580 610 C560 619 520 619 500 610 C484 596 470 572 466 544 Z', fill: C.shirtSh }, body);
    el('path', { d: 'M472 548 C502 592 578 592 608 548', fill: 'none', stroke: C.zari, 'stroke-width': 7, 'stroke-linecap': 'round' }, body);
    el('path', { d: 'M482 566 C510 600 570 600 598 566', fill: 'none', stroke: C.zari, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .9 }, body);
    [[488,560],[506,576],[524,586],[540,590],[556,586],[574,576],[592,560]].forEach(([x,y]) => el('circle', { cx: x, cy: y, r: 3, fill: C.zariHi }, body));
    // central embroidered panel (Pashtun style)
    el('path', { d: 'M516 604 L516 762 L564 762 L564 604 Z', fill: C.shirtSh, opacity: .55 }, body);
    el('path', { d: 'M516 604 L516 762 M564 604 L564 762 M540 612 L540 750', fill: 'none', stroke: C.zari, 'stroke-width': 2.5, opacity: .9 }, body);
    [630,668,706,744].forEach(y => el('circle', { cx: 540, cy: y, r: 3.2, fill: C.zariHi }, body));
    // embroidered waist band
    el('path', { d: 'M402 742 C480 768 600 768 678 742', fill: 'none', stroke: C.zari, 'stroke-width': 6, opacity: .85 }, body);
    el('path', { d: 'M406 754 C482 780 598 780 674 754', fill: 'none', stroke: C.zariHi, 'stroke-width': 2, opacity: .85 }, body);
    // tiny gold sequins scattered on the kameez
    [[470,640],[610,640],[452,700],[628,700],[482,796],[598,796]].forEach(([x,y]) => el('circle', { cx: x, cy: y, r: 2.4, fill: C.zari, opacity: .8 }, body));
    // rich burgundy dupatta with gold border, draped over the shoulders
    el('path', { d: 'M388 556 C414 492 478 462 540 452 C602 462 666 492 692 556 L692 632 C650 606 600 586 540 580 C480 586 430 606 388 632 Z', fill: C.dupatta, opacity: .92 }, body);
    el('path', { d: 'M392 628 C372 706 358 786 350 866', fill: 'none', stroke: C.dupatta, 'stroke-width': 18, 'stroke-linecap': 'round', opacity: .92 }, body);
    el('path', { d: 'M392 628 C372 706 358 786 350 866', fill: 'none', stroke: C.zari, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .9, 'stroke-dasharray': '10 12' }, body);
    el('path', { d: 'M400 560 C430 506 486 480 540 470 C594 480 650 506 680 560', fill: 'none', stroke: C.zari, 'stroke-width': 5, opacity: .9 }, body);
  } else {
    el('path', { d: 'M494 522 C514 548 566 548 586 522', fill: 'none', stroke: C.teeSh, 'stroke-width': 7, 'stroke-linecap': 'round' }, body);
  }

  // side locks fall over the shoulders, in front of the hoodie, behind the face
  if (FEM) { el('path', { d: 'M436 292 C410 380 412 500 438 604 C452 650 494 652 502 616 C474 560 466 470 472 380 Z', fill: C.hair }, body);
    el('path', { d: 'M644 292 C670 380 668 500 642 604 C628 650 586 652 578 616 C606 560 614 470 608 380 Z', fill: C.hair }, body);
    el('path', { d: 'M446 360 C436 440 440 520 456 590 M634 360 C644 440 640 520 624 590', fill: 'none', stroke: C.hairHi, 'stroke-width': 7, 'stroke-linecap': 'round' }, body); }
  // ---------- head
  const head = g(fig, {});
  const earL = el('ellipse', { cx: BALBALA ? 434 : 430, cy: 338, rx: 17, ry: 27, fill: C.ear }, head), earR = el('ellipse', { cx: BALBALA ? 646 : 650, cy: 338, rx: 17, ry: 27, fill: C.ear }, head);
  el('path', { d: BALBALA ? BALBALA_HEAD : HEAD, fill: C.skin }, head);
  const hsh = g(head, { 'clip-path': 'url(#avheadclip)' });
  el('path', { d: BALBALA ? 'M640 188 L640 462 L545 462 C600 420 618 360 618 300 C618 255 610 215 582 188 Z' : 'M660 180 L660 490 L560 490 C624 452 634 400 630 330 C628 270 624 220 600 180 Z', fill: C.skinSh, opacity: .55 }, hsh);   // shaded side of the face
  if (!FEM) { el('rect', { x: 428, y: 250, width: 20, height: 76, fill: C.fade, opacity: .75 }, hsh); el('rect', { x: 632, y: 250, width: 20, height: 76, fill: C.fade, opacity: .85 }, hsh); }  // fade at the temples
  const feat = g(head, {});
  el('ellipse', { cx: BALBALA ? 480 : 470, cy: 388, rx: BALBALA ? 22 : 20, ry: BALBALA ? 13 : 11, fill: BALBALA ? 'rgba(235,120,110,.24)' : 'rgba(230,110,90,.20)' }, feat); el('ellipse', { cx: BALBALA ? 600 : 606, cy: 388, rx: BALBALA ? 22 : 20, ry: BALBALA ? 13 : 11, fill: BALBALA ? 'rgba(235,120,110,.24)' : 'rgba(230,110,90,.20)' }, feat);
  if (BALBALA) el('ellipse', { cx: 540, cy: 434, rx: 5, ry: 2, fill: '#fff', opacity: .35 }, feat);   // lip shine
  el('path', { d: 'M544 340 C544 362 554 376 556 384 C552 394 534 394 526 388 C536 388 544 384 544 378 Z', fill: C.skinSh }, feat);   // nose
  const eyes = [[494, 330], [586, 330]].map(([x, y], k) => { const e = g(feat, {});
    if (BALBALA) {
      el('ellipse', { cx: x, cy: y - 12, rx: 29, ry: 15, fill: '#b56a5a', opacity: .18 }, e);
      el('path', { d: `M${x - 17} ${y - 19} Q${x} ${y - 26} ${x + 17} ${y - 19}`, fill: 'none', stroke: '#a06a5a', 'stroke-width': 2, opacity: .45 }, e);
      el('ellipse', { cx: x, cy: y + 16, rx: 16, ry: 4, fill: '#fff', opacity: .12 }, e);   // under-eye highlight
    }
    const white = el('ellipse', { cx: x, cy: y, fill: C.eye }, e), inner = g(e, { 'clip-path': `url(#aveye${k})` });
    const pupil = el('circle', { r: 10.5, fill: C.iris }, inner), glint = el('circle', { r: 3.2, fill: '#fff' }, inner);
    const irisRing = BALBALA ? el('circle', { r: 12.5, fill: 'none', stroke: '#5a4228', 'stroke-width': 2.5 }, inner) : null;
    const irisInner = BALBALA ? el('circle', { r: 8.4, fill: '#a8894f', opacity: .85 }, inner) : null;
    const pupilDark = BALBALA ? el('circle', { r: 5.2, fill: '#241a12' }, inner) : null;
    const glint2 = BALBALA ? el('circle', { r: 1.6, fill: '#fff', opacity: .85 }, inner) : null;
    const glint3 = BALBALA ? el('circle', { r: 1.0, fill: '#fff', opacity: .7 }, inner) : null;
    const lid = el('rect', { fill: C.skinSh }, inner);
    const line = el('path', { d: '', fill: 'none', stroke: C.brow, 'stroke-width': BALBALA ? 7 : 5.5, 'stroke-linecap': 'round' }, e);
    return { x, y, e, white, pupil, pupilDark, irisRing, irisInner, glint2, glint3, glint, lid, line, clip: document.getElementById('aveyec' + k) }; });
  const brows = [0, 1].map(() => el('path', { d: '', fill: 'none', stroke: C.brow, 'stroke-width': BALBALA ? 11 : FEM ? 9 : 13, 'stroke-linecap': 'round' }, feat));
  const mouth = g(feat, {});
  const mOpen = el('path', { d: '', fill: C.mouth }, mouth);
  const mIn = g(mouth, { 'clip-path': 'url(#avmouthclip)' });
  const teeth = el('rect', { fill: '#fff', rx: 3 }, mIn), tongue = el('ellipse', { ry: 13, fill: C.tongue }, mIn);
  const mLine = el('path', { d: '', fill: 'none', stroke: C.mouth, 'stroke-width': 6.5, 'stroke-linecap': 'round' }, mouth);
  const mLip = el('path', { d: '', fill: 'none', stroke: FEM ? C.lip : C.skinSh, 'stroke-width': FEM ? 7 : 5, 'stroke-linecap': 'round' }, mouth);
  // hair: curly top, drawn over the forehead
  if (FEM) {   // side-swept fringe, lashes, earrings
    el('path', { d: BALBALA ? 'M434 322 C426 246 466 176 540 172 C614 176 654 246 646 322 C630 286 610 268 585 260 C568 254 552 262 540 276 C528 262 512 254 495 260 C470 268 450 286 434 322 Z' : 'M424 330 C410 240 442 170 506 152 C572 134 640 160 656 236 C662 270 658 304 652 334 C644 290 630 262 610 246 C574 262 520 262 470 236 C452 262 438 294 434 334 Z', fill: C.hair }, head);
    if (BALBALA) {   // centre part and a little wave in the fringe
      el('path', { d: 'M540 174 L540 268', fill: 'none', stroke: C.hairHi, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .7 }, head);
      el('path', { d: 'M470 200 C458 240 456 280 462 312 M610 200 C622 240 624 280 618 312', fill: 'none', stroke: C.hairHi, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .6 }, head);
      // small gold bow hair accessory
      el('path', { d: 'M592 186 L584 180 L584 192 Z M592 186 L600 180 L600 192 Z', fill: C.lip, opacity: .9 }, head);
      el('circle', { cx: 592, cy: 186, r: 2.5, fill: C.earring }, head);
    }
    el('path', { d: 'M470 236 C520 262 574 262 610 246 C590 214 548 196 506 198 C488 206 476 220 470 236 Z', fill: C.hair }, head);
    el('path', { d: 'M486 186 C530 166 590 172 626 206 M456 230 C470 200 494 182 524 176', fill: 'none', stroke: C.hairHi, 'stroke-width': 8, 'stroke-linecap': 'round' }, head);
    [[0, 1], [1, -1]].forEach(([k, s_]) => { const x0 = k ? 606 : 474;
      if (BALBALA) {
        // very small, subtle lashes
        [[x0 - 4*s_, 328], [x0 + 2*s_, 326], [x0 + 8*s_, 324]].forEach(([bx, by]) =>
          el('path', { d: `M${bx} ${by} L${bx - 6*s_} ${by - 7}`, fill: 'none', stroke: C.brow, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .85 }, eyes[k].e));
      } else {
        el('path', { d: `M${x0} 322 L${x0 - 12 * s_} 312 M${x0 + 2 * s_} 316 L${x0 - 6 * s_} 304`, fill: 'none', stroke: C.brow, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, eyes[k].e);
      }
    });
    if (MAYA) { el('circle', { cx: 428, cy: 372, r: 9, fill: C.earring }, head); el('circle', { cx: 652, cy: 372, r: 9, fill: C.earring }, head); }
    if (BALBALA) { el('circle', { cx: 434, cy: 370, r: 12, fill: 'none', stroke: C.earring, 'stroke-width': 3.5 }, head); el('circle', { cx: 646, cy: 370, r: 12, fill: 'none', stroke: C.earring, 'stroke-width': 3.5 }, head); }
  }
  if (BALBALA) {   // freckles across the nose/cheeks
    [[492,326],[508,340],[524,322],[540,336],[556,320],[572,338],[588,324],[498,352],[514,360],[530,348],[546,362],[562,350],[578,360],[486,332],[502,346],[518,328],[534,352],[550,326],[566,344],[582,330],[598,348]].forEach(([x,y]) => {
      el('circle', { cx: x, cy: y, r: 1.8, fill: C.line, opacity: .4 }, head);
    });
  }
  if (!FEM) el('path', { d: HAIR, fill: C.hair }, head);
  const hh = g(head, { 'clip-path': 'url(#avhairclip)' });
  if (!FEM) el('path', { d: 'M470 176 C482 150 512 140 532 150 M548 140 C572 124 604 134 612 156 M630 170 C648 190 652 220 646 246 M452 214 C462 196 482 190 498 196 M520 190 C540 178 566 180 580 194 M600 200 C614 198 626 208 630 222',
    fill: 'none', stroke: C.hairHi, 'stroke-width': 9, 'stroke-linecap': 'round' }, hh);
  if (BALBALA) {   // gold necklace with a small pendant
    el('path', { d: 'M492 522 C512 540 568 540 588 522', fill: 'none', stroke: C.earring, 'stroke-width': 4, 'stroke-linecap': 'round' }, body);
    el('circle', { cx: 540, cy: 548, r: 8, fill: C.earring }, body);
    el('circle', { cx: 540, cy: 548, r: 4, fill: C.shirtHi, opacity: .6 }, body);
  }
  if (MASK) {   // black mask with a silver border, over the nose, mouth and chin
    el('path', { d: 'M466 360 C466 352 478 348 492 350 L588 350 C602 348 614 352 614 360 L614 402 C614 442 590 470 540 470 C490 470 466 442 466 402 Z', fill: '#17171c', stroke: '#c7ccd4', 'stroke-width': 2.5 }, head);
    el('path', { d: 'M472 386 Q540 396 608 386 M472 408 Q540 418 608 408 M474 430 Q540 440 606 430', fill: 'none', stroke: '#9aa0aa', 'stroke-width': 2, opacity: .9 }, head);
    el('path', { d: 'M478 356 Q540 348 602 356', fill: 'none', stroke: '#d6dae1', 'stroke-width': 3, 'stroke-linecap': 'round' }, head);
    el('path', { d: 'M466 368 C452 360 442 352 434 344 M614 368 C628 360 638 352 646 344', fill: 'none', stroke: '#c7ccd4', 'stroke-width': 3, 'stroke-linecap': 'round' }, head);
    el('path', { d: 'M480 378 Q540 388 600 378', fill: 'none', stroke: '#2a2a32', 'stroke-width': 6, opacity: .55 }, head);
  }
  // sweat drops + thought bubble
  const drop = 'M0 -16 C-9 0 -11 10 -4 16 C4 22 14 14 10 2 C8 -4 4 -10 0 -16 Z';
  const sweat = [el('path', { d: drop, fill: '#dff0ff', stroke: '#7fa9cf', 'stroke-width': 2.5, transform: 'translate(424 262)', opacity: 0 }, head),
    el('path', { d: drop, fill: '#dff0ff', stroke: '#7fa9cf', 'stroke-width': 2.5, transform: 'translate(664 300) scale(.8)', opacity: 0 }, head)];
  const qb = g(head, { opacity: 0 });
  el('circle', { cx: 668, cy: 176, r: 9, fill: '#fff' }, qb); el('circle', { cx: 690, cy: 146, r: 14, fill: '#fff' }, qb); el('circle', { cx: 734, cy: 96, r: 44, fill: '#fff' }, qb);
  const qt = el('text', { x: 734, y: 118, 'text-anchor': 'middle', 'font-size': 62, 'font-weight': 800, 'font-family': 'Space Grotesk, sans-serif', fill: C.mark }, qb); qt.textContent = '?';

  // ---------- arms: shoulder → elbow → wrist, cuff, hand
  const arms = g(fig, {});
  if (MIC) { // stand mic in front of presenter
    const mic = g(fig, {});
    el('rect', { x: 536, y: 500, width: 8, height: 420, rx: 4, fill: '#222' }, mic);
    el('rect', { x: 520, y: 900, width: 40, height: 10, rx: 5, fill: '#222' }, mic);
    el('path', { d: 'M540 500 C540 470 560 460 575 470', fill: 'none', stroke: '#222', 'stroke-width': 7, 'stroke-linecap': 'round' }, mic);
    el('rect', { x: 568, y: 452, width: 22, height: 36, rx: 11, fill: '#1a1a1a', stroke: '#444', 'stroke-width': 3 }, mic);
    el('rect', { x: 572, y: 458, width: 14, height: 24, rx: 7, fill: '#333' }, mic);
  }
  const SW = 76, HS = 1.25;
  const mkArm = () => { const a = g(arms, {});
    const lo = el('path', { d: '', fill: 'none', stroke: C.shirtSh, 'stroke-width': SW, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, a);
    const hi = el('path', { d: '', fill: 'none', stroke: C.shirt, 'stroke-width': SW - 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, a);
    const hand = g(a, {});
    const fingers = [0, 1, 2, 3].map(() => el('rect', { fill: C.skin, stroke: C.line, 'stroke-width': 2.6 }, hand));
    const thumb = el('rect', { fill: C.skin, stroke: C.line, 'stroke-width': 2.6 }, hand);
    el('rect', { x: -33, y: -30, width: 66, height: 74, rx: 26, fill: C.skin, stroke: C.line, 'stroke-width': 2.6 }, hand);
    el('rect', { x: -28.5, y: -34, width: 57, height: 26, rx: 6, fill: C.skin }, hand);            // fingers run into the palm
    const thumbFill = el('rect', { fill: C.skin }, hand);
    el('path', { d: 'M-14 6 C-6 14 8 14 16 4', fill: 'none', stroke: C.line, 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: .55 }, hand);
    const cuff = el('path', { d: '', fill: 'none', stroke: C.cuff, 'stroke-width': SW - 2, 'stroke-linecap': 'butt' }, a);
    const cuffL = el('path', { d: '', fill: 'none', stroke: C.shirtSh, 'stroke-width': 3, opacity: .7 }, a);
    return { lo, hi, cuff, cuffL, hand, fingers, thumb, thumbFill }; };
  const ARM = [mkArm(), mkArm()];   // 0 = screen left, 1 = screen right
  const SHO = [[364, 598], [716, 598]], L1 = 165, L2 = 155;

  // ---------- pose library. Per arm: palm centre x/y, r (0 = fingers up), f = [thumb, index, middle, ring, pinky]
  // extension, sp = finger spread, ta = thumb angle, flip, el: -1 = elbow the other way.
  const OPEN = [1, 1, 1, 1, 1], CUP = [.75, .8, .78, .72, .62], POINT = [.3, 1, 0, 0, 0], FIST = [.35, 0, 0, 0, 0], FLAT = [.5, 1, 1, 1, 1];
  const REST = k => ({ x: k ? 772 : 308, y: 990, r: k ? 174 : -174, f: CUP, sp: .3, flip: k ? 1 : 0 });
  const UP = k => ({ x: k ? 790 : 290, y: 540, r: k ? 10 : -10, f: CUP, sp: .35 });          // the reference's talking hands
  const LOW = k => ({ x: k ? 742 : 338, y: 800, r: k ? 60 : -60, f: CUP, sp: .5, flip: k ? 1 : 0 });
  const P = {
    talk: [UP(0), UP(1)],
    calm: [REST(0), REST(1)],
shy: [REST(0), REST(1)],
    smile: [REST(0), REST(1)],
    explain: [{ x: 196, y: 640, r: -62, f: OPEN, sp: 1, flip: 0, ta: -20 }, { x: 742, y: 800, r: -90, f: CUP, sp: .5, flip: 1, el: 1 }],
    present: [{ x: 196, y: 640, r: -62, f: OPEN, sp: 1, flip: 0, ta: -20 }, { x: 742, y: 800, r: -90, f: CUP, sp: .5, flip: 1, el: 1 }],
    both: [{ x: 196, y: 660, r: -66, f: OPEN, sp: 1 }, { x: 884, y: 660, r: 66, f: OPEN, sp: 1 }],
    hi: [REST(0), { x: 850, y: 350, r: 12, f: OPEN, sp: 1, wv: 1 }],
    wave: [REST(0), { x: 850, y: 350, r: 12, f: OPEN, sp: 1, wv: 1 }],
    point_up: [{ x: 292, y: 420, r: -6, f: POINT, sp: 0 }, REST(1)],
    point_side: [{ x: 132, y: 590, r: -78, f: POINT, sp: 0 }, REST(1)],
    count: [REST(0), { x: 810, y: 440, r: 4, f: [.2, 1, 1, 0, 0], sp: .9 }],
    count3: [REST(0), { x: 810, y: 440, r: 4, f: [.2, 1, 1, 1, 0], sp: .9 }],
    one: [REST(0), { x: 810, y: 440, r: 4, f: POINT, sp: 0 }],
    shrug: [{ x: 170, y: 668, r: -74, f: OPEN, sp: 1 }, { x: 910, y: 668, r: 74, f: OPEN, sp: 1 }],
    shocked: [{ x: 496, y: 424, r: 62, f: FLAT, sp: 0, ta: -20, el: 1 }, { x: 584, y: 430, r: -62, f: FLAT, sp: 0, ta: -20, el: 1 }],
    gasp: [{ x: 224, y: 706, r: -44, f: OPEN, sp: 1 }, { x: 856, y: 706, r: 44, f: OPEN, sp: 1 }],
    oops: [{ x: 408, y: 390, r: 12, f: FLAT, sp: .3 }, { x: 672, y: 390, r: -12, f: FLAT, sp: .3 }],
    excited: [{ x: 236, y: 420, r: -12, f: FIST }, { x: 844, y: 420, r: 12, f: FIST }],
    shh: [REST(0), { x: 556, y: 512, r: -4, f: POINT, sp: 0, ta: -30 }],
    thumbs_up: [REST(0), { x: 810, y: 500, r: 0, f: [1, 0, 0, 0, 0], ta: -8 }],
    think: [REST(0), { x: 580, y: 512, r: -14, f: [.6, .25, 0, 0, 0], ta: -70 }],
    wait: [REST(0), { x: 815, y: 460, r: 0, f: OPEN, sp: .25 }],
    stop: [{ x: 265, y: 460, r: 0, f: OPEN, sp: .25 }, { x: 815, y: 460, r: 0, f: OPEN, sp: .25 }],
    facepalm: [REST(0), { x: 600, y: 300, r: -26, f: FLAT, sp: .35 }],
    clasp: [{ x: 512, y: 740, r: 50, f: [.4, .5, .5, .5, .5] }, { x: 572, y: 744, r: -50, f: [.4, .5, .5, .5, .5] }],
    arms_crossed: [{ x: 640, y: 790, r: 80, f: [.3, .4, .4, .4, .4] }, { x: 440, y: 800, r: -80, f: [.3, .4, .4, .4, .4] }],
  };
  const FACE = {
    talk: { smile: .6 }, calm: { smile: .45 }, shy: { smile: .2, brow: .4, lookX: -3, lookY: 4, tilt: 3, lid: .1 }, smile: { smile: 1, happy: .0, brow: .2 }, explain: { smile: .65, brow: .25, turn: -.5, lookX: -3 },
    present: { smile: .7, brow: .3, turn: -.5, lookX: -3 }, both: { smile: .7, brow: .4 }, hi: { smile: 1, grin: 1, brow: .4 }, wave: { smile: 1, grin: 1, brow: .4 },
    point_up: { smile: .7, brow: .6, lookX: -4, lookY: -5, turn: -.4 }, point_side: { smile: .3, brow: .1, brow2: .6, lookX: -7, lid: .3, turn: -1 },
    count: { smile: .55, brow: .3 }, count3: { smile: .55, brow: .3 }, one: { smile: .55, brow: .4 },
    shrug: { smile: .2, brow: .9, browA: .5, tilt: 5, shrug: 1 }, shocked: { smile: 0, brow: 1, eyes: 1.3, shock: 1 },
    gasp: { smile: 0, brow: 1, eyes: 1.3, shock: 1 }, oops: { smile: -.3, brow: .8, browA: .8, eyes: 1.2, shock: 1, sweat: 1 },
    excited: { smile: 1, grin: 1, brow: .7, happy: 1 }, shh: { smile: .25, brow: .5, lookX: 3 }, thumbs_up: { smile: 1, grin: 1, brow: .3, wink: 1 },
    think: { smile: .1, brow: .1, brow2: .7, lookX: 6, lookY: -7, tilt: -5, q: 1 }, wait: { smile: .15, brow: .5 }, stop: { smile: 0, brow: .6 },
    facepalm: { smile: -.5, brow: -.2, browA: .7, lid: 1, tilt: -6, sweat: 1 }, clasp: { smile: .6 },
    nervous: { smile: .2, brow: .7, browA: .7, sweat: 1 }, stressed: { smile: -.3, brow: .6, browA: .9, sweat: 1 }, sad: { smile: -.7, brow: .2, browA: 1, lid: .3 },
    angry: { smile: -.5, brow: -.4, browA: -1 }, laugh: { smile: 1, grin: 1, happy: 1, brow: .5 }, ok: { smile: .8, wink: 1 },
    bored: { smile: -.1, lid: .5 }, arms_crossed: { smile: .15, brow2: .6, lid: .25 }, skeptical: { smile: .1, brow2: .8, lid: .4, lookX: -6, turn: -.6 },
    cry: { smile: -.9, brow: .5, browA: 1, lid: .6, sweat: 1 }, panic: { smile: -.2, brow: 1, browA: .6, eyes: 1.25, shock: 1, sweat: 1 }, wink: { smile: .9, wink: 1 } };
  const ALIAS = { rest: 'calm', up: 'point_up', card: 'point_side', palms: 'both', thumb: 'thumbs_up', end: 'smile', happy: 'smile', surprised: 'gasp',
    neutral: 'talk', yes: 'thumbs_up', no: 'stop', laugh: 'talk', ok: 'thumbs_up', nervous: 'talk', stressed: 'oops', panic: 'oops', sad: 'calm',
    angry: 'arms_crossed', cry: 'calm', bored: 'calm', skeptical: 'point_side', wink: 'talk', two: 'count', three: 'count3' };
  const pose = n => P[n] || P[ALIAS[n]] || P.talk;
  const face0 = { smile: .55, brow: 0, brow2: 0, browA: 0, eyes: 1, shock: 0, grin: 0, happy: 0, wink: 0, lookX: 0, lookY: 0, tilt: 0, lid: 0, sweat: 0, turn: 0, shrug: 0, q: 0 };
  const arm0 = q => ({ x: q.x, y: q.y, r: q.r, ta: q.ta ?? -58, sp: q.sp ?? .4, flip: q.flip || 0, el: q.el || 0, wv: q.wv || 0, f0: q.f[0], f1: q.f[1], f2: q.f[2], f3: q.f[3], f4: q.f[4] });

  // ---------- state + redraw
  const S = { a: [arm0(REST(0)), arm0(REST(1))], f: Object.assign({ open: 0, blink: 0, nod: 0, wave: 0, bob: 0, sway: 0 }, face0) };
  const FX = [-25.5, -8.5, 8.5, 25.5], FL = [50, 58, 54, 42], FA = [-15, -5, 5, 15];
  function drawArm(k) { const s = S.a[k], a = ARM[k], side = k ? 1 : -1, f = S.f;
    const sx = SHO[k][0], sy = SHO[k][1] - f.shrug * 18;
    const r = s.r + f.wave * s.wv, rad = r * Math.PI / 180, ux = Math.sin(rad), uy = -Math.cos(rad);
    const up = s.y < 880 ? 1 : 0, hx = s.x + f.sway * side * 4 * up, hy = s.y + f.bob * up;
    const wx = hx - ux * 60, wy = hy - uy * 60;
    let dx = wx - sx, dy = wy - sy, d = Math.hypot(dx, dy) || 1; const dd = Math.min(d, L1 + L2 - 2);
    const aa = (L1 * L1 - L2 * L2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(L1 * L1 - aa * aa, 0));
    const mx = sx + dx / d * aa, my = sy + dy / d * aa, px = -dy / d, py = dx / d;
    const e1 = [mx + px * h, my + py * h], e2 = [mx - px * h, my - py * h];
    const out = s.el > .5, sc = e => out ? side * e[0] : side * e[0] * .3 + e[1]; const e = sc(e1) > sc(e2) ? e1 : e2;
    const d1 = `M${sx} ${sy} L${e[0]} ${e[1]} L${wx} ${wy}`;
    a.lo.setAttribute('d', d1); a.hi.setAttribute('d', `M${sx - 3} ${sy - 4} L${e[0] - 3} ${e[1] - 4} L${wx - 3} ${wy - 4}`); shArm[k].setAttribute('d', d1);
    let fx = wx - e[0], fy = wy - e[1]; const fl = Math.hypot(fx, fy) || 1; fx /= fl; fy /= fl;
    a.cuff.setAttribute('d', `M${wx - fx * 12} ${wy - fy * 12} L${wx + fx * 14} ${wy + fy * 14}`);
    a.cuffL.setAttribute('d', `M${wx - fx * 12 - fy * 37} ${wy - fy * 12 + fx * 37} L${wx - fx * 12 + fy * 37} ${wy - fy * 12 - fx * 37}`);
    const mir = (k === 0) !== (s.flip > .5);
    a.hand.setAttribute('transform', `translate(${hx} ${hy}) rotate(${r}) scale(${mir ? -HS : HS} ${HS})`);
    set(shHand[k], { cx: hx, cy: hy - 10 });
    const ext = [s.f0, s.f1, s.f2, s.f3, s.f4];
    for (let i = 0; i < 4; i++) { const L = 9 + FL[i] * ext[i + 1];
      set(a.fingers[i], { x: FX[i] - 8.5, y: -26 - L, width: 17, height: L + 14, rx: 8.5, transform: `rotate(${FA[i] * s.sp * ext[i + 1]} ${FX[i]} -22)` }); }
    const TL = 14 + 36 * ext[0], tt = `translate(-27 12) rotate(${s.ta})`;
    set(a.thumb, { x: -10, y: -TL, width: 20, height: TL + 12, rx: 10, transform: tt });
    set(a.thumbFill, { x: -7.5, y: -6, width: 15, height: 18, rx: 6, transform: tt }); }
  function drawFace() { const f = S.f;
    const ht = `rotate(${f.tilt + (BALBALA ? 1.5 : 0) + f.nod * 1.6} 540 500) translate(0 ${f.nod * 5 - f.shrug * 4}) translate(540 500) scale(1.3) translate(-540 -500)`;
    head.setAttribute('transform', ht); shHead.setAttribute('transform', ht);
    feat.setAttribute('transform', `translate(${f.turn * 9} 0)`);
    set(earL, { rx: 17 + f.turn * 4 }); set(earR, { rx: 17 - f.turn * 4 });
    // brows: raise, angle (browA < 0 angry, > 0 worried), brow2 lifts the right one alone
    [0, 1].forEach(k => { const by = 288 - ((f.brow + (BALBALA ? 0.3 : 0)) + (k ? f.brow2 : 0)) * 14, a = f.browA * 9, s = k ? 1 : -1, cx = k ? 586 : 494;
      brows[k].setAttribute('d', BALBALA ? `M${cx + s * 34} ${by + 6 - a} Q${cx + s * 8} ${by - 15} ${cx - s * 30} ${by + a + 2}` : `M${cx + s * 30} ${by + 5 - a} Q${cx + s * 6} ${by - 9} ${cx - s * 26} ${by + a + 1}`); });
    // eyes
    eyes.forEach((E, k) => { const closed = f.happy > .5 || (k === 1 && f.wink > .5), rx = (BALBALA ? 20 : 17.5) * f.eyes, ry = (BALBALA ? 18 : 15.5) * f.eyes, { x, y } = E, lookY = f.lookY + (BALBALA ? -2 : 0);
      const baseLid = BALBALA ? 0 : .14;
      const lid = Math.max(f.lid, f.blink, f.eyes > 1.1 ? 0 : baseLid);
      set(E.white, { rx, ry, opacity: closed ? 0 : 1 }); set(E.clip, { cx: x, cy: y, rx, ry });
      set(E.pupil, { cx: x + f.lookX, cy: y + lookY + 1, r: BALBALA ? 14 : 10.5, opacity: closed ? 0 : 1 }); set(E.glint, { cx: x + f.lookX - 3.5, cy: y + lookY - 3, opacity: closed ? 0 : 1 });
      if (E.pupilDark) set(E.pupilDark, { cx: x + f.lookX, cy: y + lookY + 1, opacity: closed ? 0 : 1 });
      if (E.irisRing) set(E.irisRing, { cx: x + f.lookX, cy: y + lookY + 1, opacity: closed ? 0 : 1 });
      if (E.irisInner) set(E.irisInner, { cx: x + f.lookX, cy: y + lookY + 1, opacity: closed ? 0 : .85 });
      if (E.glint2) set(E.glint2, { cx: x + f.lookX + 4, cy: y + lookY + 5, opacity: closed ? 0 : 1 });
      if (E.glint3) set(E.glint3, { cx: x + f.lookX - 6, cy: y + lookY - 5, opacity: closed ? 0 : .7 });
      const cut = y - ry + 2 * ry * lid; set(E.lid, { x: x - rx - 2, y: y - ry - 2, width: rx * 2 + 4, height: Math.max(0, cut - (y - ry) + 2), opacity: closed ? 0 : 1 });
      if (closed) E.line.setAttribute('d', `M${x - 19} ${y + 5} Q${x} ${y - 15} ${x + 19} ${y + 5}`);
      else if (lid < .06) {
  if (BALBALA) {
    if (k === 0) E.line.setAttribute('d', `M${x - rx} ${y - 1.5} A${rx} ${ry} 0 0 1 ${x + rx} ${y + 0.5}`);
    else E.line.setAttribute('d', `M${x - rx} ${y + 0.5} A${rx} ${ry} 0 0 1 ${x + rx} ${y - 1.5}`);
  } else E.line.setAttribute('d', `M${x - rx} ${y - 1} A${rx} ${ry} 0 0 1 ${x + rx} ${y - 1}`);
}
      else { const q = Math.max(-1, Math.min(1, (cut - y) / ry)), hw = Math.max(rx * Math.sqrt(1 - q * q), rx * .82); E.line.setAttribute('d', `M${x - hw} ${Math.min(cut, y + 6)} Q${x} ${Math.min(cut, y + 6) + (lid > .9 ? 7 : -4 + lid * 6)} ${x + hw} ${Math.min(cut, y + 6)}`); } });
    // mouth
    const sm = f.smile + (BALBALA ? 0.2 : 0), y0 = BALBALA ? 414 : 430, o = Math.max(f.open, f.shock ? .6 : 0, f.grin > .5 ? .5 : 0);
    if (o < .12) { const mx = BALBALA ? 22 : 32, lx = BALBALA ? 8 : 12; mOpen.setAttribute('d', ''); mLine.setAttribute('d', `M${540 - mx - sm * 4} ${y0 - sm * 6} Q540 ${y0 + sm * 18} ${540 + mx + sm * 4} ${y0 - sm * 6}`); mLip.setAttribute('d', `M${540 - lx} ${y0 + 20 + Math.max(sm, 0) * 4} Q540 ${y0 + 24 + Math.max(sm, 0) * 4} ${540 + lx} ${y0 + 20 + Math.max(sm, 0) * 4}`); set(teeth, { height: 0 }); set(tongue, { opacity: 0 }); }
    else { mLine.setAttribute('d', '');
      let d;
      if (f.shock > .5) { const w = 19 + o * 6, h = 16 + o * 14; d = `M${540 - w} ${y0 + 4} C${540 - w} ${y0 - h} ${540 + w} ${y0 - h} ${540 + w} ${y0 + 4} C${540 + w} ${y0 + h + 14} ${540 - w} ${y0 + h + 14} ${540 - w} ${y0 + 4} Z`;
        set(teeth, { height: 0 }); set(tongue, { cx: 540, cy: y0 + h + 12, rx: w * .7, opacity: 1 }); mLip.setAttribute('d', ''); }
      else { const sp = Math.max(sm, 0), w = (BALBALA ? 22 : 27) + sp * (BALBALA ? 7 : 9) + f.grin * 7, h = (BALBALA ? 6 : 7) + o * 30, ty = y0 - 9, cy = ty - sp * 5;
        d = `M${540 - w} ${cy} Q540 ${ty + 5} ${540 + w} ${cy} Q${540 + w * .82} ${ty + h + 2} 540 ${ty + h + 5} Q${540 - w * .82} ${ty + h + 2} ${540 - w} ${cy} Z`;
        set(teeth, { x: 540 - w * .72, y: ty - 6, width: w * 1.44, height: 16 + (f.grin > .5 ? 3 : 0) }); set(tongue, { cx: 540, cy: ty + h + 6, rx: w * .55, opacity: 1 });
        mLip.setAttribute('d', `M${540 - (BALBALA ? 8 : 12)} ${ty + h + 15} Q540 ${ty + h + 19} ${540 + (BALBALA ? 8 : 12)} ${ty + h + 15}`); }
      mOpen.setAttribute('d', d); document.getElementById('avmclip').setAttribute('d', d); }
    sweat.forEach(s => s.setAttribute('opacity', f.sweat)); qb.setAttribute('opacity', f.q);
    fig.setAttribute('transform', `rotate(${f.sway * .7} 540 900)`); }
  function redraw() { drawArm(0); drawArm(1); drawFace(); }

  // ---------- timeline: poses per beat, mouth per word, blinks, reactions
  const setPose = (name, t, dur) => { const p = pose(name), fto = Object.assign({}, face0, FACE[name] || FACE[ALIAS[name]] || {});
    p.forEach((q, k) => { const s = S.a[k], to = arm0(q);
      if (t <= 0) { Object.assign(s, to); tl.set(s, to, 0); } else tl.to(s, Object.assign({ duration: dur, ease: 'back.out(1.5)' }, to), t + k * .03); });
    if (t <= 0) { Object.assign(S.f, fto); tl.set(S.f, fto, 0); } else tl.to(S.f, Object.assign({ duration: dur * .7, ease: 'power2.out' }, fto), t);
    if (p.some(q => q.wv)) { for (let k = 0; k < 6; k++) tl.to(S.f, { wave: k % 2 ? -13 : 13, duration: .15, ease: 'sine.inOut' }, t + .2 + k * .15);
      tl.to(S.f, { wave: 0, duration: .15 }, t + .2 + 6 * .15); }
    if (name === 'gasp' || name === 'oops' || name === 'panic') for (let k = 0; k < 6; k++) tl.to(S.f, { bob: k % 2 ? 7 : -7, duration: .06 }, t + .15 + k * .06); };
  A.poses.forEach((b, k) => setPose(b.pose, k ? b.t0 - .08 : 0, .34));
  // mouth on every word (bigger for longer words); the hands and head beat along on the stronger words
  let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  A.words.forEach((w, i) => { const v = Math.min(.9, .38 + w.n * .055); tl.to(S.f, { open: v, duration: .07, ease: 'power1.out' }, w.t);
    tl.to(S.f, { open: .04, duration: .09, ease: 'power1.in' }, w.t + Math.max(.1, Math.min(w.d * .65, .28)));
    if (w.n > 3) { tl.to(S.f, { bob: -9 - rnd() * 6, duration: .09, ease: 'power2.out' }, w.t); tl.to(S.f, { bob: 0, duration: .2, ease: 'sine.inOut' }, w.t + .1); }
    if (w.n > 5) tl.to(S.f, { nod: 1, duration: .12, yoyo: true, repeat: 1, ease: 'sine.inOut' }, w.t);
    if (i % 5 === 2) tl.to(S.f, { sway: rnd() * 2 - 1, duration: .5, ease: 'sine.inOut' }, w.t); });
  let t = .9; while (t < R.dur - .3) { tl.to(S.f, { blink: 1, duration: .05 }, t); tl.to(S.f, { blink: 0, duration: .08 }, t + .09); t += 2.2 + rnd() * 2.2; }
  (R.reacts || []).forEach(t => tl.to(S.f, { eyes: 1.3, brow: 1, duration: .12, yoyo: true, repeat: 1 }, t));
  window.__avatar = S; redraw(); const prev = tl.eventCallback('onUpdate'); tl.eventCallback('onUpdate', function () { if (prev) prev.apply(this, arguments); redraw(); });
})();
