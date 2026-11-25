/*! VinUI behaviours | MIT | vinish.dev/ui
 * Adds keyboard and mouse behaviour to the HTML versions of the interactive components.
 * Include once, anywhere:  <script src="vinui.js" defer></script>
 * It finds elements with data-vin-tabs, -select, -combobox, -calendar, -date-picker, -context-menu, -drawer, -hover-card, -command, -toggle, -toggle-group, -textarea, -otp, -slider, -dismiss, -tooltip, -popover and -toast on load (and hides avatar pictures that fail to load). For markup added later, call VinUI.init(element).
 * Used by: Tabs, Select, Combobox, Calendar, Date Picker, Context Menu, Drawer (drag), Hover Card, Command, Toggle, Toggle Group, Textarea (count, auto-grow), Input OTP, Slider, Alert (close), Tooltip,
 * Popover (placement), Toast (VinUI.toast). Components that need no
 * JavaScript (Button, Checkbox, Radio Group, Switch, Native Select…) don't use it.
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
  /* Menu keys shared by Dropdown Menu and Context Menu: arrows, Home/End, type to jump, Tab closes. */
  function wireMenu(menu, back) {
    var items = function () {
      return Array.prototype.filter.call(menu.querySelectorAll('[role^="menuitem"]'), function (el) {
        return !el.disabled && el.getAttribute("aria-disabled") !== "true";
      });
    };
    var move = function (to) { var all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
    var close = function () { menu.hidePopover(); back(); };
    menu.querySelectorAll('[role^="menuitem"]').forEach(function (el) { el.tabIndex = -1; });
    var typed = "", typedAt = 0;
    menu.addEventListener("keydown", function (e) {
      var all = items(), at = all.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
      else if (e.key === "Home") { e.preventDefault(); move(0); }
      else if (e.key === "End") { e.preventDefault(); move(-1); }
      else if (e.key === "Tab") { e.preventDefault(); close(); }
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
      close();
    });
    return { move: move };
  }

  function initMenu(menu) {
    var trigger = document.querySelector('[popovertarget="' + menu.id + '"]');
    if (!trigger || !menu.showPopover) return;
    var side = menu.getAttribute("data-side") || "bottom", align = menu.getAttribute("data-align") || "start";
    var place = function () { placeFloating(menu, trigger, side, align, 4); };
    var focusLast = false;
    var m = wireMenu(menu, function () { trigger.focus(); });
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      focusLast = e.key === "ArrowUp";
      if (!menu.matches(":popover-open")) menu.showPopover();
      else m.move(focusLast ? -1 : 0);
    });
    menu.addEventListener("toggle", function (e) {
      var open = e.newState === "open";
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        place(); window.addEventListener("scroll", place, true); window.addEventListener("resize", place);
        m.move(focusLast ? -1 : 0); focusLast = false;
      } else { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); }
    });
  }

  /* ---------- Context Menu: a .vin-menu opened by right-click, long-press, or the Menu key / Shift+F10 ---------- */
  function initContextMenu(area) {
    var menu = document.getElementById(area.getAttribute("data-vin-context-menu"));
    if (!menu || !menu.showPopover) return;
    var m = wireMenu(menu, function () { area.focus({ preventScroll: true }); });
    function openAt(x, y) {
      if (menu.matches(":popover-open")) menu.hidePopover();
      menu.showPopover();
      var w = menu.offsetWidth, h = menu.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight, mg = 8;
      if (getComputedStyle(area).direction === "rtl") x -= w;
      menu.style.left = Math.max(mg, Math.min(x, vw - w - mg)) + "px";
      menu.style.top = Math.max(mg, Math.min(y, vh - h - mg)) + "px";
      m.move(0);
    }
    area.addEventListener("contextmenu", function (e) {
      if (e.shiftKey && e.button === 2) return; // Shift+right-click keeps the browser's own menu
      e.preventDefault();
      var r = area.getBoundingClientRect();
      // From the keyboard the event has no pointer position: open at the area's corner.
      if (!e.clientX && !e.clientY) openAt(r.left + 8, r.top + 8);
      else openAt(e.clientX, e.clientY);
    });
    // Not every browser turns Shift+F10 or the Menu key into a contextmenu event, so handle them here.
    area.addEventListener("keydown", function (e) {
      if (e.target !== area || !((e.key === "F10" && e.shiftKey) || e.key === "ContextMenu")) return;
      e.preventDefault();
      var r = area.getBoundingClientRect();
      openAt(r.left + 8, r.top + 8);
    });
    // iOS has no contextmenu event: a long press opens it.
    var timer;
    area.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "touch") return;
      timer = setTimeout(function () { openAt(e.clientX, e.clientY); }, 550);
    });
    ["pointerup", "pointercancel", "pointermove"].forEach(function (t) { area.addEventListener(t, function (e) { if (t !== "pointermove" || e.movementX * e.movementX + e.movementY * e.movementY > 25) clearTimeout(timer); }); });
    menu.addEventListener("toggle", function (e) {
      if (e.newState === "closed" && menu.contains(document.activeElement)) area.focus({ preventScroll: true });
    });
  }

  /* ---------- Drawer: a bottom Sheet you can drag down to close ---------- */
  function initDrawer(d) {
    var startY = 0, dy = 0, startT = 0, dragging = false;
    d.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || !d.open) return;
      var r = d.getBoundingClientRect();
      var inHeader = e.target.closest && e.target.closest(".vin-dialog__header");
      if (!inHeader && e.clientY - r.top > 28) return; // only the handle strip and the header drag
      if (e.target.closest && e.target.closest("button, a, input, textarea, select")) return;
      dragging = true; startY = e.clientY; startT = Date.now(); dy = 0;
      d.setPointerCapture(e.pointerId);
      d.style.transition = "none";
    });
    d.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      d.style.transform = "translateY(" + dy + "px)";
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      var fast = dy > 40 && dy / Math.max(1, Date.now() - startT) > 0.6;
      d.style.transition = "";
      d.style.transform = "";
      if (dy > Math.min(140, d.offsetHeight * 0.35) || fast) d.close();
    }
    d.addEventListener("pointerup", end);
    d.addEventListener("pointercancel", end);
  }

  /* ---------- Hover Card: a preview shown on hover (after a pause) or keyboard focus ---------- */
  function initHoverCard(trigger) {
    var card = document.getElementById(trigger.getAttribute("data-vin-hover-card"));
    if (!card || !card.showPopover) return;
    var side = card.getAttribute("data-side") || "bottom", showTimer, hideTimer;
    var isOpen = function () { return card.matches(":popover-open"); };
    var place = function () { placeFloating(card, trigger, side, "center", 8); };
    function show(delay) {
      clearTimeout(hideTimer); clearTimeout(showTimer);
      showTimer = setTimeout(function () {
        if (!isOpen()) card.showPopover();
        place();
        document.addEventListener("keydown", onKey, true);
      }, delay);
    }
    function hide(delay) {
      clearTimeout(showTimer); clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (isOpen()) card.hidePopover();
        document.removeEventListener("keydown", onKey, true);
      }, delay);
    }
    function onKey(e) { if (e.key === "Escape" && isOpen()) { e.stopPropagation(); hide(0); } }
    trigger.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") show(500); });
    trigger.addEventListener("pointerleave", function () { hide(300); });
    trigger.addEventListener("focus", function () { if (trigger.matches(":focus-visible")) show(0); });
    trigger.addEventListener("blur", function () { hide(150); });
    card.addEventListener("pointerenter", function () { clearTimeout(hideTimer); });
    card.addEventListener("pointerleave", function () { hide(300); });
    card.addEventListener("focusin", function () { clearTimeout(hideTimer); });
    card.addEventListener("focusout", function (e) { if (!card.contains(e.relatedTarget) && e.relatedTarget !== trigger) hide(150); });
  }

  /* ---------- Command: search-and-run palette, inline or in a dialog opened with ⌘K / Ctrl+K ---------- */
  function initCommand(root) {
    var input = root.querySelector(".vin-command__input");
    var list = root.querySelector('[role="listbox"]');
    var empty = root.querySelector(".vin-command__empty");
    if (!input || !list) return;
    var dialog = root.closest("dialog");
    var options = function () { return Array.prototype.slice.call(list.querySelectorAll('[role="option"]')); };
    var visible = function () { return options().filter(function (o) { return !o.hidden && o.getAttribute("aria-disabled") !== "true"; }); };
    var active = function () { return list.querySelector("[data-active]"); };
    function setActive(opt) {
      options().forEach(function (o) {
        var on = o === opt;
        o.toggleAttribute("data-active", on);
        o.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (opt) { input.setAttribute("aria-activedescendant", opt.id); opt.scrollIntoView({ block: "nearest" }); }
      else input.removeAttribute("aria-activedescendant");
    }
    function filter() {
      var q = fold(input.value.trim());
      options().forEach(function (o) {
        var hay = fold(o.textContent + " " + (o.getAttribute("data-keywords") || ""));
        o.hidden = !!q && q.split(/\s+/).some(function (w) { return hay.indexOf(w) < 0; });
      });
      Array.prototype.forEach.call(list.querySelectorAll(".vin-command__group"), function (g) {
        g.hidden = !g.querySelector('[role="option"]:not([hidden])');
      });
      Array.prototype.forEach.call(list.querySelectorAll(".vin-command__separator"), function (s) { s.hidden = !!q; });
      if (empty) empty.hidden = visible().length > 0;
      setActive(visible()[0]);
    }
    function run(opt) {
      if (!opt || opt.getAttribute("aria-disabled") === "true") return;
      var value = opt.getAttribute("data-value") || opt.textContent.trim();
      root.dispatchEvent(new CustomEvent("vin-command", { bubbles: true, detail: { value: value } }));
      if (dialog && dialog.open) dialog.close();
      var href = opt.getAttribute("data-href");
      if (href) location.href = href;
    }
    function move(step) {
      var all = visible(), i = all.indexOf(active());
      if (all.length) setActive(all[(i + step + all.length) % all.length]);
    }
    input.addEventListener("input", filter);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Home" && e.ctrlKey) { e.preventDefault(); setActive(visible()[0]); }
      else if (e.key === "End" && e.ctrlKey) { e.preventDefault(); var all = visible(); setActive(all[all.length - 1]); }
      else if (e.key === "Enter") { e.preventDefault(); run(active()); }
    });
    list.addEventListener("pointermove", function (e) {
      var opt = e.target.closest('[role="option"]');
      if (opt && !opt.hidden && opt.getAttribute("aria-disabled") !== "true" && opt !== active()) setActive(opt);
    });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    list.addEventListener("click", function (e) { run(e.target.closest('[role="option"]')); });
    if (dialog) {
      var key = (dialog.getAttribute("data-vin-shortcut") || "").toLowerCase();
      if (key) document.addEventListener("keydown", function (e) {
        if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === key) {
          e.preventDefault();
          if (dialog.open) dialog.close();
          else if (!document.querySelector("dialog[open]")) dialog.showModal(); // never on top of another dialog
        }
      });
      // Start fresh each time it opens.
      new MutationObserver(function () {
        if (dialog.open) { input.value = ""; filter(); input.focus(); }
      }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
    }
    filter();
  }

  /* ---------- Combobox: an input that filters a listbox (WAI-ARIA combobox, list autocomplete) ---------- */
  var fold = function (s) { return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); };
  function initCombobox(root) {
    var input = root.querySelector('[role="combobox"]');
    var list = input && document.getElementById(input.getAttribute("aria-controls"));
    var panel = list && (list.closest("[popover]") || list);
    var hidden = root.querySelector('input[type="hidden"]');
    var empty = root.querySelector(".vin-combobox__empty");
    if (!input || !list) return;
    var filtering = false;

    var options = function () { return Array.prototype.slice.call(list.querySelectorAll('[role="option"]')); };
    var visible = function () { return options().filter(function (o) { return !o.hidden && o.getAttribute("aria-disabled") !== "true"; }); };
    var selected = function () { return list.querySelector('[aria-selected="true"]'); };
    var active = function () { return list.querySelector("[data-active]"); };
    var isOpen = function () { return input.getAttribute("aria-expanded") === "true"; };

    function setActive(opt) {
      options().forEach(function (o) { o.toggleAttribute("data-active", o === opt); });
      if (opt) { input.setAttribute("aria-activedescendant", opt.id); opt.scrollIntoView({ block: "nearest" }); }
      else input.removeAttribute("aria-activedescendant");
    }
    function filter(query) {
      var q = fold(query.trim());
      options().forEach(function (o) { o.hidden = !!q && fold(o.textContent).indexOf(q) < 0; });
      Array.prototype.forEach.call(list.querySelectorAll(".vin-combobox__group"), function (g) {
        g.hidden = !g.querySelector('[role="option"]:not([hidden])');
      });
      if (empty) empty.hidden = options().some(function (o) { return !o.hidden; });
    }
    function place() {
      var r = input.getBoundingClientRect();
      panel.style.minWidth = r.width + "px";
      panel.style.left = r.left + "px";
      var below = window.innerHeight - r.bottom, h = panel.offsetHeight;
      panel.style.top = (below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4) + "px";
    }
    function open(which) {
      if (input.disabled) return;
      if (!isOpen()) {
        input.setAttribute("aria-expanded", "true");
        panel.showPopover ? panel.showPopover() : (panel.style.display = "block");
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
      }
      place();
      var all = visible(), sel = selected();
      setActive(which === "first" ? all[0] : which === "last" ? all[all.length - 1] : which === "none" ? null : sel && all.indexOf(sel) >= 0 ? sel : all[0]);
    }
    function close() {
      if (!isOpen()) return;
      input.setAttribute("aria-expanded", "false");
      panel.hidePopover ? panel.hidePopover() : (panel.style.display = "");
      setActive(null);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    }
    function restore() {
      var sel = selected();
      input.value = sel ? sel.textContent.trim() : "";
      filtering = false;
      filter("");
    }
    function choose(opt) {
      if (!opt || opt.getAttribute("aria-disabled") === "true") return;
      options().forEach(function (o) { o.setAttribute("aria-selected", o === opt ? "true" : "false"); });
      var value = opt.getAttribute("data-value") || opt.textContent.trim();
      if (hidden) hidden.value = value;
      restore();
      root.dispatchEvent(new CustomEvent("vin-change", { bubbles: true, detail: { value: value } }));
    }
    function clear() {
      options().forEach(function (o) { o.setAttribute("aria-selected", "false"); });
      if (hidden) hidden.value = "";
      restore();
      root.dispatchEvent(new CustomEvent("vin-change", { bubbles: true, detail: { value: "" } }));
    }
    function move(step) {
      var all = visible(), i = all.indexOf(active());
      setActive(all[i < 0 ? (step > 0 ? 0 : all.length - 1) : Math.min(all.length - 1, Math.max(0, i + step))]);
    }

    input.addEventListener("input", function () {
      filtering = true;
      filter(input.value);
      open("first");
    });
    input.addEventListener("click", function () { isOpen() ? close() : (filter(filtering ? input.value : ""), open()); });
    input.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        if (!isOpen()) { if (!filtering) filter(""); open(e.altKey ? "none" : k === "ArrowUp" ? "last" : undefined); }
        else if (!e.altKey) move(k === "ArrowDown" ? 1 : -1);
      } else if (!isOpen()) {
        if (k === "Escape" && input.value) { e.preventDefault(); clear(); }
        return;
      } else if (k === "PageDown" || k === "PageUp") { e.preventDefault(); move(k === "PageDown" ? 10 : -10); }
      else if (k === "Enter") { e.preventDefault(); if (active()) choose(active()); close(); }
      else if (k === "Escape") { e.preventDefault(); close(); restore(); }
      else if (k === "Tab") { if (active() && filtering) choose(active()); close(); }
    });
    input.addEventListener("blur", function () {
      setTimeout(function () { if (document.activeElement !== input) { close(); restore(); } }, 0);
    });
    panel.addEventListener("pointermove", function (e) {
      var opt = e.target.closest('[role="option"]');
      if (opt && opt.getAttribute("aria-disabled") !== "true" && opt !== active()) setActive(opt);
    });
    panel.addEventListener("mousedown", function (e) { e.preventDefault(); });
    panel.addEventListener("click", function (e) {
      var opt = e.target.closest('[role="option"]');
      if (!opt || opt.getAttribute("aria-disabled") === "true") return;
      choose(opt); close(); input.focus();
    });
    document.addEventListener("pointerdown", function (e) {
      if (isOpen() && !root.contains(e.target) && !panel.contains(e.target)) { close(); restore(); }
    }, true);
  }

  /* ---------- Calendar: month grid for a date or a range (WAI-ARIA date grid). Dates are YYYY-MM-DD ---------- */
  var cal = {
    pad: function (n) { return (n < 10 ? "0" : "") + n; },
    iso: function (d) { return d.getUTCFullYear() + "-" + cal.pad(d.getUTCMonth() + 1) + "-" + cal.pad(d.getUTCDate()); },
    parse: function (s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +(p[2] || 1))); },
    addDays: function (s, n) { var d = cal.parse(s); d.setUTCDate(d.getUTCDate() + n); return cal.iso(d); },
    addMonths: function (s, n) {
      var d = cal.parse(s), day = d.getUTCDate(), t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
      var last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
      t.setUTCDate(Math.min(day, last));
      return cal.iso(t);
    },
    today: function () { var n = new Date(); return n.getFullYear() + "-" + cal.pad(n.getMonth() + 1) + "-" + cal.pad(n.getDate()); },
  };
  function initCalendar(root) {
    var grid = root.querySelector(".vin-calendar__grid");
    var title = root.querySelector(".vin-calendar__title");
    if (!grid || !title) return;
    var range = root.getAttribute("data-mode") === "range";
    var weekStart = root.getAttribute("data-week-start") === "0" ? 0 : 1;
    var min = root.getAttribute("data-min"), max = root.getAttribute("data-max");
    var offDays = (root.getAttribute("data-disabled-days") || "").split(",").filter(Boolean).map(Number);
    var langEl = root.closest("[lang]"), locale = (langEl && langEl.getAttribute("lang")) || "en-US";
    var parts = (root.getAttribute("data-value") || "").split("/");
    var from = parts[0] || null, to = parts[1] || null;
    var month = root.getAttribute("data-month") || (from || cal.today()).slice(0, 7);
    var focusDate = null, today = cal.today();
    var F = function (o) { o.timeZone = "UTC"; return new Intl.DateTimeFormat(locale, o); };
    var fTitle = F({ month: "long", year: "numeric" }), fDay = F({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
    var fShort = F({ weekday: "short" }), fLong = F({ weekday: "long" });
    var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); };

    var off = function (d) { return (min && d < min) || (max && d > max) || offDays.indexOf(cal.parse(d).getUTCDay()) >= 0; };
    var inMonth = function (d) { return d.slice(0, 7) === month; };
    var selected = function (d) { return range ? !!from && (d === from || d === to || (!!to && d > from && d < to)) : d === from; };
    var band = function (d) {
      if (!range || !from || !to || from === to) return "";
      return d === from ? "start" : d === to ? "end" : d > from && d < to ? "middle" : "";
    };

    function render(focus) {
      var first = cal.parse(month + "-01");
      var start = cal.addDays(month + "-01", -((first.getUTCDay() - weekStart + 7) % 7));
      var tab = [focusDate, from, today, month + "-01"].filter(function (d) { return d && inMonth(d); })[0];
      title.textContent = fTitle.format(first);
      var head = "<tr>";
      for (var i = 0; i < 7; i++) {
        var wd = cal.parse("2024-01-" + cal.pad(7 + ((i + weekStart) % 7)));
        head += '<th scope="col" abbr="' + esc(fLong.format(wd)) + '">' + esc(fShort.format(wd)) + "</th>";
      }
      var body = "";
      for (var w = 0; w < 6; w++) {
        body += "<tr>";
        for (var c = 0; c < 7; c++) {
          var d = cal.addDays(start, w * 7 + c), b = band(d);
          body += '<td aria-selected="' + selected(d) + '"' + (b ? ' data-range="' + b + '"' : "") + ">" +
            '<button type="button" class="vin-calendar__day" tabindex="' + (d === tab ? 0 : -1) + '" data-date="' + d + '"' +
            (inMonth(d) ? "" : " data-outside") + ' aria-label="' + esc(fDay.format(cal.parse(d))) + '"' +
            (off(d) ? ' aria-disabled="true"' : "") + (d === today ? ' aria-current="date"' : "") + ">" + Number(d.slice(8)) + "</button></td>";
        }
        body += "</tr>";
      }
      grid.querySelector("thead").innerHTML = head;
      grid.querySelector("tbody").innerHTML = body;
      if (focus) { var btn = grid.querySelector('[data-date="' + tab + '"]'); if (btn) btn.focus(); }
    }
    function setMonth(m) { month = m; root.setAttribute("data-month", m); }
    function choose(d) {
      if (off(d)) return;
      if (!range) from = d;
      else if (!from || to) { from = d; to = null; }
      else if (d < from) { to = from; from = d; }
      else to = d;
      root.setAttribute("data-value", range ? from + "/" + (to || "") : from);
      focusDate = d;
      if (!inMonth(d)) setMonth(d.slice(0, 7));
      render(true);
      root.dispatchEvent(new CustomEvent("vin-change", { bubbles: true, detail: { value: range ? { from: from, to: to || undefined } : from } }));
    }

    Array.prototype.forEach.call(root.querySelectorAll(".vin-calendar__nav"), function (btn, i) {
      btn.addEventListener("click", function () { setMonth(cal.addMonths(month + "-01", i === 0 ? -1 : 1).slice(0, 7)); render(false); });
    });
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-date]");
      if (btn && grid.contains(btn)) choose(btn.getAttribute("data-date"));
    });
    grid.addEventListener("focusin", function (e) {
      var d = e.target.getAttribute && e.target.getAttribute("data-date");
      if (d && inMonth(d)) focusDate = d;
    });
    grid.addEventListener("keydown", function (e) {
      var btn = e.target.closest && e.target.closest("[data-date]");
      if (!btn) return;
      var d = btn.getAttribute("data-date"), rtl = getComputedStyle(grid).direction === "rtl";
      var dow = (cal.parse(d).getUTCDay() - weekStart + 7) % 7;
      var next = {
        ArrowRight: cal.addDays(d, rtl ? -1 : 1), ArrowLeft: cal.addDays(d, rtl ? 1 : -1), ArrowDown: cal.addDays(d, 7), ArrowUp: cal.addDays(d, -7),
        Home: cal.addDays(d, -dow), End: cal.addDays(d, 6 - dow),
        PageDown: cal.addMonths(d, e.shiftKey ? 12 : 1), PageUp: cal.addMonths(d, e.shiftKey ? -12 : -1),
      }[e.key];
      if (!next) return;
      e.preventDefault();
      focusDate = next;
      if (!inMonth(next)) setMonth(next.slice(0, 7));
      render(true);
    });
    render(false);
    root._vinCalendar = { focus: function () { render(true); } };
  }

  /* ---------- Date Picker: a button that opens a Calendar in a popover ---------- */
  function initDatePicker(root) {
    var trigger = root.querySelector("[popovertarget]");
    var pop = trigger && document.getElementById(trigger.getAttribute("popovertarget"));
    var calendar = pop && pop.querySelector(".vin-calendar");
    var out = root.querySelector(".vin-date-picker__value");
    var hidden = root.querySelector('input[type="hidden"]');
    if (!trigger || !pop || !calendar) return;
    if (!calendar._vinReady) { calendar._vinReady = true; initCalendar(calendar); }
    var langEl = root.closest("[lang]"), locale = (langEl && langEl.getAttribute("lang")) || "en-US";
    var fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    var fmtShort = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" });
    pop.addEventListener("toggle", function (e) {
      if (e.newState === "open" && calendar._vinCalendar) calendar._vinCalendar.focus();
    });
    calendar.addEventListener("vin-change", function (e) {
      e.stopPropagation();
      var v = e.detail.value, text, raw;
      if (typeof v === "string") { text = fmt.format(cal.parse(v)); raw = v; }
      else if (v.to) { text = (v.from.slice(0, 4) === v.to.slice(0, 4) ? fmtShort : fmt).format(cal.parse(v.from)) + " – " + fmt.format(cal.parse(v.to)); raw = v.from + "/" + v.to; }
      else return; // a range waits for its second day
      if (out) { out.textContent = text; out.removeAttribute("data-placeholder"); }
      if (hidden) hidden.value = raw;
      pop.hidePopover();
      trigger.focus();
      root.dispatchEvent(new CustomEvent("vin-change", { bubbles: true, detail: { value: v } }));
    });
  }

  var KINDS = {
    "data-vin-tabs": initTabs, "data-vin-select": initSelect, "data-vin-toggle": initToggle, "data-vin-textarea": initTextarea,
    "data-vin-toggle-group": initToggleGroup, "data-vin-otp": initOtp, "data-vin-slider": initSlider, "data-vin-dismiss": initDismiss,
    "data-vin-tooltip": initTooltip, "data-vin-popover": initPopover, "data-vin-toast": initToastTrigger, "data-vin-menu": initMenu,
    "data-vin-combobox": initCombobox, "data-vin-calendar": initCalendar, "data-vin-date-picker": initDatePicker,
    "data-vin-context-menu": initContextMenu, "data-vin-drawer": initDrawer, "data-vin-hover-card": initHoverCard, "data-vin-command": initCommand,
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
