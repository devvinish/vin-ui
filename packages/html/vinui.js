/*! VinUI behaviours | MIT | vinish.dev/ui
 * Adds keyboard and mouse behaviour to the HTML versions of the interactive components.
 * Include once, anywhere:  <script src="vinui.js" defer></script>
 * It finds elements with data-vin-tabs, -select, -toggle, -toggle-group, -textarea, -otp, -slider, -dismiss, -tooltip, -popover and -toast on load (and hides avatar pictures that fail to load). For markup added later, call VinUI.init(element).
 * Used by: Tabs, Select, Toggle, Toggle Group, Textarea (count, auto-grow), Input OTP, Slider, Alert (close), Tooltip,
 * Popover (placement), Toast (VinUI.toast). Components that need no
 * JavaScript (Button, Checkbox, Radio Group, Switch, Native Select…) don't use it.
 * Data display: data-vin-copy (Code Block copy button), data-vin-carousel (Carousel), data-vin-chart (Chart tooltips).
 */
(function () {
  "use strict";

  /* ---------------- Tabs (WAI-ARIA tabs, automatic activation) ---------------- */
  function initTabs(root) {
    var list = root.querySelector('[role="tablist"]');
    if (!list) return;
    var tabs = function () { return Array.prototype.slice.call(list.querySelectorAll('[role="tab"]:not(:disabled)')); };

    function select(tab, focus) {
      Array.prototype.forEach.call(list.querySelectorAll('[role="tab"]'), function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    list.addEventListener("click", function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab && !tab.disabled && list.contains(tab)) select(tab, false);
    });
    list.addEventListener("keydown", function (e) {
      var all = tabs(), i = all.indexOf(document.activeElement);
      if (i < 0) return;
      var rtl = getComputedStyle(list).direction === "rtl";
      var next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      var target = next ? all[(i + next + all.length) % all.length] : e.key === "Home" ? all[0] : e.key === "End" ? all[all.length - 1] : null;
      if (target) { e.preventDefault(); select(target, true); }
    });
  }

  /* ---------------- Select (WAI-ARIA select-only combobox) ---------------- */
  function initSelect(root) {
    var trigger = root.querySelector('[role="combobox"]');
    var list = root.querySelector('[role="listbox"]');
    var value = root.querySelector(".vin-select__value");
    var input = root.querySelector('input[type="hidden"]');
    if (!trigger || !list) return;
    var typed = "", typedAt = 0;

    var options = function () { return Array.prototype.slice.call(list.querySelectorAll('[role="option"]')); };
    var enabled = function () { return options().filter(function (o) { return o.getAttribute("aria-disabled") !== "true"; }); };
    var selected = function () { return list.querySelector('[aria-selected="true"]'); };
    var active = function () { return list.querySelector("[data-active]"); };
    var isOpen = function () { return trigger.getAttribute("aria-expanded") === "true"; };

    function setActive(opt) {
      options().forEach(function (o) { o.toggleAttribute("data-active", o === opt); });
      if (opt) { trigger.setAttribute("aria-activedescendant", opt.id); opt.scrollIntoView({ block: "nearest" }); }
      else trigger.removeAttribute("aria-activedescendant");
    }
    function place() {
      var r = trigger.getBoundingClientRect();
      list.style.minWidth = r.width + "px";
      list.style.left = r.left + "px";
      var below = window.innerHeight - r.bottom, h = list.offsetHeight;
      list.style.top = (below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4) + "px";
    }
    function open(which) {
      if (trigger.disabled || isOpen()) return;
      trigger.setAttribute("aria-expanded", "true");
      list.showPopover ? list.showPopover() : (list.style.display = "block");
      place();
      var all = enabled();
      setActive(which === "first" ? all[0] : which === "last" ? all[all.length - 1] : selected() || all[0]);
      window.addEventListener("scroll", place, true);
      window.addEventListener("resize", place);
      document.addEventListener("pointerdown", outside, true);
    }
    function close() {
      if (!isOpen()) return;
      trigger.setAttribute("aria-expanded", "false");
      list.hidePopover ? list.hidePopover() : (list.style.display = "");
      setActive(null);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", outside, true);
    }
    function outside(e) { if (!root.contains(e.target) && !list.contains(e.target)) close(); }
    function choose(opt) {
      if (!opt || opt.getAttribute("aria-disabled") === "true") return;
      options().forEach(function (o) { o.setAttribute("aria-selected", o === opt ? "true" : "false"); });
      if (value) { value.textContent = opt.textContent; value.removeAttribute("data-placeholder"); }
      if (input) input.value = opt.getAttribute("data-value") || opt.textContent;
      root.dispatchEvent(new CustomEvent("vin-change", { bubbles: true, detail: { value: opt.getAttribute("data-value") || opt.textContent } }));
    }
    function move(step) {
      var all = enabled(), i = all.indexOf(active());
      setActive(all[Math.min(all.length - 1, Math.max(0, i + step))]);
    }
    function typeahead(ch) {
      var now = Date.now();
      typed = now - typedAt > 600 ? ch : typed + ch;
      typedAt = now;
      var all = enabled(), start = all.indexOf(active()) + (typed.length === 1 ? 1 : 0);
      var ordered = all.slice(start).concat(all.slice(0, start));
      var hit = ordered.find(function (o) { return o.textContent.trim().toLowerCase().indexOf(typed.toLowerCase()) === 0; });
      if (hit) { if (isOpen()) setActive(hit); else choose(hit); }
    }

    trigger.addEventListener("click", function () { isOpen() ? close() : open(); });
    trigger.addEventListener("blur", function () { setTimeout(function () { if (!root.contains(document.activeElement)) close(); }, 0); });
    trigger.addEventListener("keydown", function (e) {
      var k = e.key;
      if (!isOpen()) {
        if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") { e.preventDefault(); open(); }
        else if (k === "Home") { e.preventDefault(); open("first"); }
        else if (k === "End") { e.preventDefault(); open("last"); }
        else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeahead(k);
        return;
      }
      if (k === "ArrowDown") { e.preventDefault(); e.altKey ? null : move(1); }
      else if (k === "ArrowUp") { e.preventDefault(); if (e.altKey) { choose(active()); close(); } else move(-1); }
      else if (k === "Home") { e.preventDefault(); setActive(enabled()[0]); }
      else if (k === "End") { e.preventDefault(); var all = enabled(); setActive(all[all.length - 1]); }
      else if (k === "PageDown") { e.preventDefault(); move(10); }
      else if (k === "PageUp") { e.preventDefault(); move(-10); }
      else if (k === "Enter" || k === " ") { e.preventDefault(); choose(active()); close(); }
      else if (k === "Escape") { e.preventDefault(); close(); }
      else if (k === "Tab") { choose(active()); close(); }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeahead(k);
    });
    list.addEventListener("pointermove", function (e) {
      var opt = e.target.closest('[role="option"]');
      if (opt && opt.getAttribute("aria-disabled") !== "true" && opt !== active()) setActive(opt);
    });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    list.addEventListener("click", function (e) {
      var opt = e.target.closest('[role="option"]');
      if (opt && opt.getAttribute("aria-disabled") !== "true") { choose(opt); close(); trigger.focus(); }
    });
  }

  /* ---------------- Toggle: flips aria-pressed ---------------- */
  function initToggle(btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.dispatchEvent(new CustomEvent("vin-change", { bubbles: true, detail: { pressed: on } }));
    });
  }

  /* ---------------- Textarea: character count and auto-grow ---------------- */
  var canFieldSize = typeof CSS !== "undefined" && CSS.supports && CSS.supports("field-sizing", "content");
  function initTextarea(ta) {
    var count = document.getElementById(ta.getAttribute("data-vin-textarea"));
    var max = parseInt(ta.getAttribute("maxlength"), 10);
    function update() {
      if (count && max) {
        count.textContent = ta.value.length + " / " + max;
        count.toggleAttribute("data-over", ta.value.length >= max);
      }
      if (!canFieldSize && ta.classList.contains("vin-textarea--auto")) {
        ta.style.height = "auto";
        var cs = getComputedStyle(ta);
        ta.style.height = ta.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + "px";
      }
    }
    ta.addEventListener("input", update);
    update();
  }

  /* ---------------- Toggle Group: single (radiogroup) or multiple (pressed buttons) ---------------- */
  function initToggleGroup(root) {
    var single = root.getAttribute("role") === "radiogroup";
    var items = function () { return Array.prototype.slice.call(root.querySelectorAll(".vin-toggle:not(:disabled)")); };
    function sync(focusOn) {
      var all = items(), on = all.filter(function (b) { return b.getAttribute(single ? "aria-checked" : "aria-pressed") === "true"; });
      var stop = focusOn || on[0] || all[0];
      all.forEach(function (b) { b.tabIndex = b === stop ? 0 : -1; });
    }
    function choose(btn) {
      if (single) {
        items().forEach(function (b) { b.setAttribute("aria-checked", b === btn ? "true" : "false"); });
      } else {
        btn.setAttribute("aria-pressed", btn.getAttribute("aria-pressed") === "true" ? "false" : "true");
      }
      sync(btn);
      root.dispatchEvent(new CustomEvent("vin-change", { bubbles: true }));
    }
    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".vin-toggle");
      if (btn && !btn.disabled && root.contains(btn)) choose(btn);
    });
    root.addEventListener("keydown", function (e) {
      var all = items(), i = all.indexOf(document.activeElement);
      if (i < 0) return;
      var rtl = getComputedStyle(root).direction === "rtl";
      var step = { ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 }[e.key];
      var target = step ? all[(i + step + all.length) % all.length] : e.key === "Home" ? all[0] : e.key === "End" ? all[all.length - 1] : null;
      if (!target) return;
      e.preventDefault();
      target.focus();
      if (single) choose(target); else sync(target);
    });
    sync();
  }

  /* ---------------- Input OTP: mirror the one real input into the slots ---------------- */
  function initOtp(root) {
    var input = root.querySelector(".vin-otp__input");
    var slots = Array.prototype.slice.call(root.querySelectorAll(".vin-otp__slot"));
    if (!input) return;
    var re = input.getAttribute("inputmode") === "numeric" ? /\D/g : /[^a-z0-9]/gi;
    function render() {
      var clean = input.value.replace(re, "").slice(0, slots.length);
      if (clean !== input.value) input.value = clean;
      var focused = document.activeElement === input;
      slots.forEach(function (s, i) {
        s.textContent = clean[i] || "";
        s.toggleAttribute("data-active", focused && i === Math.min(clean.length, slots.length - 1));
      });
      input.setSelectionRange(clean.length, clean.length);
      if (clean.length === slots.length) root.dispatchEvent(new CustomEvent("vin-complete", { bubbles: true, detail: { value: clean } }));
    }
    ["input", "focus", "blur", "click", "keyup"].forEach(function (ev) { input.addEventListener(ev, function () { setTimeout(render, 0); }); });
    render();
  }

  /* ---------------- Slider: native single slider fill, or a two-thumb range ---------------- */
  function initSlider(el) {
    if (!el.classList.contains("vin-range")) {
      var pct = function () { var min = +el.min || 0, max = el.max === "" ? 100 : +el.max; return ((+el.value - min) / (max - min)) * 100 + "%"; };
      var update = function () {
        el.style.setProperty("--vin-fill", pct());
        var out = el.id && document.querySelector('output[for~="' + el.id + '"]');
        if (out) out.textContent = (out.getAttribute("data-format") || "{value}").replace("{value}", el.value);
      };
      el.addEventListener("input", update);
      update();
      return;
    }
    // Range: WAI-ARIA multi-thumb slider.
    var thumbs = Array.prototype.slice.call(el.querySelectorAll('[role="slider"]'));
    var hidden = Array.prototype.slice.call(el.querySelectorAll('input[type="hidden"]'));
    var min = +(el.getAttribute("data-min") || 0), max = +(el.getAttribute("data-max") || 100), step = +(el.getAttribute("data-step") || 1);
    var fmt = el.getAttribute("data-format") || "{value}";
    var vals = thumbs.map(function (t) { return +t.getAttribute("aria-valuenow"); });
    var rtl = function () { return getComputedStyle(el).direction === "rtl"; };
    function render() {
      el.style.setProperty("--vin-from", String((vals[0] - min) / (max - min)));
      el.style.setProperty("--vin-to", String((vals[1] - min) / (max - min)));
      thumbs.forEach(function (t, i) {
        t.setAttribute("aria-valuenow", vals[i]);
        t.setAttribute("aria-valuetext", fmt.replace("{value}", vals[i]));
        t.setAttribute("aria-valuemin", i === 0 ? min : vals[0]);
        t.setAttribute("aria-valuemax", i === 0 ? vals[1] : max);
        if (hidden[i]) hidden[i].value = vals[i];
      });
      var out = thumbs[0].id && document.querySelector('output[for~="' + thumbs[0].id + '"]');
      if (out) { var f = out.getAttribute("data-format") || fmt; out.textContent = f.replace("{value}", vals[0]) + " – " + f.replace("{value}", vals[1]); }
    }
    function set(i, v) {
      v = Math.round((v - min) / step) * step + min;
      var lo = i === 0 ? min : vals[0], hi = i === 0 ? vals[1] : max;
      v = Math.min(hi, Math.max(lo, v));
      if (v === vals[i]) return;
      vals[i] = v;
      render();
      el.dispatchEvent(new CustomEvent("vin-change", { bubbles: true, detail: { value: vals.slice() } }));
    }
    thumbs.forEach(function (t, i) {
      t.addEventListener("keydown", function (e) {
        var dir = rtl() ? -1 : 1, big = Math.max(step, (max - min) / 10);
        var d = { ArrowRight: step * dir, ArrowLeft: -step * dir, ArrowUp: step, ArrowDown: -step, PageUp: big, PageDown: -big }[e.key];
        if (d !== undefined) { e.preventDefault(); set(i, vals[i] + d); }
        else if (e.key === "Home") { e.preventDefault(); set(i, min); }
        else if (e.key === "End") { e.preventDefault(); set(i, max); }
      });
    });
    function valueAt(x) {
      var r = el.getBoundingClientRect(), size = thumbs[0].offsetWidth;
      var f = (x - r.left - size / 2) / (r.width - size);
      if (rtl()) f = 1 - f;
      return min + Math.min(1, Math.max(0, f)) * (max - min);
    }
    el.addEventListener("pointerdown", function (e) {
      if (el.getAttribute("aria-disabled") === "true") return;
      var v = valueAt(e.clientX);
      var i = thumbs.indexOf(e.target) >= 0 ? thumbs.indexOf(e.target) : Math.abs(v - vals[0]) <= Math.abs(v - vals[1]) && !(v > vals[1]) ? 0 : 1;
      if (vals[0] === vals[1]) i = v < vals[0] ? 0 : 1;
      e.preventDefault();
      thumbs[i].focus();
      if (thumbs.indexOf(e.target) < 0) set(i, v);
      el.setPointerCapture(e.pointerId);
      var move = function (ev) { set(i, valueAt(ev.clientX)); };
      var up = function () { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    });
    render();
  }

  /* ---------- Dismiss (Alert close button) ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function initDismiss(btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest(".vin-alert") || btn.parentElement;
      var had = box.contains(document.activeElement);
      // Focus the next control after the alert (or the one before it), so keyboard users stay in place.
      var all = Array.prototype.filter.call(document.querySelectorAll(FOCUSABLE), function (el) { return !box.contains(el); });
      var after = all.filter(function (el) { return box.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING; });
      var next = after[0] || all[all.length - after.length - 1];
      box.dispatchEvent(new CustomEvent("vin-dismiss", { bubbles: true }));
      box.remove();
      if (had && next) next.focus();
    });
  }

  /* ---------- Floating placement (Tooltip, Popover): flips when there's no room, stays on screen ---------- */
  function placeFloating(el, anchor, side, align, gap) {
    var r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
    var opposite = { top: "bottom", bottom: "top", left: "right", right: "left" };
    var fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m, left: r.left - gap - w >= m, right: r.right + gap + w <= vw - m };
    if (!fits[side] && fits[opposite[side]]) side = opposite[side];
    if (getComputedStyle(anchor).direction === "rtl") align = align === "start" ? "end" : align === "end" ? "start" : align;
    var x, y;
    if (side === "top" || side === "bottom") {
      y = side === "top" ? r.top - gap - h : r.bottom + gap;
      x = align === "start" ? r.left : align === "end" ? r.right - w : r.left + (r.width - w) / 2;
    } else {
      x = side === "left" ? r.left - gap - w : r.right + gap;
      y = align === "start" ? r.top : align === "end" ? r.bottom - h : r.top + (r.height - h) / 2;
    }
    el.style.left = Math.max(m, Math.min(x, vw - w - m)) + "px";
    el.style.top = Math.max(m, Math.min(y, vh - h - m)) + "px";
    el.setAttribute("data-placed", side);
  }

  /* ---------- Tooltip: hover (after a delay) or keyboard focus; Escape hides ---------- */
  function initTooltip(trigger) {
    var tip = document.getElementById(trigger.getAttribute("data-vin-tooltip"));
    if (!tip) return;
    var side = tip.getAttribute("data-side") || "top", showTimer, hideTimer;
    var isOpen = function () { return tip.matches(":popover-open") || tip.style.display === "block"; };
    function show(now) {
      clearTimeout(hideTimer); clearTimeout(showTimer);
      showTimer = setTimeout(function () {
        if (!isOpen()) tip.showPopover ? tip.showPopover() : (tip.style.display = "block");
        placeFloating(tip, trigger, side, "center", 6);
        document.addEventListener("keydown", onKey, true);
      }, now ? 0 : 300);
    }
    function hide(now) {
      clearTimeout(showTimer); clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (isOpen()) tip.hidePopover ? tip.hidePopover() : (tip.style.display = "");
        document.removeEventListener("keydown", onKey, true);
      }, now ? 0 : 100);
    }
    function onKey(e) { if (e.key === "Escape" && isOpen()) { e.stopPropagation(); hide(true); } }
    trigger.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") show(); });
    trigger.addEventListener("pointerleave", function () { hide(); });
    trigger.addEventListener("focus", function () { if (trigger.matches(":focus-visible")) show(true); });
    trigger.addEventListener("blur", function () { hide(true); });
    trigger.addEventListener("pointerdown", function () { hide(true); });
    tip.addEventListener("pointerenter", function () { clearTimeout(hideTimer); });
    tip.addEventListener("pointerleave", function () { hide(); });
  }

  /* ---------- Popover: the browser opens and closes it; this places it by its trigger ---------- */
  function initPopover(pop) {
    var trigger = document.querySelector('[popovertarget="' + pop.id + '"]');
    if (!trigger || !pop.showPopover) return;
    var side = pop.getAttribute("data-side") || "bottom", align = pop.getAttribute("data-align") || "start";
    var place = function () { placeFloating(pop, trigger, side, align, 6); };
    trigger.setAttribute("aria-expanded", "false");
    pop.addEventListener("toggle", function (e) {
      var open = e.newState === "open";
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { place(); window.addEventListener("scroll", place, true); window.addEventListener("resize", place); }
      else { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); }
    });
  }

  /* ---------- Toast: VinUI.toast({ title, description, variant, action, duration }) ---------- */
  var TOAST_ICONS = {
    success: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    danger: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><path d="M12 16h.01"/>',
  };
  var SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  function toaster() {
    // Share a toaster that is already on the page (e.g. a React <Toaster>), so toasts never stack in two piles.
    var host = document.querySelector("[data-vin-toaster]") || document.querySelector("section.vin-toaster");
    if (!host) {
      host = document.createElement("section");
      host.className = "vin-toaster";
      host.setAttribute("aria-label", "Notifications");
      host.setAttribute("data-vin-toaster", "");
      document.body.appendChild(host);
    }
    return host;
  }
  function toast(opts) {
    if (typeof opts === "string") opts = { title: opts };
    var variant = opts.variant && opts.variant !== "default" ? opts.variant : "";
    var el = document.createElement("div");
    el.className = "vin-toast" + (variant ? " vin-toast--" + variant : "");
    // An empty live region first, then the text: screen readers announce it reliably.
    el.setAttribute("role", variant === "danger" ? "alert" : "status");
    toaster().appendChild(el);
    var timer, left = opts.duration || 5000, started;
    function dismiss() {
      clearTimeout(timer);
      if (!el.isConnected || el.hasAttribute("data-leaving")) return;
      el.setAttribute("data-leaving", "");
      var dur = parseFloat(getComputedStyle(el).transitionDuration) * 1000 || 0;
      setTimeout(function () { el.remove(); }, dur);
    }
    function run() { started = Date.now(); timer = setTimeout(dismiss, left); }
    function pause() { clearTimeout(timer); left -= Date.now() - started; }
    requestAnimationFrame(function () {
      var html = (TOAST_ICONS[variant] ? SVG_OPEN + ' class="vin-toast__icon">' + TOAST_ICONS[variant] + "</svg>" : "") +
        '<div class="vin-toast__content"><p class="vin-toast__title"></p>' + (opts.description ? '<p class="vin-toast__description"></p>' : "") +
        (opts.action ? '<div class="vin-toast__actions"><button type="button" class="vin-btn vin-btn--outline vin-btn--sm"></button></div>' : "") + "</div>" +
        '<button type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-toast__close" aria-label="Close">' + SVG_OPEN + '><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
      el.innerHTML = html;
      el.querySelector(".vin-toast__title").textContent = opts.title || "";
      if (opts.description) el.querySelector(".vin-toast__description").textContent = opts.description;
      if (opts.action) {
        var act = el.querySelector(".vin-toast__actions button");
        act.textContent = opts.action.label;
        act.addEventListener("click", function () { if (opts.action.onClick) opts.action.onClick(); dismiss(); });
      }
      el.querySelector(".vin-toast__close").addEventListener("click", dismiss);
      el.addEventListener("pointerenter", pause);
      el.addEventListener("pointerleave", run);
      el.addEventListener("focusin", pause);
      el.addEventListener("focusout", function (e) { if (!el.contains(e.relatedTarget)) run(); });
      run();
    });
    return { dismiss: dismiss, element: el };
  }
  function initToastTrigger(btn) {
    btn.addEventListener("click", function () {
      var d = btn.dataset;
      toast({
        title: d.vinToast, description: d.vinToastDescription, variant: d.vinToastVariant,
        action: d.vinToastAction ? { label: d.vinToastAction, onClick: function () { btn.dispatchEvent(new CustomEvent("vin-toast-action", { bubbles: true })); } } : null,
      });
    });
  }

  /* ---------- Dialog, Alert Dialog, Sheet: the browser's <dialog> ----------
     button[commandfor][command="show-modal" | "close"] opens and closes it natively.
     For browsers without commandfor or closedby, this does the same. */
  var hasCommand = typeof HTMLButtonElement !== "undefined" && "commandForElement" in HTMLButtonElement.prototype;
  var hasClosedBy = typeof HTMLDialogElement !== "undefined" && "closedBy" in HTMLDialogElement.prototype;
  if (!hasCommand) document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button[commandfor]");
    if (!btn || btn.disabled) return;
    var target = document.getElementById(btn.getAttribute("commandfor"));
    var cmd = (btn.getAttribute("command") || "").toLowerCase();
    if (!target || !target.showModal) return;
    if (cmd === "show-modal" && !target.open) target.showModal();
    else if ((cmd === "close" || cmd === "request-close") && target.open) target.close(btn.value || undefined);
  });
  if (!hasClosedBy) document.addEventListener("click", function (e) {
    var d = e.target;
    if (!d || d.tagName !== "DIALOG" || !d.open || d.getAttribute("closedby") !== "any") return;
    var r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });

  /* ---------- Dropdown Menu: keyboard and placement for .vin-menu[popover][data-vin-menu] ---------- */
  function initMenu(menu) {
    var trigger = document.querySelector('[popovertarget="' + menu.id + '"]');
    if (!trigger || !menu.showPopover) return;
    var side = menu.getAttribute("data-side") || "bottom", align = menu.getAttribute("data-align") || "start";
    var place = function () { placeFloating(menu, trigger, side, align, 4); };
    var focusLast = false;
    var items = function () {
      return Array.prototype.filter.call(menu.querySelectorAll('[role^="menuitem"]'), function (el) {
        return !el.disabled && el.getAttribute("aria-disabled") !== "true";
      });
    };
    var move = function (to) { var all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    menu.querySelectorAll('[role^="menuitem"]').forEach(function (el) { el.tabIndex = -1; });
    trigger.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      focusLast = e.key === "ArrowUp";
      if (!menu.matches(":popover-open")) menu.showPopover();
      else move(focusLast ? -1 : 0);
    });
    menu.addEventListener("toggle", function (e) {
      var open = e.newState === "open";
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        place(); window.addEventListener("scroll", place, true); window.addEventListener("resize", place);
        move(focusLast ? -1 : 0); focusLast = false;
      } else { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); }
    });
    var typed = "", typedAt = 0;
    menu.addEventListener("keydown", function (e) {
      var all = items(), at = all.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
      else if (e.key === "Home") { e.preventDefault(); move(0); }
      else if (e.key === "End") { e.preventDefault(); move(-1); }
      else if (e.key === "Tab") { e.preventDefault(); menu.hidePopover(); trigger.focus(); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") {
        var now = Date.now();
        typed = (now - typedAt > 600 ? "" : typed) + e.key.toLowerCase(); typedAt = now;
        // One letter jumps to the next match; a quick run of letters refines the current one.
        var start = typed.length > 1 ? Math.max(at, 0) : at + 1;
        for (var i = 0; i < all.length; i++) {
          var el = all[(start + i) % all.length];
          if (el.textContent.trim().toLowerCase().indexOf(typed) === 0) { el.focus(); break; }
        }
      }
    });
    menu.addEventListener("pointermove", function (e) {
      var item = e.target.closest && e.target.closest('[role^="menuitem"]');
      if (item && items().indexOf(item) >= 0 && document.activeElement !== item) item.focus({ preventScroll: true });
    });
    menu.addEventListener("click", function (e) {
      var item = e.target.closest && e.target.closest('[role^="menuitem"]');
      if (!item || items().indexOf(item) < 0) return;
      var role = item.getAttribute("role");
      if (role === "menuitemcheckbox") { item.setAttribute("aria-checked", item.getAttribute("aria-checked") === "true" ? "false" : "true"); return; }
      if (role === "menuitemradio") {
        var group = item.closest('[role="group"]') || menu;
        group.querySelectorAll('[role="menuitemradio"]').forEach(function (r) { r.setAttribute("aria-checked", r === item ? "true" : "false"); });
        return;
      }
      menu.hidePopover(); trigger.focus();
    });
  }

  /* ---------- Code Block: [data-vin-copy] copies the block's code (or data-vin-copy="#id"'s text) ---------- */
  function copyText(text, done) {
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove(); done(ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  function initCopy(btn) {
    var timer;
    btn.addEventListener("click", function () {
      var block = btn.closest(".vin-code-block");
      var sel = btn.getAttribute("data-vin-copy");
      var src = sel ? document.querySelector(sel) : block && block.querySelector(".vin-code-block__pre code, .vin-code-block__pre");
      if (!src) return;
      var lines = src.querySelectorAll(".vin-code-block__line");
      var text = "value" in src && src.tagName !== "BUTTON" ? src.value : lines.length
        ? Array.prototype.map.call(lines, function (l) { return l.textContent; }).join("\n")
        : src.textContent;
      copyText(text, function (ok) {
        var status = block && block.querySelector(".vin-code-block__status");
        clearTimeout(timer);
        if (ok) btn.setAttribute("data-copied", ""); else btn.removeAttribute("data-copied");
        if (status) status.textContent = ok ? "Copied" : "Couldn't copy";
        timer = setTimeout(function () { btn.removeAttribute("data-copied"); if (status) status.textContent = ""; }, 2000);
      });
    });
  }

  /* ---------- Carousel: buttons, dots and arrow keys scroll the snap track; out-of-view slides are inert ---------- */
  function reducedMotion(el) {
    if (el.closest('[data-vin-motion="off"], [data-vin-motion="reduced"]')) return true;
    return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) && !el.closest('[data-vin-motion="full"]');
  }
  function initCarousel(root) {
    var track = root.querySelector(".vin-carousel__track");
    if (!track) return;
    var slides = Array.prototype.filter.call(track.children, function (s) { return s.classList.contains("vin-carousel__slide"); });
    var prev = root.querySelector(".vin-carousel__prev"), next = root.querySelector(".vin-carousel__next");
    var dots = Array.prototype.slice.call(root.querySelectorAll(".vin-carousel__dot"));
    var current = 0, atStart = true, atEnd = false, frame = 0;
    var setDisabled = function (btn, off) { if (!btn) return; if (off) btn.setAttribute("aria-disabled", "true"); else btn.removeAttribute("aria-disabled"); };

    function measure() {
      var box = track.getBoundingClientRect(), first = -1;
      slides.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var shown = Math.min(r.right, box.right) - Math.max(r.left, box.left) >= r.width * 0.5 - 1;
        s.inert = !shown;
        if (shown && first < 0) first = i;
      });
      current = Math.max(first, 0);
      var max = track.scrollWidth - track.clientWidth, pos = Math.abs(track.scrollLeft);
      atStart = pos <= 1; atEnd = pos >= max - 1;
      setDisabled(prev, atStart); setDisabled(next, atEnd);
      dots.forEach(function (d, i) { if (i === current) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    }
    function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); }
    function goTo(i) {
      var slide = slides[Math.max(0, Math.min(slides.length - 1, i))];
      if (!slide) return;
      var box = track.getBoundingClientRect(), r = slide.getBoundingClientRect();
      var rtl = getComputedStyle(track).direction === "rtl";
      track.scrollBy({ left: rtl ? r.right - box.right : r.left - box.left, behavior: reducedMotion(track) ? "instant" : "smooth" });
    }
    function step(by) { if ((by < 0 && atStart) || (by > 0 && atEnd)) return; goTo(current + by); }

    track.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { goTo(i); }); });
    root.addEventListener("keydown", function (e) {
      if (e.defaultPrevented || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      if (e.target !== track && !e.target.closest(".vin-carousel__controls")) return;
      e.preventDefault();
      var rtl = getComputedStyle(root).direction === "rtl";
      step((e.key === "ArrowRight") !== rtl ? 1 : -1);
    });
    measure();
  }

  /* ---------- Chart: a tooltip for the category under the pointer or picked with the arrow keys ---------- */
  function initChart(root) {
    var svg = root.querySelector(".vin-chart__svg"), plot = root.querySelector(".vin-chart__plot");
    var rows = root.querySelectorAll(".vin-chart__table tbody tr");
    if (!svg || !plot || !rows.length) return;
    var names = Array.prototype.slice.call(root.querySelectorAll(".vin-chart__table thead th"), 1).map(function (th) { return th.textContent; });
    var colours = Array.prototype.map.call(svg.querySelectorAll(".vin-chart__series"), function (g) { return g.getAttribute("style") || ""; });
    var n = rows.length, active = null, tip = null;
    var el = function (tag, cls, text) { var e = document.createElement(tag); e.className = cls; if (text != null) e.textContent = text; return e; };

    function show(i) {
      if (i === null) {
        active = null; svg.removeAttribute("data-active");
        Array.prototype.forEach.call(svg.querySelectorAll("[data-active]"), function (e) { e.removeAttribute("data-active"); });
        if (tip) { tip.remove(); tip = null; }
        return;
      }
      i = Math.max(0, Math.min(n - 1, i));
      if (i === active) return;
      show(null); active = i;
      svg.setAttribute("data-active", "");
      Array.prototype.forEach.call(svg.querySelectorAll('[data-i="' + i + '"]'), function (e) { e.setAttribute("data-active", ""); });
      var cells = rows[i].children;
      tip = el("div", "vin-chart__tooltip"); tip.setAttribute("aria-hidden", "true");
      tip.appendChild(el("p", "vin-chart__tooltip-title", cells[0].textContent));
      names.forEach(function (name, s) {
        var row = el("div", "vin-chart__tooltip-row"), sw = el("span", "vin-chart__swatch");
        sw.setAttribute("style", colours[s] || "");
        row.appendChild(sw); row.appendChild(document.createTextNode(name));
        row.appendChild(el("span", "vin-chart__value", cells[s + 1] ? cells[s + 1].textContent : ""));
        tip.appendChild(row);
      });
      if (i < n / 2) tip.style.left = "calc(" + ((i + 1) / n) * 100 + "% + 8px)";
      else tip.style.right = "calc(" + (1 - i / n) * 100 + "% + 8px)";
      plot.appendChild(tip);
    }
    svg.addEventListener("pointermove", function (e) {
      var hit = e.target.closest && e.target.closest("[data-i]");
      if (hit) show(Number(hit.getAttribute("data-i")));
    });
    svg.addEventListener("pointerleave", function () { show(null); });
    svg.addEventListener("focus", function () { if (active === null) show(0); });
    svg.addEventListener("blur", function () { show(null); });
    svg.addEventListener("keydown", function (e) {
      var rtl = getComputedStyle(svg).direction === "rtl", at = active === null ? -1 : active;
      var to = { ArrowRight: rtl ? at - 1 : at + 1, ArrowLeft: rtl ? at + 1 : at - 1, ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: n - 1 }[e.key];
      if (e.key === "Escape") { e.preventDefault(); show(null); }
      else if (to !== undefined) { e.preventDefault(); show(to); }
    });
  }

  var KINDS = {
    "data-vin-tabs": initTabs, "data-vin-select": initSelect, "data-vin-toggle": initToggle, "data-vin-textarea": initTextarea,
    "data-vin-toggle-group": initToggleGroup, "data-vin-otp": initOtp, "data-vin-slider": initSlider, "data-vin-dismiss": initDismiss,
    "data-vin-tooltip": initTooltip, "data-vin-popover": initPopover, "data-vin-toast": initToastTrigger, "data-vin-menu": initMenu,
    "data-vin-copy": initCopy, "data-vin-carousel": initCarousel, "data-vin-chart": initChart,
  };

  /* ---------- Avatar: a picture that fails to load is hidden, so the initials show ---------- */
  function hideBroken(img) { img.hidden = true; }
  document.addEventListener("error", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("vin-avatar__img")) hideBroken(e.target);
  }, true);

  function init(scope) {
    scope = scope || document;
    Array.prototype.forEach.call(scope.querySelectorAll(".vin-avatar__img"), function (img) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) hideBroken(img);
    });
    Object.keys(KINDS).forEach(function (attr) {
      var found = Array.prototype.slice.call(scope.querySelectorAll("[" + attr + "]"));
      if (scope.hasAttribute && scope.hasAttribute(attr)) found.unshift(scope);
      found.forEach(function (el) {
        if (el._vinReady) return;
        el._vinReady = true;
        KINDS[attr](el);
      });
    });
  }

  window.VinUI = { init: init, toast: toast };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
  else init();
})();
