if (typeof window.attach != 'undefined') {
  (function () {
    const atm = window.attach;
    const me = {
      debug: atm.debug || false,
      id: '',
      name: 'Custom - Insertar Botón Whatsapp',
      listeners: {
        onClickCloseModalRecentView: () => {
          atm.util.seekFor(
            '#whatsapp_chat_container',
            { tries: 10, delay: 100 },
            function (referenceEls) {
              let referenceEl = referenceEls[0];
              referenceEl.classList.add('hidden-recent-view');
            }
          );
        },
      },
      fn: {
        validateRecentViewModal: () => {
          return new Promise((resolve, reject) => {
            let modal = document.querySelector('#atm-modal-ficha-cel-focus');
            let exists = false;

            if (modal) {
              if (modal.style.display !== 'none') {
                exists = true;
              }
            }
            resolve(exists);
          });
        },
        getHeightDetailBottom: () => {
          return new Promise((resolve, reject) => {
            atm.util.seekFor(
              '.claroperupoc-claro-general-apps-0-x-product_detail_bottom, .buttons_navigation_content, .claroperu-claro-general-apps-0-x-product_detail_bottom',
              { tries: 35, delay: 150 },
              function (referenceEls) {
                const referenceEl = referenceEls[0];
                resolve(referenceEl.offsetHeight);
              },
              function () {
                resolve(115);
              }
            );
          });
        },
        insertCss: async (path) => {
          let css = [];

          let responsiveBottomStyle = `120px`;
          let bottomStyle = `110px`;

          if (/\/p$/.test(path) || /checkout/.test(path)) {
            let heightDetailBottom = await me.fn.getHeightDetailBottom();

            let bottomPositionWsContainer = heightDetailBottom + 15;

            responsiveBottomStyle = `${bottomPositionWsContainer}px`;
            bottomStyle = `${bottomPositionWsContainer}px`;
          } else {
            let existsRecentViewModal = await me.fn.validateRecentViewModal();

            if (existsRecentViewModal) {
              responsiveBottomStyle = '120px';
            } else {
              responsiveBottomStyle = '85px';
            }
            bottomStyle = '90px';
          }

          css.push(`#whatsapp_chat_container { 
              position: fixed; bottom: ${bottomStyle}; width: 50px; 
              height: 50px; right: 25px; z-index: 100; display: block;
            }`);
          css.push('#whatsapp_chat_container a { text-decoration: none; }');

          css.push('@media only screen and (max-width: 770px) {');
          css.push(
            `#whatsapp_chat_container { bottom: ${responsiveBottomStyle}; right: 18px; }`
          );
          css.push(
            '#whatsapp_chat_container.hidden-recent-view { bottom: 30px; }'
          );
          css.push('}');

          atm.util.appendCSS(css.join('\n'));
        },
        getUrlWhatsapp: (page) => {
          let wsHref = '';
          let path = window.location.pathname;

          let baseUrl = 'https://api.whatsapp.com/send/?phone=51991093638';

          let origin = page.replaceAll('&', '%26');
          origin = origin.replaceAll('=', '%3D');
          wsHref = `${baseUrl}&text=Hola!%20Necesito%20ayuda%20con%20mi%20compra${origin}`;
        },
        insertButton: async () => {
          try {
            let body = document.body;

            let page = window.location.href;
            let path = window.location.pathname;
            let wsHref = me.fn.getUrlWhatsapp(page);

            let template = `
              <div id="whatsapp_chat_container">
                <a target="_blank" class="imageElementLink" href="${wsHref}"></a>
              </div>`;

            let css = [];
            css.push(`#whatsapp_chat_container { display: none; }`);
            atm.util.appendCSS(css.join('\n'));

            if (wsHref) {
              body.insertAdjacentHTML('afterbegin', template);
            }

            me.fn.insertCss(path);

            wsIconFn().run();

            window.dataLayer.push({
              whatsappIconInserted: 'true',
            });
            window.dataLayer.push({
              event: 'atm.event.whatsappIconInserted',
            });
            atm.util.newGa4Event('button_view', {
              section: 'icono boton whatsapp',
            });
          } catch (error) {
            console.info('LOG: ', error);

            window.dataLayer.push({
              whatsappIconInserted: `false: ${error}`,
            });
          }
        },
      },
      run: function () {
        atm.util.seekFor(
          '#whatsapp_chat_container',
          { tries: 8, delay: 150 }, // validar si ya existe el botón
          function (referenceEls) {
            const referenceEL = referenceEls[0];
            const parent = referenceEL.parentNode;
            const referenceEliminated = parent.removeChild(referenceEL);

            if (referenceEliminated) {
              me.fn.insertButton();
            }
          },
          function () {
            me.fn.insertButton();
          }
        );

        atm.util.seekFor(
          '.atm-modal-ficha-cel-content .atm-modal-focus-close > span',
          { tries: 25, delay: 100 },
          function (btnCloseEls) {
            const btnClose = btnCloseEls[0];
            btnClose.removeEventListener(
              'click',
              me.listeners.onClickCloseModalRecentView
            );
            btnClose.addEventListener(
              'click',
              me.listeners.onClickCloseModalRecentView
            );
          }
        );
      },
    };
    return me;
  })().run();
}

const wsIconFn = function () {
  const atm = window.attach;
  const me = {
    debug: atm.debug || false,
    id: 'atm--change--ws--icon',
    name: 'custom - cambio de icono ws',
    data: {},
    fn: {
      templateMessage: () => {
        let template = `
            <div class="${me.id} animate__animated">
              <p> ¡Aquí estoy para ayudarte! </p>
              <img src="https://claroperupoc.vteximg.com.br/arquivos/icono_whatsapp2.png" alt="whatsapp"/>
            </div>
          `;

        return template;
      },
      templateOnlyIcon: () => {
        let template = `
            <div class="atm--ws--icon animate__animated animate__bounceInRight">
              <img src="https://claroperupoc.vteximg.com.br/arquivos/icono_whatsapp2.png" alt="whatsapp"/>
            </div>
          `;

        return template;
      },
      insertCss: () => {
        let css = [];
        let wrapper = `div.${me.id}`;

        css.push(`#whatsapp_chat_container a.imageElementLink.atm--change--icon--with--animation { 
            position: absolute; left: -155px; border-radius: 0!important;
          }`);
        css.push(`${wrapper} { 
            height: 45px !important; width: 200px; display: flex; 
            align-items: center; justify-content: space-around; 
            background-color: #4caf50; border-radius: 20px;
            padding-left: 10px; transition: width 0.5s, border-radius 0.5s;
          }`);
        css.push(
          `${wrapper} > p { margin: 0; font-size: 12px; color: #FFF; font-weight: 500; }`
        );
        css.push(`${wrapper} > img { height: 100%; }`);

        css.push(
          '.atm--ws--icon { height: 45px !important; width: 45px; border-radius: 50%; }'
        );
        css.push('.atm--ws--icon > img { height: 100%; width: 100%; }');
        // css.push('div[data-test="test-whatsapp-proactive"] { left: -220px; top: -100px; }');

        /* DESKTOP */
        css.push('@media only screen and (min-width: 768px){ ');
        css.push(`${wrapper} {  }`);
        css.push(
          `#whatsapp_chat_container a.imageElementLink.atm--change--icon--with--animation{ left: -150px; }`
        );
        css.push('}');

        atm.util.appendCSS(css.join('\n'));
      },
    },
    run: function () {
      const head = document.head;
      let animateCssLink = document.createElement('link');
      animateCssLink.rel = 'stylesheet';
      animateCssLink.href =
        'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
      head.appendChild(animateCssLink);

      atm.util.seekFor(
        '#whatsapp_chat_container a.imageElementLink',
        { tries: 50, delay: 100 },
        function (imgWsContainerEls) {
          const imgWsContainerEl = imgWsContainerEls[0];
          imgWsContainerEl.classList.add('atm--change--icon--with--animation');

          imgWsContainerEl.innerHTML = '';
          imgWsContainerEl.insertAdjacentHTML(
            'afterbegin',
            me.fn.templateMessage()
          );
          me.fn.insertCss();

          setTimeout(() => {
            const messageEl = document.querySelector(`.${me.id}`);
            messageEl.classList.add('animate__bounceOutRight');

            setTimeout(() => {
              imgWsContainerEl.classList.remove(
                'atm--change--icon--with--animation'
              );
              imgWsContainerEl.insertAdjacentHTML(
                'afterbegin',
                me.fn.templateOnlyIcon()
              );
            }, 400);
          }, 7000);
        }
      );
    },
  };
  return me;
};
