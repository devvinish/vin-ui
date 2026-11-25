/*! VinUI behaviours | MIT | vinish.dev/ui
 * Adds keyboard and mouse behaviour to the HTML versions of the interactive components.
 * Include once, anywhere:  <script src="vinui.js" defer></script>
 * It finds elements with data-vin-tabs, -select, -toggle and -textarea on load. For markup added later, call VinUI.init(element).
 * Used by: Tabs, Select, Toggle, Textarea (count and auto-grow). Components that need no
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

  var KINDS = { "data-vin-tabs": initTabs, "data-vin-select": initSelect, "data-vin-toggle": initToggle, "data-vin-textarea": initTextarea };

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
