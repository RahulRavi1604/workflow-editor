import Base from '../base/Base';
import ace from 'ace-builds';
import './modal.css';

export default class Modal extends Base {
  constructor(component) {
    super();
    var head = document.getElementsByTagName('head')[0];
    var theScript = document.createElement('script');
    theScript.type = 'text/javascript';
    theScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.2/ace.js';
    theScript.onload = this.initAce.bind(this);
    head.appendChild(theScript);
    this.component = component;
    this.editor = this.ce('div', {
      id: 'editor',
      keys: {
        innerHTML: "{}"
      }
    });
    this.getTabContent('display');
    this.modal;
  }

  initAce() {
    var editor = ace.edit(this.editor);
    editor.setOptions({
      "highlightActiveLine": false,
      "minLines": 20,
      "tabSize": 2
    });
    editor.getSession().on('change', function () {
      console.log(">>>>>>>>>>>>>>", editor.getSession().getValue(), this.component);
    });
  }

  open() {
    this.modal = this.ce('div', {
      class: 'modal',
    }, [this.ce('div', {
        style: 'position: absolute; top: 0; right: 0; width: 25px; height: 25px;',
        on: {
          click: this.close.bind(this)
        }
      }, this.ce('span', {
        style: 'color: black; cursor: pointer;',
        keys: {
          innerHTML: '&#11208;'
        }
      })),
      this.ce('div', {
        class: 'modal-title',
        keys: {
          innerHTML: this.component.type + ' Component'
        }
      }),
      this.ce('div', {
        class: 'tabs-container'
      }, [this.ce('div', {
          class: 'tab-headers'
        }, [this.ce('div', {
            class: 'tab-header active',
            ['data-tab']: 'display',
            on: {
              click: this.setTabContent.bind(this)
            }
          }, this.ce('span', {
            keys: {
              innerHTML: 'Display'
            }
          })),
          this.ce('div', {
            class: 'tab-header',
            ['data-tab']: 'custom',
            on: {
              click: this.setTabContent.bind(this)
            }
          }, this.ce('span', {
            keys: {
              innerHTML: 'Custom'
            }
          }))
        ]),
        this.ce('div', {
          class: 'tab-content'
        }, this.tabContent)
      ])
    ]);
    const timeout = setTimeout(() => {
      this.modal.style.width = '25%';
      clearTimeout(timeout)
    }, 1);
    return this.modal;
  }

  close() {
    this.modal.innerHTML = "";
    this.modal.style.width = 0;
    const timeout = setTimeout(() => {
      this.modal.remove();
      clearTimeout(timeout)
    }, 1000);
  }

  setTabContent(e) {
    this.tabContent.replaceWith(this.getTabContent(e.target.parentElement.dataset.tab));
    ace.edit(this.editor);
  }

  getTabContent(tab) {
    if (tab === 'display') {
      this.tabContent = this.ce('div', {}, [this.ce('div', {
          class: 'field'
        }, [
          this.ce('label', {
            keys: {
              innerHTML: 'Label'
            }
          }),
          this.ce('input', {
            on: {
              keyup: this.updateLabel.bind(this)
            },
            keys: {
              type: 'text',
              value: this.component.label
            }
          })
        ]),
        this.ce('div', {
          class: 'field'
        }, [this.ce('label', {
          class: 'data',
          keys: {
            innerHTML: 'Data'
          }
        }), this.editor])
      ]);
    } else {
      this.tabContent = this.ce('div', {
        class: 'under-construction',
        keys: {
          innerHTML: `I'm under construction (- _ -)`
        }
      });
    }
    return this.tabContent;
  }

  updateLabel(e) {
    const value = e.target.value || this.component.type;
    const child = document.getElementById(this.component.id).children[0].children[0];
    child.innerHTML = value;
    this.component.label = value;
    const event = new CustomEvent("componentUpdate", {
      detail: {
        component: {
          ...this.component
        }
      }
    });
    document.dispatchEvent(event);
  }
}
