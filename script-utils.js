// Etiqueta 🏷️
// Estado⌛: Iniciado ✅
window.attach = (function () {
  var me = {
    debug: false,
    data: {
      defaults: {},
      ga: {
        sendEventsOnDebugMode: false,
      },
    },
    util: {
      gaEvent: function (category, action, label, nonInteraction, dimensions) {
        window.dataLayer = window.dataLayer || [];
        var eventData = {
          event: 'atm.event',
          eventCategory: category,
          eventAction: action,
          eventLabel: label,
          nonInteraction: nonInteraction || 0,
        };
        if (typeof dimensions === 'object') {
          var keys = Object.keys(dimensions);
          for (var i = 0; i < keys.length; i += 1) {
            if (Object.prototype.hasOwnProperty.call(dimensions, keys[i])) {
              eventData[keys[i]] = dimensions[keys[i]];
            }
          }
        }
        me.debug && me.util.log('GA Event Data: ', eventData);
        (!me.debug || me.data.ga.sendEventsOnDebugMode) &&
          window.dataLayer.push(eventData);
      },
      ga4Event: async (eventName, dimensions) => {
        window.dataLayer = window.dataLayer || [];

        let eventData = { event: 'atm.ga4.event', event_name: eventName };
        if (typeof dimensions === 'object') {
          let keys = Object.keys(dimensions);
          for (let i = 0; i < keys.length; i += 1) {
            if (Object.prototype.hasOwnProperty.call(dimensions, keys[i])) {
              eventData[keys[i]] = dimensions[keys[i]];
            }
          }

          if (!eventData['tipo_de_negocio']) {
            eventData['tipo_de_negocio'] = await me.fn.getBusinessOption();
          }
        }
        me.debug && me.util.log('GA Event Data: ', eventData);

        if (eventData.event_name) {
          window.dataLayer.push(eventData);
        }
      },
      newGa4Event: (eventName = '', dimensions = {}) => {
        let minDimensions = ['section'];
        let haveMinDimensions = minDimensions.every((minD) =>
          Object.keys(dimensions).includes(minD)
        );

        if (!haveMinDimensions) {
          me.util.log(
            `El evento ${eventName} debe tener el minimo de dimensiones`
          );
          return;
        }

        let eventData = {
          event: 'atm.ga4.event',
          event_name: eventName,
          event_data: dimensions,
        };

        window.dataLayer.push({
          event_data: null,
        });

        window.dataLayer.push(eventData);
      },
      getGa4EventName: (category, action = 'click') => {
        if (category !== '') {
          let categoryWithoutSpaces = me.util.convertTextToGa4(category);
          let actionWithoutSpaces = me.util.convertTextToGa4(action);
          let newCategory = `${categoryWithoutSpaces}${
            actionWithoutSpaces && `_`
          }${actionWithoutSpaces}`.toLowerCase();

          return newCategory;
        } else {
          return 'unknown_category';
        }
      },
      convertTextToGa4: (text) => {
        if (text) {
          let textCleaned = text.replaceAll(' ', '_');
          textCleaned = textCleaned.replaceAll('-', '');
          textCleaned = textCleaned.replaceAll('__', '_');

          return textCleaned.toLowerCase().trim();
        } else if (text === '') {
          return text;
        }
      },
      gaEcommerce: function (action, label, ecommerce) {
        window.dataLayer = window.dataLayer || [];
        var eventData = {
          event: 'atm.ecommerce',
          eventCategory: 'Ecommerce',
          nonInteraction: 1,
        };
        if (action) {
          eventData.eventAction = action;
        }
        if (label) {
          eventData.eventLabel = label;
        }
        if (typeof ecommerce == 'object') {
          eventData.ecommerce = ecommerce;
        }
        if (typeof eventData.ecommerce != 'undefined') {
          me.debug && me.util.log('GA Ecommerce Data: ', eventData);
          (!me.debug || me.data.ga.sendEventsOnDebugMode) &&
            window.dataLayer.push(eventData);
        }
      },
      appendCSS: function (css) {
        document.head.insertAdjacentHTML(
          'beforeend',
          '<style type="text/css">\n' + css + '\n</style>'
        );
      },
      labelize: function (str, asLower, except) {
        str = str || '';
        except = except || '';
        if (asLower) {
          str = str.toLowerCase();
        }
        var label = '';
        var ACCENTS =
          'àáâãäåòóôõöøèéêëðçìíîïùúûüñšÿýžÀÁÂÃÄÅÒÓÔÕÖØÈÉÊËÐÇÌÍÎÏÙÚÛÜÑŠŸÝŽ';
        var NON_ACCENTS =
          'aaaaaaooooooeeeeeciiiiuuuunsyyzAAAAAAOOOOOOEEEEECIIIIUUUUNSYYZ';
        var strChars = (str || '').split('');
        var labelChars = [];
        for (var i = 0; i < strChars.length; i++) {
          var index = ACCENTS.indexOf(strChars[i]);
          labelChars.push(
            index != -1 ? NON_ACCENTS.substr(index, 1) : strChars[i]
          );
        }
        label = labelChars.join('');
        if (except != '') {
          except = except
            .split('')
            .map(function (c) {
              return '\\' + c;
            })
            .join('');
        }
        label = label.replace(new RegExp('[^\\wa' + except + ']+', 'g'), ' ');
        label = label
          .replace(/\s+/g, ' ')
          .replace(/^\s+/, '')
          .replace(/\s+$/, '');
        return label;
      },
      seekFor: function (selector, config, callback, fallback) {
        window.seeker = window.seeker || {
          for: {},
          defaults: { tries: 20, delay: 500 },
        };
        var customConfig = config || {};
        var instanceConfig = {
          tries: customConfig.tries || window.seeker.defaults.tries,
          delay: customConfig.delay || window.seeker.defaults.delay,
        };
        var id = selector
          .replace(/[^a-zA-Z0-9]/g, ' ')
          .trim()
          .replace(/\s+/g, '_')
          .toLowerCase();
        if (window.seeker.for[id] != null) {
          clearInterval(window.seeker.for[id].instance);
        }
        window.seeker.for[id] = {
          triesLeft: instanceConfig.tries,
          instance: null,
        };
        window.seeker.for[id].instance = setInterval(function () {
          if (window.seeker.for[id].triesLeft > 0) {
            window.seeker.for[id].triesLeft -= 1;
            var foundEls = document.querySelectorAll(selector);
            if (foundEls && foundEls.length > 0) {
              clearInterval(window.seeker.for[id].instance);
              if (typeof callback === 'function') {
                callback(foundEls);
              }
              me.debug &&
                me.util.log(
                  '"' +
                    selector +
                    '" found after ' +
                    (instanceConfig.tries - window.seeker.for[id].triesLeft) +
                    ' attempts.'
                );
            } else {
              // me.debug && me.util.log('Looking for "' + selector + '". ' + window.seeker.for[id].triesLeft + ' attempts remaining.');
            }
          } else {
            clearInterval(window.seeker.for[id].instance);
            if (typeof fallback === 'function') {
              me.debug && me.util.log('"' + selector + '" not found!');
              fallback();
            }
          }
        }, instanceConfig.delay);
      },
      generateUniqueId: function () {
        return (
          Date.now().toString(32) + '-' + Math.random().toString(18).slice(2)
        );
      },
      recoverNativeMethodFor: function (el, method) {
        if (
          typeof el[method] == 'undefined' ||
          !el[method].toString().match(/\{\s*\[native code\]\s*\}/)
        ) {
          var frame = document.createElement('iframe');
          document.body.appendChild(frame);
          el[method] = frame.contentWindow.Element.prototype[method];
          setTimeout(function () {
            frame.remove();
          }, 10);
        }
        return el;
      },
      observeForTextContentChange: function (els, callback) {
        if (typeof MutationObserver != 'undefined') {
          var observer = new MutationObserver(function (mut, obs) {
            var targetNode = mut[0].target;
            var observedEl = (
              targetNode instanceof HTMLElement
                ? targetNode
                : targetNode.parentElement
            ).closest('[data-latest-content]');
            if (observedEl) {
              var oldVal = observedEl.getAttribute('data-latest-content');
              var newVal = btoa(observedEl.textContent.replace(/\s+/g, ' '));
              if (newVal != oldVal) {
                if (typeof callback == 'function') {
                  callback(observedEl, newVal, oldVal);
                }
                observedEl.setAttribute('data-latest-content', newVal);
              }
            }
          });
          var initObserverFor = function (el) {
            el.setAttribute(
              'data-latest-content',
              btoa(el.textContent.replace(/\s+/g, ' '))
            );
            observer.observe(el, {
              attributes: false,
              childList: true,
              subtree: true,
              characterDataOldValue: true,
              characterData: true,
            });
          };
          if (els instanceof NodeList) {
            for (var i = 0; i < els.length; i++) {
              initObserverFor(els[i]);
            }
          } else if (els instanceof Node) {
            initObserverFor(els);
          }
        }
      },
      addScript: function (url, callback) {
        var script = document.createElement('script');
        var done = false;
        var onChange = function () {
          if (
            !done &&
            (!this.readyState ||
              this.readyState === 'loaded' ||
              this.readyState === 'complete')
          ) {
            done = true;
            if (callback && typeof callback === 'function') {
              setTimeout(callback, 20);
            }
            script.onload = null;
            script.onreadystatechange = null;
          }
        };
        script.onload = onChange;
        script.onreadystatechange = onChange;
        script.src =
          url +
          (/\?/.test(url) ? '&' : '?') +
          'nc=' +
          new Date().toISOString().substr(0, 13);
        document.head.appendChild(script);
      },
      log: function () {
        var printLog = /\{\s*\[native code\]\s*\}/.test(console.log.toString())
          ? console.log
          : /\{\s*\[native code\]\s*\}/.test(console.info.toString())
          ? console.info
          : console.warn;
        var args = Array.prototype.slice.call(arguments);
        args.splice(
          0,
          0,
          '%cATTACH Log:',
          'background-color:#2F7DE1; color: #FFF; padding: 4px 8px; border-radius: 2px; font-size:12px; font-weight: 600;'
        );
        printLog.apply(null, args);
      },
      removeElement: function (element) {
        let parentElement = element.parentElement;
        let elementRemoved =
          parentElement && parentElement.removeChild(element);

        return elementRemoved;
      },
    },
    fn: {
      isVisible: function (el) {
        var visible = true;
        if (!el) {
          visible = false;
        } else if (
          !(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
        ) {
          visible = false;
        } else {
          var computed = window.getComputedStyle(el, null);
          if (!computed) {
            visible = false;
          } else if (computed.display === 'none') {
            visible = false;
          } else if (computed.visibility === 'hidden') {
            visible = false;
          } else if (parseFloat(computed.opacity) === 0.0) {
            visible = false;
          }
        }
        return visible;
      },
      getBusinessOption: () => {
        return new Promise((resolve, reject) => {
          me.util.seekFor(
            'nav .claroperupoc-claro-general-apps-0-x-link_element_active',
            { tries: 10, delay: 100 },
            function (nameBusinessEls) {
              let nameBusiness = '';
              nameBusiness = me.util.labelize(
                nameBusinessEls[0].innerText,
                true
              );
              resolve(nameBusiness);
            },
            function () {
              const path = location.pathname;

              if (path.includes('negocios')) {
                resolve('negocios');
              } else {
                resolve('personas');
              }
            }
          );
        });
      },
      addRequiredCSS: function () {
        var css = [];
        css.push('[data-tagged] { }');
        css.push(
          '[data-clone-id] { display: none !important; opacity: 0 !important; visibility: hidden !important; }'
        );
        css.push(
          '[data-disabled] { opacity: 0.3 !important; pointer-events: none !important; }'
        );
        me.util.appendCSS(css.join('\n'));
      },
    },
    listeners: {
      onTaggedElementClick: function (evt) {
        var sender = evt.currentTarget || evt.target;
        sender.setAttribute('data-disabled', 'true');
        me.debug && me.util.log('disabling sender:', sender);
        var clonedFor = sender.getAttribute('data-cloned-for') || '';
        if (clonedFor != '') {
          evt.preventDefault();
        }
        var category = sender.getAttribute('data-event-category') || '';
        var action = sender.getAttribute('data-event-action') || 'click';
        var label =
          sender.getAttribute('data-event-label') ||
          me.util.labelize(sender.innerText || sender.textContent, true);
        var ga4Act = sender.getAttribute('data-ga4-act') || '';
        var dimensions = me.methods.getCommonDimensions();
        var senderDimensionsStr = decodeURI(
          sender.getAttribute('data-event-dimensions') || ''
        );
        if (senderDimensionsStr != '') {
          try {
            var senderDimensions = JSON.parse(senderDimensionsStr);
            var keys = Object.keys(senderDimensions);
            for (var i = 0; i < keys.length; i += 1) {
              if (
                Object.prototype.hasOwnProperty.call(senderDimensions, keys[i])
              ) {
                dimensions[keys[i]] = senderDimensions[keys[i]];
              }
            }
          } catch (error) {
            me.debug && me.util.log(error);
          }
        }
        if (category != '' && action != '' && label != '') {
          me.util.gaEvent(category, action, label, 0, dimensions);

          if (ga4Act !== '') {
            let eventName = me.util.getGa4EventName(category, action);
            me.util.ga4Event(eventName, { opcion: label });
          }
        }

        if (clonedFor != '') {
          var clonedEl = document.querySelector(
            '[data-clone-id="' + clonedFor + '"]'
          );
          if (clonedEl) {
            setTimeout(function () {
              if (
                clonedEl.matches('a[href]') &&
                typeof clonedEl.click == 'function'
              ) {
                clonedEl.click();
              } else {
                clonedEl.dispatchEvent(new Event('click'));
              }
              me.debug &&
                me.util.log('dispatching click event for clonedEl:', clonedEl);
              sender.removeAttribute('data-disabled');
              me.debug && me.util.log('enabling sender:', sender);
            }, 100);
          }
        } else {
          sender.removeAttribute('data-disabled');
          me.debug && me.util.log('enabling sender:', sender);
        }
      },
      onTaggedElementFocus: function (evt) {
        var sender = evt.target;
        if (!sender.matches('[data-focused="true"]')) {
          sender.setAttribute('data-focused', 'true');

          var category = sender.getAttribute('data-event-category') || '';
          var action = sender.getAttribute('data-event-action') || 'focus';
          var label =
            sender.getAttribute('data-event-label') ||
            me.util.labelize(sender.innerText || sender.textContent, true);
          var dimensions = me.methods.getCommonDimensions();
          var senderDimensionsStr = decodeURI(
            sender.getAttribute('data-event-dimensions') || ''
          );
          if (senderDimensionsStr != '') {
            try {
              var senderDimensions = JSON.parse(senderDimensionsStr);
              var keys = Object.keys(senderDimensions);
              for (var i = 0; i < keys.length; i += 1) {
                if (
                  Object.prototype.hasOwnProperty.call(
                    senderDimensions,
                    keys[i]
                  )
                ) {
                  dimensions[keys[i]] = senderDimensions[keys[i]];
                }
              }
            } catch (error) {
              me.debug && me.util.log(error);
            }
          }
          if (category != '' && action != '' && label != '') {
            me.util.gaEvent(category, action, label, 1, dimensions);
          }
        }
      },
      onGa4DefaultEvent: (e) => {
        let sender = e.currentTarget;
        let eventName = me.util.getGa4EventName(
          sender.getAttribute('data-event-category'),
          sender.getAttribute('data-event-action')
        );
        let option = sender.getAttribute('data-event-label') || 'unknown';
        let nameParameter =
          me.util.convertTextToGa4(
            sender.getAttribute('data-event-unique-parameter-name')
          ) || 'opcion';
        let objectParameters = {};
        objectParameters[nameParameter] = option;

        me.util.ga4Event(eventName, objectParameters);
      },
      onClickTaggedElement: (e) => {
        let sender = e.currentTarget;
        let eventName = sender.getAttribute('data-event-name');
        let section = sender.getAttribute('data-event-section');
        let option = sender.getAttribute('data-event-option');

        let dimensions = {
          section,
          option,
        };

        let description = sender.getAttribute('data-event-description');
        let index = sender.getAttribute('data-event-index');
        let subSection = sender.getAttribute('data-event-subsection');

        description && (dimensions['description'] = description);
        index && (dimensions['item_index'] = parseInt(index) + 1);
        subSection && (dimensions['sub_section'] = subSection);

        me.util.newGa4Event(eventName, dimensions);
      },
    },
    methods: {
      getCommonDimensions: function () {
        return {
          userId: document.ENV_USER_ID || '',
          inicioSesion:
            (window.localStorage.getItem('user') || '') != '' ? 'si' : 'no',
        };
      },
      applyCommonTagging: function (el, data, eventName, settings) {
        if (el && el instanceof HTMLElement) {
          data = data || {};
          eventName = eventName || 'click';

          var customSettings = settings || {};
          var instanceSettings = {
            clone:
              typeof customSettings.clone == 'boolean'
                ? customSettings.clone
                : false,
          };

          var taggingEl = null;

          if (eventName == 'click') {
            if (instanceSettings.clone) {
              var cloneId = me.util.generateUniqueId();
              taggingEl = el.cloneNode(true);
              taggingEl.removeAttribute('id');
              taggingEl.removeAttribute('onclick');
              taggingEl.removeAttribute('href');
              el.setAttribute('data-clone-id', cloneId);
              taggingEl.setAttribute('data-cloned-for', cloneId);
              el.setAttribute('style', 'display: none !important;');
              el.insertAdjacentElement('beforebegin', taggingEl);
            } else {
              taggingEl = el;
            }
          } else if (eventName == 'focus') {
            taggingEl = el;
          }

          taggingEl.setAttribute(
            'data-event-category',
            data.eventCategory || ''
          );
          taggingEl.setAttribute('data-event-action', data.eventAction || '');
          taggingEl.setAttribute('data-event-label', data.eventLabel || '');
          taggingEl.setAttribute('data-ga4-act', data.ga4Act || '');
          if (data.dimensions && typeof data.dimensions == 'object') {
            taggingEl.setAttribute(
              'data-event-dimensions',
              encodeURI(JSON.stringify(data.dimensions))
            );
          }

          if (eventName == 'click') {
            taggingEl.removeEventListener(
              'click',
              me.listeners.onTaggedElementClick,
              true
            );
            taggingEl.addEventListener(
              'click',
              me.listeners.onTaggedElementClick,
              true
            );
          } else if (eventName == 'focus') {
            taggingEl.removeEventListener(
              'focus',
              me.listeners.onTaggedElementFocus,
              true
            );
            taggingEl.addEventListener(
              'focus',
              me.listeners.onTaggedElementFocus,
              true
            );
          }

          taggingEl.setAttribute('data-tagged', 'true');
        }
      },
      ga4ApplyCommonTagging: (
        el,
        data = {},
        ga4EventName,
        eventName = 'click'
      ) => {
        if (!el || !el instanceof HTMLElement) {
          me.util.log("'el' debe ser un elemento HTML");
          return;
        }

        el.setAttribute('data-event-name', ga4EventName);
        el.setAttribute('data-event-section', data.section);
        el.setAttribute('data-event-option', data.option);

        data.itemIndex && el.setAttribute('data-event-index', data.itemIndex);
        data.description &&
          el.setAttribute('data-event-description', data.description);
        data.subSection &&
          el.setAttribute('data-event-subsection', data.subSection);

        if (eventName === 'click') {
          el.removeEventListener(eventName, me.listeners.onClickTaggedElement);
          el.addEventListener(eventName, me.listeners.onClickTaggedElement);
        }
      },
    },
    polyfills: {
      install: function () {
        /* Matches and Closest */
        if (!Element.prototype.matches) {
          Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
              var matches = (
                  this.document || this.ownerDocument
                ).querySelectorAll(s),
                i = matches.length;
              while (--i >= 0 && matches.item(i) !== this) {}
              return i > -1;
            };
        }
        if (!Element.prototype.closest) {
          Element.prototype.closest = function (s) {
            var el = this;
            do {
              if (el.matches(s)) return el;
              el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
          };
        }
      },
    },
    init: function () {
      /* Install Polyfills */
      me.polyfills.install();

      /* Add Required CSS */
      me.fn.addRequiredCSS();

      /* Dispatch Event */
      window.dispatchEvent(new CustomEvent('attachload', { detail: {} }));

      dataLayer.push({
        event: 'atm.event.ready',
      });
    },
  };
  return me;
})();
window.attach.init();
