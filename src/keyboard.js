// eslint-disable-next-line import/extensions

import buttonsKey from './buttonsKey.js';

const english = 'en';
const russian = 'ru';
const nMode = 'normal';
const sMode = 'shifted';
const storedLanguageItem = 'keyboardLang';


class Keyboard {
  constructor() {
    this.lang = localStorage.getItem(storedLanguageItem) || english;
    this.capitalisation = nMode;
    this.capslocked = false;
  }

  addButtons() {
    const fragment = document.createDocumentFragment();
    const keyCodes = Object.keys(buttonsKey);
    keyCodes.forEach((key) => {
      const button = document.createElement('div');
      button.textContent = buttonsKey[key].key[this.capitalisation][this.lang];
      button.classList.add('button-keyboard');
      button.classList.add(`button-keyboard_width_${buttonsKey[key].width}`);
      button.dataset.code = key;
      fragment.appendChild(button);
    });

    return fragment;
  }

  switchLanguage() {
    this.lang = this.lang === english ? russian : english;
  }

  shiftCapitalisation() {
    this.capitalisation = this.capitalisation === nMode ? sMode : nMode;
  }

  toggleCapslock() {
    this.capslocked = !this.capslocked;
  }

  drawButtons() {
    const keyboardButtons = document.querySelectorAll('.button-keyboard');
    for (let i = 0; i < keyboardButtons.length; i += 1) {
      keyboardButtons[i].textContent = buttonsKey[keyboardButtons[i].dataset.code]
        .key[this.capitalisation][this.lang];
    }
  }

  init() {
    const wrapperBox = document.createElement('div');
    wrapperBox.classList.add('wrapperBox');
    const textarea = document.createElement('textarea');
    textarea.classList.add('textarea');
    wrapperBox.appendChild(textarea);
    const keyboard = document.createElement('div');
    keyboard.classList.add('keyboard');
    const info = document.createElement('div');
    info.innerHTML = '<div class="info__hint"><p>Switch language combo: <span>alt</span> + <span>shift</span></p></div>'
      + '<div class="info__os"><p>Anni Beruashvili<p></div>';
    info.classList.add('info');
    wrapperBox.appendChild(keyboard);
    keyboard.appendChild(this.addButtons());
    wrapperBox.appendChild(info);
    document.body.appendChild(wrapperBox);
    const shiftKeys = document.querySelectorAll('[data-code*="Shift');
    const capslockKey = document.querySelector('[data-code="CapsLock"');
    capslockKey.classList.add('button-keyboard_capslock');

    document.addEventListener('keydown', (evt) => {
      if (buttonsKey[evt.code]) {
        evt.preventDefault();
        if ((evt.code === 'ShiftLeft' || evt.code === 'ShiftRight')) {
          if (!Array.from(shiftKeys).some((element) => element.classList.contains('button-keyboard_active'))) {
            this.shiftCapitalisation();
          }

          this.drawButtons();
        }

        document.querySelector(`[data-code="${evt.code}"]`).classList.add('button-keyboard_active');
        const startPosition = textarea.selectionStart;
        const indent = '\t';
        const lineBreak = '\n';

        if (buttonsKey[evt.code].type === 'print') {
          if (startPosition === textarea.selectionEnd) {
            textarea.value = textarea.value.slice(0, startPosition)
              + buttonsKey[evt.code].key[this.capitalisation][this.lang]
              + textarea.value.slice(textarea.selectionStart);
          } else {
            textarea.setRangeText(buttonsKey[evt.code].key[this.capitalisation][this.lang]);
          }
          textarea.selectionStart = startPosition + 1;
          textarea.selectionEnd = textarea.selectionStart;
        } else if (buttonsKey[evt.code].type === 'func') {
          switch (evt.code) {
            case 'Backspace':
              if (startPosition === textarea.selectionEnd) {
                if (startPosition > 0) {
                  textarea.value = textarea.value.slice(0, startPosition - 1)
                    + textarea.value.slice(startPosition);
                  textarea.selectionStart = startPosition - 1;
                  textarea.selectionEnd = textarea.selectionStart;
                }
              } else {
                textarea.setRangeText('');
              }
              break;
            case 'Delete':
              if (startPosition === textarea.selectionEnd) {
                if (startPosition < textarea.value.length) {
                  textarea.value = textarea.value.slice(0, startPosition)
                    + textarea.value.slice(startPosition + 1);
                  textarea.selectionStart = startPosition;
                  textarea.selectionEnd = textarea.selectionStart;
                }
              } else {
                textarea.setRangeText('');
              }
              break;
            case 'Tab':
              if (startPosition === textarea.selectionEnd) {
                textarea.value = textarea.value.slice(0, startPosition)
                  + indent
                  + textarea.value.slice(textarea.selectionStart);
              } else {
                textarea.setRangeText(indent);
              }
              textarea.selectionStart = startPosition + 1;
              textarea.selectionEnd = textarea.selectionStart;
              break;
            case 'Enter':
              if (startPosition === textarea.selectionEnd) {
                textarea.value = textarea.value.slice(0, startPosition)
                  + lineBreak
                  + textarea.value.slice(textarea.selectionStart);
              } else {
                textarea.setRangeText(lineBreak);
              }
              textarea.selectionStart = startPosition + 1;
              textarea.selectionEnd = textarea.selectionStart;
              break;
            default:
              break;
          }
        }
      }
    });

    document.addEventListener('keyup', (evt) => {
      if (buttonsKey[evt.code]) {
        evt.preventDefault();
        document.querySelector(`[data-code="${evt.code}"]`).classList.remove('button-keyboard_active');

        if (evt.code === 'ShiftLeft' || evt.code === 'ShiftRight') {
          this.shiftCapitalisation();
          this.drawButtons();

          if (evt.altKey) {
            this.switchLanguage();
            this.drawButtons();
          }
        }

        if (evt.code === 'AltLeft' || evt.code === 'AltRight') {
          if (evt.shiftKey) {
            this.switchLanguage();
            this.drawButtons();
          }
        }

        if (evt.code === 'CapsLock') {
          this.shiftCapitalisation();
          this.drawButtons();
          this.toggleCapslock();
          capslockKey.classList.toggle('button-keyboard_capslock_active');
        }
      }
    });

    const mouseDownHandler = (evt) => {
      if (evt.target.classList.contains('button-keyboard')) {
        document.dispatchEvent(new KeyboardEvent('keydown', {code: evt.target.dataset.code}));
      }
    };

    const mouseOffHandler = (evt) => {
      document.dispatchEvent(new KeyboardEvent('keyup', {code: evt.target.dataset.code}));
      evt.target.removeEventListener('mouseup', mouseOffHandler);
      evt.target.removeEventListener('mouseout', mouseOffHandler);
      textarea.focus();
    };

    document.addEventListener('mousedown', (evt) => {
      mouseDownHandler(evt);
      evt.target.addEventListener('mouseup', mouseOffHandler);
      evt.target.addEventListener('mouseout', mouseOffHandler);
    });

    window.addEventListener('beforeunload', () => {
      localStorage.setItem(storedLanguageItem, this.lang);
    });
  }
}

export default Keyboard;
