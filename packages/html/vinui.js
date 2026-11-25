/*! VinUI behaviours | MIT | vinish.dev/ui
 * Adds keyboard and mouse behaviour to the HTML versions of the interactive components.
 * Include once, anywhere:  <script src="vinui.js" defer></script>
 * It finds elements with data-vin-tabs, -select, -toggle, -toggle-group, -textarea, -otp and -slider on load. For markup added later, call VinUI.init(element).
 * Used by: Tabs, Select, Toggle, Toggle Group, Textarea (count, auto-grow), Input OTP, Slider (fill). Components that need no
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

  var KINDS = {
    "data-vin-tabs": initTabs, "data-vin-select": initSelect, "data-vin-toggle": initToggle, "data-vin-textarea": initTextarea,
    "data-vin-toggle-group": initToggleGroup, "data-vin-otp": initOtp, "data-vin-slider": initSlider,
  };

  function init(scope) {
    scope = scope || document;
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

  window.VinUI = { init: init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
  else init();
})();
